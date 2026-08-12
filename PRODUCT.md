# LegalAId — Product Document

> Status: MVP planning baseline · Owner: product · Last updated: initial

## 1. Product vision

**LegalAId helps a person in India who is facing a legal problem for the first time understand what may be happening, what their rights are, and — most importantly — what to do next, in plain language they can actually read.**

It is a guided legal-assistance tool, not a chatbot. It walks the user through a structured journey:

**Problem → Understanding → Applicable Law → Evidence → Next Action → Document**

and it ends by producing a real, editable, exportable legal notice or complaint — the kind of document that otherwise costs money and courage to obtain.

The working principle: *knowing you have rights is not the same as knowing what to do on Monday morning.* LegalAId closes that gap.

## 2. Target users

### Primary persona: first-generation litigants

People in India with no family or professional experience of the legal system, who encounter a legal problem for the first time. They are often working-class or lower-middle-class, may be more comfortable in Hindi or a regional language than in formal legal English, and are intimidated by courts, lawyers, and legal documents.

Three representative personas (used throughout design and mock data):

| Persona | Profile | Typical problem |
|---|---|---|
| **Ravi** (labour) | 29, warehouse worker in Faridabad, ₹16,000/month, no written appointment letter | Employer hasn't paid wages for 3 months and is pressuring him to resign |
| **Sunita** (consumer) | 34, school teacher in Jaipur, bought a refrigerator online for ₹18,500 | Compressor failed twice within warranty; seller and brand both refuse repair/replacement |
| **Imran** (tenant) | 26, delivery rider in Bengaluru, rented a flat with a ₹30,000 deposit | Landlord refuses to refund the deposit after he moved out |

### Secondary users

- Family members or friends helping a first-generation litigant.
- Paralegals, NGO workers, and legal-aid volunteers who may use the document builder to draft first drafts of notices for their clients.

## 3. Core problem

- Legal help is expensive, intimidating, and opaque; most people give up before trying.
- People don't know *whether* they have a legal problem, *which* law applies, *what evidence* to preserve before it disappears, or *what the first action* should be.
- Generic AI chatbots give vague, uncited, sometimes hallucinated answers presented with false confidence.
- Writing a demand letter, legal notice, or complaint is a real barrier: people don't know the format, the tone, or what to include.
- Evidence is time-sensitive: the rental agreement, payment proof, and messages that exist today are gone in a month.

## 4. Product principles

1. **Understand before advising.** Structured intake builds a shared understanding of the user's situation before any analysis is shown. The user can correct our understanding at any time.
2. **Plain language first; law second.** Legal text is always accompanied by a plain-language explanation. Jargon is explained or avoided.
3. **Honesty about uncertainty.** Every claim is labeled: **FACT · POSSIBLE LEGAL ISSUE · LEGAL INFORMATION · AI INTERPRETATION**. We never present AI speculation as established law. We explicitly state what we don't know and what could change the answer.
4. **Action-oriented.** Analysis always ends in concrete next steps and a document. Understanding without action is incomplete.
5. **Evidence-first thinking.** Preserving proof is where a legal assistant genuinely saves a case. The evidence checklist is a working tool, not decoration.
6. **Language is first-class, not translated buttons.** The product architecture treats language as data: full typed dictionaries and per-language analysis content, architected so more Indian languages can be added later.
7. **Trust through transparency.** Legal sources are cited and versioned; demo/placeholder references are clearly flagged; a prominent disclaimer appears wherever legal information is shown. Never invent a legal section.
8. **Human-scale design.** Calm, civic, accessible. The product should feel like a well-designed government service run by people who care — not a corporate law firm and not an AI toy.

## 5. MVP scope

### In scope

- **Three domains:** Consumer, Labour, Tenant disputes — with realistic bilingual (English + Hindi) demo flows.
- **The full journey:** Home → intake → analysis → evidence → next steps → document builder → PDF export.
- **Structured clarifying questions** during intake (amount, dates, state, other party, evidence on hand) — optional and skippable.
- **Analysis page** with: what we understood, possible issues, possible rights, applicable law (Act · Section · plain explanation · why it may apply · source), and an uncertainty section.
- **Confidence labeling** (FACT / POSSIBLE ISSUE / LEGAL INFO / AI INTERPRETATION) throughout.
- **Interactive evidence checklist** (have / don't have / need to find).
- **Prioritized next steps** with effort, urgency, and rationale.
- **Document builder:** legal notice, consumer complaint, labour complaint formats — editable, savable, previewable, exportable as PDF.
- **English + Hindi** UI, with Hindi analysis content for demo cases.
- **Replaceable AI provider** — mock provider now, with a clean interface for API/local/fine-tuned/RAG providers later.
- **Versioned legal-source registry** with verified vs. demo flags.

### Out of scope (MVP)

- Criminal, family/divorce, property-ownership, and corporate disputes.
- Actual fine-tuning or training of the model (adapter layer only).
- Backend, database, accounts, or payments (client-only MVP; seams exist for later).
- Lawyer matching, case tracking, court filing, or representation.
- Regional languages beyond Hindi (architecturally supported, not shipped).

## 6. Non-goals (explicitly)

- **Not legal advice.** LegalAId provides general legal information. It never creates a lawyer–client relationship, and it never claims to.
- **Not a chatbot.** No generic conversational UI; the experience is a guided flow.
- **Not a prediction engine.** We do not predict case outcomes or court results.
- **Not a document factory.** Documents are generated as helpful first drafts for the user's own use or to bring to a professional — not as filings.
- **No social proof.** No testimonials, no "trusted by thousands," no startup-metrics marketing.
- **No state-court inventory.** We do not track every state's rent-control statute; where state law matters, we say so honestly and flag it as guidance.

## 7. Legal citation policy (mandatory)

Applies to all content, mock or real:

1. **Never invent a legal section.** Every citation must come from this repo's legal-source registry (`lib/legal/sources.ts`).
2. Every source entry carries `verified: true | false`:
   - `verified: true` — the Act/Code and section number are real and confirmed (e.g., Consumer Protection Act 2019, §35).
   - `verified: false` — demo/placeholder guidance (e.g., "your state's Rent Control Act — check with the State Legal Services Authority"); rendered in the UI with a "demo / verify with an expert" tag.
3. All legal information is general, time-sensitive, and state-dependent; the disclaimer accompanies it.
4. The registry is versioned so future updates are traceable to a legal-data version.

## 8. Success measures (hackathon)

- A first-time user can go from "my landlord won't return my deposit" to a printable legal notice draft in under 5 minutes, without reading legal jargon.
- Every screen answers: *Where am I? What is known? What is uncertain? What do I do next?*
- A reviewer who knows nothing about Indian law understands their rights and next steps from the analysis page alone.
- Hindi and English flows are equally complete for the demo cases.
