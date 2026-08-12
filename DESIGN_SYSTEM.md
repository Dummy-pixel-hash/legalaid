# LegalAId — Design System

> Status: MVP baseline · Owner: design · Last updated: initial
> Visual direction is **locked**: *"A calm legal-aid desk that writes things down for you."*
> Drift guard: if a design choice reads as "generic AI SaaS" (gradients, glass, orbs, dark hero, pill-everything), it is wrong — rework it.

## 0. Direction contract

**THESIS** — LegalAId is the careful paralegal's desk, not a chat window: it takes your story down, works through it methodically, and hands you a real document. It refuses the category default (a chatbot with a legal prompt) and the civic-tool rut (a government-portal form wall).

**OWN-WORLD** — Cool paper white ground; near-black ink navy for type and primary actions; one restrained deep-teal accent used only for live state and interaction. IBM Plex Sans (Latin) + IBM Plex Devanagari for Hindi; hairline rules and numbered section labels as the organizing grammar; the document renders on paper in serif (Source Serif 4 / Noto Serif Devanagari). Small, precise, quiet.

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

### Strategy: **Restrained** (neutrals + one accent). This is an Operate/Read surface; the user came to understand and act, so calm wins. Color commits at region scale, not as scattered accents.

### Palette (cool paper, ink, one accent)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F7F5` | App background (cool paper) |
| `--surface` | `#FFFFFF` | Cards, sheets |
| `--surface-muted` | `#F0F0ED` | Muted blocks, skeletons |
| `--ink` | `#1A2433` | Primary text, primary button |
| `--ink-70` | `#46515F` | Secondary text |
| `--ink-50` | `#6B7583` | Tertiary text, placeholders |
| `--ink-30` | `#A6AEB8` | Disabled, hairlines-on-white |
| `--line` | `#E2E4E0` | Hairline borders |
| `--accent` | `#0E7A66` (deep teal) | Live state: active step, links, focus, checked |
| `--accent-ink` | `#0A5C4D` | Accent hover/pressed |
| `--accent-soft` | `#E4F1EE` | Accent tinted backgrounds (selected, tags) |

**Semantic status colors** (badges/states only, never as decorative accents):

| Role | Token | Usage |
|---|---|---|
| Fact / neutral | `#5B6472` bg `#EDEFF2` | FACT, neutral info |
| Possible / caution | `#8A5A00` bg `#FBF1DC` | POSSIBLE LEGAL ISSUE |
| Legal info | `#2B5B8C` bg `#E6EEF6` | LEGAL INFORMATION |
| AI interpretation | `#0E7A66` bg `#E4F1EE` | AI INTERPRETATION (dashed border) |
| Good / have | `#1E7A45` bg `#E6F4EB` | Evidence "Have it" |
| Find / need | `#8A5A00` bg `#FBF1DC` | Evidence "Need to find it" |
| Don't have | `#A3362B` bg `#FAEAE8` | Evidence "Don't have it" |
| Demo flag | `#6B4FA0` bg `#EFEBF6` | "Demo — verify with an expert" |

### Color rules
- Primary button is **ink** (near-black navy), not a saturated brand color — authority without shouting. Accent teal is for live/active/selected/links only.
- All badge text ≥ 4.5:1 on its bg (verified against the tokens above).
- No gradients anywhere except the paper sheet's subtle `#FFFFFF → #FDFDFC` for the document surface (barely perceptible).

## 4. Borders & radius

- Hairline `1px solid var(--line)` is the primary divider language. No heavy shadows as structure; elevation is a tool for sticky headers and the document sheet.
- Radius: **restrained**. `--radius-sm: 4px` (badges, inputs), `--radius-md: 6px` (buttons, cards), `--radius-lg: 10px` (large surfaces only — intake card, document sheet). No pill buttons (pills are AI-SaaS drift; document/anchor shapes are the identity).
- Focus: `2px` offset ring in `--accent` (not just an outline color change).

## 5. Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | `bg ink · text white · 6px radius · h44` | The one action on a screen (Understand, Continue, Download PDF) |
| Secondary | `1px line border · bg surface · text ink` | Alternative actions (Save, Preview) |
| Ghost | `text ink-70 · hover bg muted` | Inline actions (Edit my situation, Skip) |
| Link | `text accent · underline on hover` | Text links |
| Destructive (rare) | `border + text #A3362B` | Reset/delete (only in document toolbar, with confirm) |

- One primary per screen region. Primary never competes with an accent-colored element nearby.
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
