# LegalAId — Design System

> Status: MVP baseline · Owner: design · Last updated: initial
> Visual direction is **locked**: *"A calm legal-aid desk that writes things down for you."*
> Drift guard: if a design choice reads as "generic AI SaaS" (gradients, glass, orbs, dark hero, pill-everything), it is wrong — rework it.

## 0. Direction contract

**THESIS** — LegalAId is the careful paralegal's desk, not a chat window: it takes your story down, works through it methodically, and hands you a real document. It refuses the category default (a chatbot with a legal prompt) and the civic-tool rut (a government-portal form wall).

**OWN-WORLD** — Paper and seal. Warm paper surfaces (`#FBF8F1`) on a paper-shade mat (`#F1EAD6`), joined by paper-line hairlines (`#DED2AE`); near-black ink (`#1B2436`) type and primary action; **brass** (`#93732A`) for citations, links, and live state; **seal** red (`#9A3324`) reserved for the one consequential action — Download PDF. IBM Plex Sans / Devanagari for UI, Source Serif / Noto Serif Devanagari for the document. Small, precise, quiet, authoritative.

**STORY** — A first-time user understands instantly: this is a serious, trustworthy place that will explain their rights and tell them what to do next. They feel held, not lectured; guided, not interrogated.

**FIRST VIEWPORT** — Wordmark top-left, language switcher top-right. A single calm intake card on paper white: headline "Understand your rights. Know what to do next.", one sentence of plain explanation, a large textarea with a warm placeholder, one solid primary button ("Understand my situation"). Below the fold: example chips, three domain cards, the five-step how-it-works strip.

**FORM** — Numbered sections with small uppercase labels ("01 · Your situation") as the rhythm of the analysis page; the document sheet as the signature moment.

## 1. Typography

### Faces

| Role | Latin | Devanagari (Hindi) |
|---|---|---|
| UI | IBM Plex Sans (400/500/600) | IBM Plex Devanagari (400/500/600) |
| Document body | Source Serif 4 (400/600) | Noto Serif Devanagari (400/600) |

- Loaded via `next/font/google`, served locally, `font-family` swapped by active language via CSS variables (`--font-ui`, `--font-doc`).
- Weights: 400 body, 500 emphasis/labels, 600 headings & buttons. No weights below 400 and no 700 except numerals in documents.

### Scale (type ramp)

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `text-display` | 34 / 40 | 600 | Page h1 (home) |
| `text-h1` | 28 / 34 | 600 | Section page titles |
| `text-h2` | 20 / 26 | 600 | Block headings |
| `text-h3` | 16 / 22 | 600 | Card headings, law act names |
| `text-body` | 16 / 24 | 400 | Default text |
| `text-small` | 14 / 20 | 400 | Secondary text, card bodies |
| `text-xs` | 12 / 16 | 500 | Labels, badges, section markers |
| `text-doc` | 14.5 / 22 | 400 | Document body (serif) |

- Long-form explanation blocks use generous line height (24–26px) and a 66–75ch measure.
- Hindi text at same px sizes needs ~4px more line-height (Devanagari ascenders/descenders): apply `line-height` bump via a `[lang="hi"]` CSS variable override.

### Type rules
- No italic for emphasis; use weight + color.
- Section markers: `text-xs` uppercase, letter-spacing `0.08em`, ink-60.
- Numbers/amounts: `font-variant-numeric: tabular-nums` in tables and document.
- **Serif is the cover voice.** The document face (Source Serif 4 / Noto Serif Devanagari) is the system's signature: it sets the home hero title (the cover page of the file), the document sheet itself, and ledger page numbers (home journey, analysis numbers). Sans (IBM Plex) carries everything else. Never use serif for form inputs.

## 2. Spacing

4px base grid:

`--space-1: 4 · --space-2: 8 · --space-3: 12 · --space-4: 16 · --space-5: 20 · --space-6: 24 · --space-8: 32 · --space-10: 40 · --space-12: 48 · --space-16: 64 · --space-20: 80`

Rhythm rules:
- Between blocks on analysis page: `48px` (`--space-12`).
- Above a heading: more space than below (`16px` below h2, `40px` above it).
- Card internal padding: `20px` (`--space-5`), compact cards `16px`.
- Page gutter: `24px` mobile, `32px` desktop; content max-width `1040px`; document sheet max-width `760px`.
- Buttons/inputs min height `44px`.

## 3. Colors

### Strategy: **Restrained** (paper neutrals + brass lived state + one seal action). This is an Operate/Read surface; the visitor came to understand and act, so calm wins. Color commits at region scale, not as scattered accents.

### Palette (paper and seal)

| Token | Value | Use |
|---|---|---|
| `--background` | `#F1EAD6` (paper shade) | App background (mat) |
| `--surface` | `#FBF8F1` (paper) | Cards, sheets |
| `--surface-muted` | `#F4EEE0` | Muted blocks, skeletons |
| `--ink` | `#1B2436` | Primary text, primary buttons |
| `--ink-70` | `#535C71` (ink soft) | Secondary text |
| `--ink-50` | `#667084` (ink faint) | Tertiary text, placeholders |
| `--ink-30` | `#B6BCC8` | Disabled, hairline-on-line |
| `--line` | `#DED2AE` (paper line) | Hairline borders, dividers |
| `--paper-line-inactive` | `#E6DCC0` | Softer hairline within paper surfaces |
| `--accent` | `#705A1F` brass | Live state: active step, links, focus, checked |
| `--accent-hover` | `#5F4A1C` | Accent hover/pressed |
| `--accent-bg` | `#EFE6C9` (brass wash) | Accent/tinted backgrounds |
| `--seal` | `#9A3324` | Brand accent / important actions |
| `--seal-hover` | `#7F2A1E` | Seal pressed/hover |
| `--seal-soft` | `#C25C43` | Secondary red |
| `--seal-wash` | `#F3E2DA` | Warnings / safety tint |

**Semantic status colors** (badges/states only, never as decorative accents):

| Role | Token | Usage |
|---|---|---|
| Fact / neutral | `#535C71` bg `#EFEBDF` | FACT, neutral info |
| Possible / caution | `#9A3324` bg `#F3E2DA` | POSSIBLE LEGAL ISSUE (seal) |
| Legal info | `#705A1F` bg `#EFE6C9` | LEGAL INFORMATION (brass) |
| AI interpretation | `#6C4F1F` bg `#EFE6C9` | AI INTERPRETATION (brass wash, dashed border) |
| Good / have | `#2F5D4E` bg `#E1EBE5` | Evidence "Have it" (verified) |
| Find / need | `#9A3324` bg `#F3E2DA` | Evidence "Need to find it" (seal) |
| Don't have | `#9A3324` bg `#F3E2DA` | Evidence "Don't have it" (seal) |
| Demo flag | `#7A5F22` bg `#EFE6C9` | "Demo — verify with an expert" (brass) |

### Color rules
- Primary button is **ink** (`#1B2436`) — print, authority without shouting. The **only** important-action button styled seal-red is **Download PDF** (the payoff) — the single authorized bold move.
- **Brass** (`--accent`) is for legal citations, links, live state, and focus — never for big filled surfaces.
- **Bring your own paper:** surfaces use `#FBF8F1` paper on `#F1EAD6` paper-shade background; the document sheet is paper. Background/card contrast is intentional — a desk on a shaded mat.
- All badge/link/inline text ≥ 4.5:1 on its bg (verified: ink-50 `#667084` 4.7, brass `#705A1F` 6.2, seal `#9A3324` 6.9, AI `#6C4F1F` 7.1, verified `#2F5D4E` 6.2).
- **No gradients anywhere.** The document paper is flat `#FBF8F1` (white on print).

## 4. Borders & radius

- Hairline `1px solid var(--line)` is the primary divider language. No heavy shadows as structure; elevation is a tool for sticky headers and the document sheet.
- Radius: **restrained**. `--radius-sm: 4px` (badges, inputs), `--radius-md: 6px` (buttons, cards), `--radius-lg: 10px` (large surfaces only — intake card, document sheet). No pill buttons (pills are AI-SaaS drift; document/anchor shapes are the identity).
- Focus: `2px` offset ring in `--accent` (not just an outline color change).

## 5. Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `bg ink · text paper · 6px radius · h44` | The one action on a screen (Understand, Continue) |
| Seal | `bg seal #9A3324 · text white` | The single consequential action — **Download PDF** |
| Secondary | `1px line border · bg surface · text ink` | Alternative actions (Save, Preview) |
| Ghost | `text ink-70 · hover bg muted` | Inline actions (Edit my situation, Skip) |
| Link | `text accent · underline on hover` | Text links, legal citations |
| Destructive (rare) | `border + seal red text` | Reset/delete (only in document toolbar, with confirm) |

- One primary per screen region. Primary never competes with an accent-colored element nearby.
- **Seal is reserved for the payoff.** Only the Download PDF action uses it — one bold move per path.
- Disabled: `ink-30 text`, no shadow, still focusable-but-explained (with helper text rather than silent disable).

## 6. Inputs

- Height `44px`; radius `6px`; `1px line` border; focus ring `2px accent`.
- Labels: `text-small` 500 ink-70 above the field; helper text `text-xs` ink-50 below.
- Textarea (intake): min-height `140px`, `text-body`, generous padding `16px`.
- Errors: `#A3362B` text + `1px` error border + icon, with plain-language message ("Please tell us a little more, or pick an example").
- Placeholders are questions, not instructions ("e.g., My landlord hasn't returned my deposit…").
- Optional fields say "(optional)" — required fields are rare (only "describe your situation").

## 7. Cards

- Flat: `bg surface`, `1px line` border, `6px` radius, `20px` padding. No drop shadows by default.
- **Domain cards (home):** slightly larger padding, icon in a muted square, 2–3 example lines, "Start here →" link. Hover: border darkens to ink-30, arrow nudges.
- **The intake sheet (home hero):** the first sheet of the file — letterhead rule (`border-b-2 ink` under a filing row reading "Situation sheet · Step 1 of 5"), then the form body. Mirrors the document letterhead grammar.
- **The journey ledger (home):** the five steps render as a ruled contents table — serif page numbers (01–05), hairline dividers, a single direction arrow per row. Icons are omitted: the sequence is the content.
- **Law cards (analysis):** left accent hairline? No — keep flat; structure via type: Act name (h3) + section chip + plain explanation + "Why it may apply" + source tag row.
- **What we understood:** presented as a bordered block with a pencil icon action, not a card-with-shadow.
- Elevation (`shadow-sm`) reserved for: sticky stepper header, document toolbar, mobile bottom action bar.

## 8. Status indicators (confidence & evidence)

- Badge anatomy: icon + text label, `text-xs` 500, `--radius-sm`, 4px padding 6px horizontal.
- Confidence kinds (see UX §4.3) render as: **FACT** (neutral), **POSSIBLE LEGAL ISSUE** (caution), **LEGAL INFORMATION** (info), **AI INTERPRETATION** (accent tint + dashed border to signal "this is the assistant's reading").
- Evidence status: three-state segmented control per item (Have it / Don't have it / Need to find it) using radio-group semantics; selected state uses accent-soft bg + accent text.
- Icons: lucide — `Info`, `AlertTriangle`, `Scale`/`BookOpen` for law, `Sparkles` (small, understated) for AI interpretation, `ShieldAlert` for demo flag, `CheckCircle2` / `Circle` / `Search` for evidence states.

## 9. Icons

- lucide-react only; 16px in badges/buttons, 20px in cards, 24px in hero/domain.
- Icons carry labels where meaning matters (badges always include text).
- No brand icons, no emoji as UI icons (emoji is permitted nowhere in chrome; the analysis summary may quote user text verbatim).

## 10. Document UI

- **Sheet:** `760px` max width, `bg #FFFFFF` on `#F7F7F5` with a very subtle gradient + `shadow-sm`; inside, generous margins (`48px` sides).
- **Typography:** Source Serif 4 / Noto Serif Devanagari; title centered uppercase 16px 600; body `14.5/22`; numbered sections with small caps labels ("SUBJECT:", "PARTIES:").
- **Anatomy (all document types):** Title · Date · From party (name, address, contact) · To party · Subject line · Body sections (numbered) · Legal references (Act + Section list) · Requested remedy · Signature block (line + name + designation) · Footer disclaimer line in small caps.
- **Editor:** edit mode = bordered blocks with visible cursor affordances; preview mode = clean sheet. Toolbar (sticky above sheet): Edit/Preview, Save (with "Saved" confirmation), Download PDF, Copy text.
- **Print:** `@media print` shows only the sheet at `210mm` width, black text on white, margins `20mm`, hides toolbar/nav/stepper/footers. Download PDF = `window.print()`.

## 11. Responsive rules

- **Breakpoints:** mobile-first; `640 / 768 / 1024 / 1280`.
- **Mobile (< 640):** single column; stepper compresses to "Step 2 of 5 · Analysis" with a progress bar + prev/next; document toolbar becomes a sticky bottom bar (Save left, PDF right); domain cards stack; example chips wrap.
- **Tablet (768–1024):** domain cards 2-up; analysis blocks full width (reading quality beats columns).
- **Desktop (≥ 1024):** home two-column at hero (intake left, trust/sources right on scroll); analysis stays single column with sticky left rail showing section anchors at ≥ 1280 (optional, cosmetic).
- **Touch:** all interactive controls ≥ 44px; no hover-dependent content.
- **Text:** allow full-width Hindi; no fixed-height cards; `overflow-wrap` on long legal names.

## 12. Motion

- **Purposeful and minimal:** cross-fade between steps (`150ms`), analysis blocks reveal sequentially as stages resolve (`fade + 8px rise, 200ms`), stepper check animates once.
- **Loading:** skeletons are static muted blocks with a gentle pulse (1.6s), plus honest progress copy. No spinner-only theater.
- **`prefers-reduced-motion: reduce`** disables all transitions/animations; content appears instantly.

## 13. Anti-pattern list (drift guards)

❌ Gradients (except paper sheet) · ❌ Glassmorphism · ❌ Neon/saturated accents at scale · ❌ Floating AI orbs · ❌ Pill buttons everywhere · ❌ Giant rounded cards with heavy shadows · ❌ Stock illustrations · ❌ "AI-powered" marketing copy · ❌ Dark mode · ❌ Emoji in UI · ❌ Color-only status · ❌ Chat-bubble visual language · ❌ Huge gradient hero sections.
