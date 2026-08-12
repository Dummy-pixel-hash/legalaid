# LegalAId — UX Document

> Status: MVP planning baseline · Owner: design · Last updated: initial

## 1. Core UX principle

> "A person who has never dealt with a lawyer must always understand what to do here."

Every screen must answer four questions, in order:

1. **Where am I?** (visible step in the journey)
2. **What is known?** (what the user told us, stated back clearly)
3. **What is uncertain?** (what could change the answer — labeled honestly)
4. **What should I do next?** (the one clear action on this screen)

## 2. The journey

```
HOME
 │  choose / describe your problem (one sentence or a paragraph)
 ▼
INTAKE          — describe situation + optional clarifying questions
 ▼
ANALYSIS        — what we understood · possible issues · possible rights
                — applicable law (Act · Section · why) · what we're unsure about
 ▼
EVIDENCE        — interactive checklist: have / don't have / need to find
 ▼
NEXT STEPS      — prioritized, actionable, honest
 ▼
DOCUMENT        — edit → preview → save → export PDF
```

The five product steps map to routes as:

| # | Step | Route |
|---|---|---|
| 1 | Your situation | `/intake` |
| 2 | Analysis | `/case/[id]/analysis` |
| 3 | Evidence | `/case/[id]/evidence` |
| 4 | Next steps | `/case/[id]/next-steps` |
| 5 | Document | `/case/[id]/document` |

A persistent **stepper** in the case shell shows all five steps; completed steps are checkmarked and clickable. The user can always go back and change their intake, which re-runs the analysis.

## 3. Information architecture

```
/                       Home — identity, intake entry, domain cards, examples, how-it-works, trust
/intake                 Step 1 — describe + clarifying questions
/case/[id]/analysis     Step 2 — the legal brief
/case/[id]/evidence     Step 3 — evidence checklist
/case/[id]/next-steps   Step 4 — actions
/case/[id]/document     Step 5 — document editor + export
/legal                  Trust: sources, disclaimer, how LegalAId works in detail
```

- Case state lives in a client store (`CaseProvider`), persisted to localStorage, keyed by case id.
- Deep links: `/intake?demo=deposit` prefills a scenario; `/case/demo-consumer` etc. open fully-worked demo cases for instant walkthroughs.
- No global nav complexity: header = wordmark, language switcher, "About / Legal info" link. The stepper is the primary navigation inside a case.

## 4. Page-by-page UX

### 4.1 Home (`/`)

**Goal:** in one viewport, communicate *"Understand your rights. Know what to do next."* and get the user typing.

- **Hero + intake:** one calm block. Headline ("Understand your rights. Know what to do next."), one plain-language sentence about what the tool does, and a large textarea: *"Tell us what happened, in your own words."* A single primary button: **"Understand my situation"**.
- **Example chips:** 4–5 clickable real-world examples ("My landlord hasn't returned my ₹30,000 deposit", "My employer hasn't paid my salary for 3 months") — clicking fills the textarea.
- **Domain entry cards:** Consumer / Labour / Tenant. Each card: plain-language description, 2–3 example problems, "Start here" → opens intake with the domain preselected. Cards are substantial, not decorative tiles.
- **How LegalAId works:** a 5-step horizontal strip (Situation → Analysis → Evidence → Next steps → Document), each with one line.
- **Sources & trust:** "Where the legal information comes from" — real cited laws, flagged demo data, the disclaimer. Also a note: LegalAId is free, general information, not a substitute for legal advice.
- **Language switch:** prominent (top-right, and near intake for Hindi-dominant users).
- **No** testimonials, no features grid, no "revolutionary AI" copy, no giant gradient.

### 4.2 Intake (`/intake`)

**Goal:** capture the situation with minimum friction, then fill gaps conversationally.

- **Stage A — Describe:** textarea + optional structured fields in a collapsible "Add details (optional)": domain (if not detected), state, amount, other party, key dates. *Not required.*
- **Stage B — Clarifying questions:** after submit, the (mock) provider detects the domain and asks **1–4 targeted questions** for genuinely missing information ("Around how much is the deposit?", "Do you have a written rental agreement?"). Each question is a small typed field (text / number / date / yes-no). Each has **"Skip"**. A summary of what will be analyzed is shown ("We'll check: whether your deposit must be refunded…").
- **Progress reassurance:** "This takes about 2 minutes. Nothing is saved to any server."
- Submitting creates a case and routes to the analysis page, which loads with staged skeletons.

### 4.3 Analysis (`/case/[id]/analysis`)

**Goal:** the core artifact — a calm, scannable legal brief in plain language.

Page order (blocks top to bottom):

1. **What we understood** — a short restatement of the situation (FACT), with an "Edit my situation" action that returns to intake with context preserved.
2. **Possible legal issues** — plain-language issue labels, each with 1–2 lines of explanation and a **POSSIBLE LEGAL ISSUE** badge. E.g., *"Security deposit withheld without reason"*.
3. **Your possible rights** — simple right statements ("You may have the right to have your deposit refunded…") with links to the laws below.
4. **Applicable law** — a list of law cards, each showing:
   - Act name + section number + short title
   - Plain-language explanation ("what this section actually means")
   - "Why it may apply to you"
   - Source tag (`verified` / `demo — verify with an expert`) + reference indicator
5. **What we're unsure about** — honest list ("Whether your state's rent act applies; whether you can prove there was no damage"). Each uncertain point explains what would change the answer and how the user can find out.
6. **Disclaimer banner** — always present.

Every claim carries a **confidence badge** (see DESIGN_SYSTEM status indicators). Loading is staged and honest: block-by-block skeletons with copy like "Reading your situation… / Checking applicable laws…". No fake "thinking" spinner theater; real sequential steps with real text.

### 4.4 Evidence (`/case/[id]/evidence`)

**Goal:** a working checklist, prioritized by importance.

- Each item: label, one-line "why it matters", a status control (**Have it / Don't have it / Need to find it**), and a note field.
- Progress summary at top: "3 of 6 items you already have · 2 to find".
- Guidance line: "Screenshots and messages count — take them before they disappear."
- Items are ordered by importance, not alphabetically. Status is persisted.

### 4.5 Next steps (`/case/[id]/next-steps`)

**Goal:** a clear, ordered, honest action plan.

- Numbered steps with: title, 1–2 line plain explanation, effort tag (Quick / Moderate / Long), and urgency flag ("Do this within a week") where warranted.
- Each step explains **why** ("A written demand creates a record and often resolves the dispute without a case").
- A closing note: "These are general suggestions. If the dispute isn't resolved, a lawyer or the State Legal Services Authority can tell you what fits your situation."
- Leads into: "Next: generate your legal notice →"

### 4.6 Document (`/case/[id]/document`)

**Goal:** a professional-looking, editable, exportable document.

- **Document sheet:** paper-like surface, serif type, proper document anatomy — title (e.g., "LEGAL NOTICE"), date, parties (From / To), subject line, numbered body sections, legal references, requested remedy, signature block with name + designation placeholder.
- **Toolbar:** Edit / Preview toggle · Save (persisted) · Download PDF · "Copy text".
- **Edit mode:** each section is an inline-editable block; changes update the preview live. A side panel offers suggested alternative wording from the provider.
- **Preview mode:** clean final look.
- **Export:** Download PDF opens the print dialog with a dedicated print stylesheet (document only — no nav, no stepper; letterhead line, margins, serif). Print stylesheets are the PDF pipeline: reliable, offline, zero dependencies.
- **Language:** the document is generated in the user's current language; the toggle between Hindi/English notices is available.

### 4.7 Legal info (`/legal`)

Static trust page: what LegalAId is and isn't, how legal sources are maintained and flagged, the disclaimer, contact paths (NALSA helpline 15100, State Legal Services Authority), and a note that the current build uses demo data clearly labeled.

## 5. Important states

| State | Behavior |
|---|---|
| **First visit** | Home; language defaults to browser preference (en/hi), switchable everywhere |
| **Intake — empty** | Helpful placeholder text + example chips; no form wall |
| **Analyzing** | Staged skeletons per analysis block, honest progress copy, `aria-live` announcements; block reveals as each stage resolves |
| **Analysis — no domain detected** | Fallback: general guidance + "which of these sounds closest?" selector instead of a fake confident answer |
| **Error (provider failure)** | Calm error card: what happened, Retry, and "Show general guidance instead" fallback — never a blank page |
| **Evidence — all marked** | Positive but factual confirmation ("You've reviewed your evidence. Next: your action plan →") |
| **Document — unsaved edits** | Inline "Unsaved changes" indicator; Save persists to localStorage |
| **Print / PDF** | Print stylesheet renders only the document; after close, return to app state intact |
| **Offline** | Mock provider works fully offline (all data local) — a genuine MVP advantage, noted in the UI as "works on your device" |

## 6. Hindi / English considerations

- **Language is data, not translation:** a typed dictionary (`lib/i18n`) covers UI chrome; analysis/document content is authored per-language in the provider's mock data.
- **Fonts:** Devanagari uses IBM Plex Devanagari; mixing Latin numerals/₹ into Devanagari text must render correctly (font fallbacks handle it; test "₹30,000" inside Hindi sentences).
- **Direction and layout:** both languages LTR; Hindi strings are often longer — avoid fixed-width buttons, keep generous container widths, and test truncation.
- **Bilingual code-switching:** real users mix scripts ("deposit wapas nahi diya"). Intake must accept mixed-script input without complaint; domain detection treats both scripts equally.
- **Locale-aware formatting:** numbers and dates render in the active language; rupee amounts keep ₹ symbol.
- **Extensibility:** adding a language = new dictionary file + optional per-language provider content. The language type is a closed union now, trivially widened later.
- **Default:** respect browser language for first visit; persist explicit choice; never re-ask.

## 7. Accessibility considerations

- **Semantics:** real landmarks (`header`, `main`, `nav`, `footer`), one `h1` per page, logical heading order.
- **Keyboard:** full tab order through stepper, checklist, editor; visible focus rings; no keyboard traps.
- **ARIA:** stepper exposes `aria-current`; analysis loading uses `aria-live="polite"` status; checklist uses real checkboxes/radio semantics; badges are text (icon + label), never color-only.
- **Contrast:** AA minimum for all text; badge text and accent colors chosen for contrast on paper-white.
- **Reduced motion:** all transitions/animations respect `prefers-reduced-motion`.
- **Touch:** minimum 44px targets for checklist controls and stepper on mobile.
- **Language:** `<html lang>` updates with the selected language; `lang` attribute on any content that differs.
- **Cognitive load:** plain words, short sentences, one idea per screen; "Skip" on every optional question; no legal jargon without explanation; numbers over ranges where possible ("around ₹30,000").
- **Resilience:** generous target sizes, no hover-dependent information, no right-aligned controls.
