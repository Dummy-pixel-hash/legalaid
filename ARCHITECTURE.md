# LegalAId — Architecture

> Status: MVP baseline · Owner: engineering · Last updated: initial

## 1. Principles

- **Simple, maintainable, boring.** Client-only Next.js app; no backend, DB, or ORM for the MVP.
- **Structured data, not scattered text.** Every screen renders from typed domain objects. Components never contain legal content.
- **Seams before scale.** The AI provider, legal sources, and document generation are interfaces now; real implementations plug in later without touching UI.
- **Honesty is data.** Confidence labels, verified flags, and disclaimers are part of the data model, not UI decoration.

## 2. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Primitives | shadcn/ui (Radix), lucide-react icons |
| State | React Context + `useReducer`, persisted to `localStorage` |
| Fonts | `next/font/google` (IBM Plex Sans/Devanagari, Source Serif 4, Noto Serif Devanagari) |
| PDF | Dedicated print stylesheet + `window.print()` |
| Package manager | pnpm |

## 3. Directory layout

```
app/
  (site)/page.tsx                    Home
  intake/page.tsx                    Step 1 — describe + clarifying questions
  case/[caseId]/layout.tsx           Case shell (stepper, header, footer)
  case/[caseId]/analysis/page.tsx    Step 2 — the brief
  case/[caseId]/evidence/page.tsx    Step 3 — evidence checklist
  case/[caseId]/next-steps/page.tsx  Step 4 — actions
  case/[caseId]/document/page.tsx    Step 5 — document editor + export
  legal/page.tsx                     Trust page
components/
  ui/                                shadcn primitives (button, card, input, …)
  shell/                             AppHeader, CaseStepper, AppFooter, LanguageSwitcher
  home/                              HeroIntake, DomainCards, ExampleChips, HowItWorks, TrustSection
  intake/                            SituationForm, ClarifyingQuestions, IntakeSummary
  analysis/                          UnderstandingBlock, IssuesBlock, RightsBlock, LawsBlock,
                                     UncertaintyBlock, LawCard, ConfidenceBadge, SourceTag, DisclaimerBanner
  evidence/                          EvidenceChecklist, EvidenceItem, EvidenceProgress
  steps/                             NextStepsList, StepItem
  document/                          DocumentEditor, DocumentPreview, DocumentToolbar, PrintDocument
  shared/                            Skeleton, EmptyState, ErrorState, SectionHeader
lib/
  types/domain.ts                    The typed domain contract (below)
  types/providers.ts                 Provider interface
  i18n/                              types.ts, en.ts, hi.ts, provider.tsx, useI18n.ts
  providers/                         legal-analysis.ts (interface), mock-provider.ts, index.ts (factory)
  legal/sources.ts                   Versioned legal-source registry + disclaimer constants
  mock/demo-cases.ts                 Realistic bilingual demo cases (en + hi)
  store/case-store.tsx               CaseProvider (state, persistence)
  pdf/print.ts                       Print helpers
```

## 4. Domain types (the contract)

`lib/types/domain.ts` — the shape every provider must produce and every screen consumes:

```ts
type Domain = "consumer" | "labour" | "tenant";
type Language = "en" | "hi";
type ConfidenceKind = "fact" | "possible-issue" | "legal-info" | "ai-interpretation";

interface IntakeData {
  description: string;            // free text, mixed scripts allowed
  domain?: Domain;                // optional; provider may detect
  state?: string;
  otherParty?: string;
  amount?: number;
  dates?: { label: string; date?: string }[];
  evidenceOnHand?: string[];
  answers?: Record<string, string>; // clarifying answers keyed by question id
}

interface SourceRef {
  name: string;                   // e.g., "Consumer Protection Act, 2019"
  type: "act" | "code" | "rule" | "guideline" | "state-law";
  ref: string;                    // e.g., "§35"
  url?: string;                   // official source when available
  verified: boolean;              // STRICT: never silently true
  note?: string;                  // e.g., "state adoption varies"
}

interface LawReference {
  id: string;                     // key into lib/legal/sources.ts
  act: string;
  section: string;
  title: string;                  // short human title
  plainExplanation: string;       // what it means in plain words
  whyApplies: string;             // why it may apply to this case
  source: SourceRef;
}

interface EvidenceItem {
  id: string;
  label: string;
  why: string;                    // why it matters
  status: "have" | "dont-have" | "need-to-find" | "unset";
  note?: string;
}

interface Step {
  id: string; order: number;
  title: string; plain: string; why: string;
  effort: "quick" | "moderate" | "long";
  urgent?: boolean;
}

interface DocumentSection { heading: string; body: string; }
interface DocumentData {
  type: "legal-notice" | "consumer-complaint" | "labour-complaint" | "other";
  title: string; date: string;
  fromParty: string; toParty: string; subject: string;
  sections: DocumentSection[];
  legalReferences: string[];      // "Act, §X — title"
  remedy: string;
  signature: { name: string; role: string };
  language: Language;
}

interface CaseAnalysis {
  id: string; language: Language; domain: Domain;
  caseSummary: string;            // restated understanding (FACT)
  facts: string[];
  issues: { id: string; label: string; kind: ConfidenceKind; detail: string }[];
  rights: { id: string; title: string; plain: string; linkedLaws: string[] }[];
  laws: LawReference[];
  uncertainty: { id: string; plain: string; changesAnswer: string; resolve: string }[];
  evidence: EvidenceItem[];
  nextSteps: Step[];
  document: DocumentData;
  disclaimer: string;             // from lib/legal/disclaimers
  generatedAt: string;
}
```

## 5. Data flow

```
Intake form ──► IntakeData
        │
        ▼
LegalAnalysisProvider.analyze(intake, lang)
        │  (mock: merges canned structured content with user facts,
        │   staged delays → emits per-block progress events)
        ▼
CaseAnalysis ── stored in CaseProvider (useReducer + localStorage)
        │
        ├── /analysis    renders blocks from analysis.*
        ├── /evidence    renders + mutates analysis.evidence[].status
        ├── /next-steps  renders analysis.nextSteps
        └── /document    edits analysis.document (persisted), exports via print
```

- **CaseProvider** owns: `intake`, `analysis`, `analysisStatus` (`idle | analyzing | ready | error`), `progress` (which block resolved), `evidence` status mutations, `document` edits, `language`.
- **Persistence:** one localStorage key per case id (`laid.case.<id>`). Demo cases hydrate from `lib/mock/demo-cases.ts` and are never persisted over (fresh demo on every load unless the user edited it).
- **URLs as state:** `?demo=` prefills intake; `/case/demo-*` deep-link directly to worked analyses. No server state.

## 6. AI provider abstraction

`lib/providers/legal-analysis.ts`:

```ts
export interface LegalAnalysisProvider {
  id: string;
  /** Full analysis for an intake. Progress callback enables staged UI. */
  analyze(intake: IntakeData, lang: Language, onProgress?: (p: Progress) => void): Promise<CaseAnalysis>;
  /** Regenerate a document (used when language or sections change). */
  generateDocument(ctx: { analysis: CaseAnalysis; lang: Language; edits?: Partial<DocumentData> }): Promise<DocumentData>;
}

export interface Progress {
  stage: "reading" | "issues" | "rights" | "laws" | "evidence" | "steps" | "document";
  pct: number;
}
```

`lib/providers/index.ts` — factory:

```ts
export function getProvider(): LegalAnalysisProvider {
  switch (process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock") {
    case "mock": return new MockLegalAnalysisProvider();
    // case "api":  return new ApiProvider(...);    // future
    // case "local": return new LocalModelProvider(...); // future
    // case "rag":  return new RagProvider(...);    // future
    default: return new MockLegalAnalysisProvider();
  }
}
```

**MockLegalAnalysisProvider** (`lib/providers/mock-provider.ts`):

- Holds per-domain *templates* in `en` and `hi`, referencing legal sources by id.
- Injects the user's facts (amounts, dates, names, state) into summaries, why-applies text, and the document.
- Emits staged `Progress` events with small realistic delays (e.g., 500–1200ms per stage) so the loading UI is real, not theater.
- Falls back to a **generic guidance** analysis when the domain can't be detected (marked `ai-interpretation`), rather than guessing confidently.

**Future providers** (designed, not built):

- **Local model:** WebGPU/Transformers.js in-browser; same interface.
- **Fine-tuned model:** the templates become training data; provider output identical in shape (this is why structured templates matter — they become the schema of training examples).
- **RAG pipeline:** provider fetches from `lib/legal/sources.ts`-backed vector store; `LawReference` gets `retrievedFrom`/`confidence` fields.

**API model** (built, `lib/providers/api-provider.ts`): same interface, server
routes (`app/api/analyze/route.ts`, `app/api/document/route.ts`) calling a
hosted llama.cpp backend; the client keeps identical UI. The interface also
covers the **case-aware assistant**: `askAssistant` (streaming Q&A grounded in
the user's own case, via `app/api/assistant/route.ts` mode `chat`) and
`reviseDocument` (grammar-constrained letter revisions, mode `document`). The
assistant's prompt is grounded in the registry law sources the server resolves
by domain — it can only reference law already established for the case.

## 7. Legal data abstraction

`lib/legal/sources.ts` — a **versioned registry**, the single source of truth for citations:

```ts
export const LEGAL_SOURCES_VERSION = "2025.1";
export interface LegalSource { id, act, section, title, verified, source, note?, lang?: {en, hi} }

export const LEGAL_SOURCES: LegalSource[] = [ /* all citations used anywhere */ ];
```

Rules (from PRODUCT.md §7):

1. Every citation in every analysis/document resolves by id to this registry.
2. `verified: true` only for real, confirmed Act/Code + section (verified list below).
3. `verified: false` for anything uncertain/state-specific — UI renders these with the **"Demo — verify with an expert"** tag and never asserts them as law.
4. Versioned: bump `LEGAL_SOURCES_VERSION` when citations change; persisted cases record which version produced them.

### Verified source set (MVP)

All marked `verified: true`; `note` flags time-sensitivity/state adoption where relevant:

- **Consumer Protection Act, 2019** — §§2(7) consumer; 2(42) unfair trade practice; 35 complaint to District Commission; 39 reliefs; 72 penalty for false/misleading ads.
- **Consumer Protection (E-Commerce) Rules, 2020** — Rule 4 (duties of e-commerce entities), Rule 6 (duties of sellers on marketplace), Rule 7 (duties of sellers on inventory model) — note: "as amended; verify current text".
- **Transfer of Property Act, 1882** — §§105 (lease), 106 (duration/termination), 108 (rights/liabilities of lessor & lessee), 111 (determination of lease).
- **Indian Contract Act, 1872** — §73 (compensation for breach), §74 (stipulated compensation).
- **Payment of Wages Act, 1936** — §§4 (wage period), 5 (time of payment), 6 (deductions). Note: superseded in states where Code on Wages is operationalized.
- **Code on Wages, 2019** — §§17 (time limit for payment), 18 (payment of full wages), 21 (deductions). Note: consolidated law; state rules vary; Payment of Wages Act may still apply where not operationalized.
- **Minimum Wages Act, 1948** — §12 (payment of minimum rates), §20 (claims).
- **Industrial Disputes Act, 1947** — §§2A (individual disputes), 10 (reference to tribunals), 25F (retrenchment conditions), 33C(2) (recovery of money due).
- **EPF & MP Act, 1952** — §7A (determination of moneys due), §14 (penalties).
- **Payment of Gratuity Act, 1972** — §4 (gratuity on 5+ years' service — cited as "not applicable" where relevant, to demonstrate honest negative reasoning).

### Demo/placeholder (verified: false)

- **Model Tenancy Act, 2021** — deposit refund provisions (advisory model law; not binding unless adopted by the state) — **demo tag**.
- **State Rent Control Acts** — "your state's rent act (e.g., Delhi Rent Act, Karnataka Rent Act)" — **demo tag** + "check with State Legal Services Authority".
- Anything else not listed above is demo content with the tag.

### Disclaimers

`lib/legal/disclaimers.ts` exports `DISCLAIMER_EN`, `DISCLAIMER_HI` (general legal information; not legal advice; no lawyer–client relationship; laws vary by state and change; NALSA helpline 15100). Every analysis page and every document footer renders the disclaimer for the active language.

## 8. Document generation abstraction

- The provider owns document **content** (structured `DocumentData`); the UI owns **rendering** (sheet + editor) and **export** (print).
- Edits: user edits `DocumentData` in the store; "Regenerate wording" requests alternative phrasing from the provider for a section (mock: returns a templated variant).
- Export: `lib/pdf/print.ts` triggers `window.print()`; `@media print` renders only the sheet. Future: swap in a server-side PDF service behind the same button without UI change.

## 9. Future RAG integration

- `lib/legal/sources.ts` becomes the seed corpus; embeddings + vector store replace/augment the registry lookup.
- `LawReference` gains `retrievedFrom` and retrieval `confidence`; UI already renders per-source tags, so presentation is unchanged.
- Provider interface unchanged: `analyze()` may internally query sources.

## 10. Future fine-tuned model integration

- The structured templates in `mock-provider.ts` are the **training schema**: (intake, clarifying questions, analysis blocks, laws, evidence, steps, document) pairs in en+hi.
- A fine-tuned model implements the same `LegalAnalysisProvider` interface; UI is untouched.
- Confidence labeling: the model emits `kind` per claim; a post-processor validates citations against the registry (never trust model-sourced section numbers — resolve ids, reject unknown ones).

## 11. Testing & quality (lightweight for MVP)

- `tsc --noEmit` in CI; ESLint via Next defaults.
- Component smoke tests for the four analysis blocks + document editor (Vitest + Testing Library), keeping the contract honest.
- Manual acceptance checklist per milestone (see ROADMAP.md).
