---
name: LegalAId — Paper & Seal
description: A calm legal-aid desk that writes things down for you — warm paper, ink, brass citations, one seal-red action.
colors:
  paper: "#FBF8F1"
  paper-shade: "#F1EAD6"
  paper-line: "#DED2AE"
  ink: "#1B2436"
  ink-soft: "#535C71"
  ink-faint: "#667084"
  brass: "#93732A"
  brass-deep: "#705A1F"
  brass-wash: "#EFE6C9"
  seal: "#9A3324"
  seal-hover: "#7F2A1E"
  seal-soft: "#C25C43"
  seal-wash: "#F3E2DA"
  verified: "#2F5D4E"
  verified-wash: "#E1EBE5"
typography:
  display:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Devanagari, sans-serif"
    fontSize: "clamp(34px, 4.75vw, 46px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "0.01em"
    textTransform: "uppercase"
  title:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Devanagari, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Devanagari, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Devanagari, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  labelSerif:
    fontFamily: "Source Serif 4, Noto Serif Devanagari, serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.02em"
    textTransform: "none"
  doc:
    fontFamily: "Source Serif 4, Noto Serif Devanagari, serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  button-seal:
    backgroundColor: "{colors.seal}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: "44px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
  card-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

# Design System: LegalAId — Paper & Seal

## Overview

**Creative North Star: "The Paper & Seal Legal-Aid Desk"**

LegalAId looks and behaves like a calm legal-aid desk that writes things down for you. A first-generation litigant sits at a warm paper surface, describes a problem in plain words, and is guided — sheet by sheet — to a real document they can hold. The interface is a filing system: the home hero is the cover page (serif title, "situation sheet" intake), the journey is a ruled contents ledger, the analysis is a numbered brief, and the document is a letterheaded paper sheet.

The palette is ink on paper with two disciplined accents: **brass** for the law itself (citations, links, live state) and **seal** red for the one consequential action (Download PDF). Everything else is quiet: hairline paper-line borders, restrained 4–10px radii, IBM Plex sans for work, Source Serif for documents. The density is comfortable, the voice is plain and human, and the whole product runs on the honest distinction between fact, possible issue, legal information, and AI interpretation.

**Key Characteristics:**
- Warm paper surfaces (`#FBF8F1`) on a paper-shade mat (`#F1EAD6`); cards are never pure white.
- Hairline paper-line borders (`#DED2AE`) as the primary divider; one ambient shadow only (intake sheet, sticky toolbar, document sheet).
- Two accents with strict roles: brass (`#93732A`) for citations/links/live state; seal (`#9A3324`) for the single important action.
- Serif is the "document voice": situation-sheet label, ledger numerals, and the document sheet; the hero cover title is Plex Sans semibold uppercase.
- Numbered sections carry journey order (the analysis brief); no decorative numbering elsewhere.

## Colors

A warm paper-and-ink legal world with two strictly-scoped accents. All text pairs verified AA (≥4.5:1) on their surfaces.

### Primary
- **Seal Red** (`#9A3324`): the brand's voice of consequence. Used for the single important action — **Download PDF** — plus warnings/safety (seal wash `#F3E2DA`) and caution badges. Rarity is its power.
- **Brass** (`#93732A`): the law's color. Legal citations, links, focus ring, live stepper state. Deepened to `#705A1F` where small text needs AA on paper. Brass wash (`#EFE6C9`) tints AI/legal-info badges and selected chips.

### Secondary
- **Verified Green** (`#2F5D4E`, wash `#E1EBE5`): completed/verified states — evidence "Have it", verified legal sources. (The green of a seal-stamp of approval, not of go.)

### Neutral
- **Paper** (`#FBF8F1`): cards, sheets, popovers.
- **Paper Shade** (`#F1EAD6`): the app background mat behind cards.
- **Paper Line** (`#DED2AE`): hairlines, dividers, borders.
- **Ink** (`#1B2436`): primary text and primary buttons.
- **Ink Soft** (`#535C71`): secondary text.
- **Ink Faint** (`#667084`): metadata, hints, placeholders (AA-passing).

### Named Rules
**The One-Seal Rule.** Seal red appears on exactly one action per path — the consequential one. Download PDF is seal; Understand, Continue, Save, Preview are ink or paper. Two seal-red buttons on one screen is a system failure.

**The Brass-Rarity Rule.** Brass marks the law and the live state: citations, links, active steps, focus. It never fills a large surface. A brass hero section would read as another civic portal.

**The No-White-Cards Rule.** Surfaces are paper, not white. Pure white appears only on the printed document (print stylesheet).

## Typography

**Display Font:** Source Serif 4 (with Noto Serif Devanagari for Hindi)
**Body Font:** IBM Plex Sans (with IBM Plex Sans Devanagari for Hindi)
**Document Font:** Source Serif 4 / Noto Serif Devanagari

**Character:** A print-and-paper pairing. Serif carries formality and the promise of documents; Plex Sans carries calm, legible work. Hindi gets its own faces in the same families, swapped by `<html lang>`.

### Hierarchy
- **Display** (600, clamp 34→46px, 1.12, uppercase, +0.01em): the home hero title — Plex Sans semibold uppercase. Live-accepted desk-form voice; serif is reserved for the situation-sheet label and documents.
- **Headline** (600, 28px, 1.25): page titles (Analysis, Evidence, Next steps, Document).
- **Title** (600, 20px): block/card headings; law act names.
- **Body** (400, 16px, 1.5): default text; measure capped at ~66ch on reading pages (max-w-3xl).
- **Label** (500, 12px, +0.08em, uppercase): section markers, eyebrow, filing rows.
- **Doc** (400, 14.5px, 1.55): the document sheet body — serif, justified by letterhead.

### Named Rules
**The Serif-Rule.** Serif is the document voice and nothing else: the situation-sheet label, journey ledger numerals, and the document sheet. The hero cover title is sans uppercase; form inputs, buttons, and navigation are always sans.

## Layout

The shell is a `max-w-5xl` column (header, stepper, footer). Reading pages (intake, analysis, evidence, next steps) run at `max-w-3xl` for measure. The document sheet is `max-w-[760px]` paper. Spacing follows a 4px grid with generous section rhythm: ~48px between analysis blocks, more space above headings than below. Mobile collapses the stepper to "Step 2 of 5" + a progress bar with prev/next arrows; grids (domain cards, evidence) drop to single column below 640px.

**The Filing System.** The journey is real: Situation sheet → Analysis brief → Evidence checklist → Next steps → Document. Screens and markers carry this order; a user always knows which sheet of the file they are on.

## Elevation & Depth

**Flat by default, lifted only where the user holds something.** The world is tonal layering: paper cards on a paper-shade mat with 1px hairlines — no drop shadows at rest. Three exceptions carry one ambient shadow each: the home intake sheet, the sticky document toolbar, and the document sheet itself.

## Shapes

Radius is restrained and consistent: **sm 4px** (badges, tags, chips), **md 6px** (buttons, inputs, cards), **lg 10px** (large surfaces only — intake card, document sheet). Borders are 1px paper-line hairlines; the document letterhead and home "situation sheet" use a 2px ink rule as the signature line. No pill buttons, no glass, no heavy corner rounding — the geometry stays print-like.

## Components

### Buttons
- **Shape:** 44px height, 6px radius, no shadow, `focus-visible` 3px brass ring at 50%.
- **Primary:** ink background (`#1B2436`), paper text (`#FBF8F1`), hover 90% opacity. The one action per screen region.
- **Seal:** seal background (`#9A3324`), white text — reserved for Download PDF (The One-Seal Rule).
- **Secondary / Ghost / Link:** bordered paper / quiet hover / brass link. Destructive is seal-tinted text with confirm.
- **Disabled:** ink-faint text, no shadow; helper text explains rather than silent-disable.

### Inputs & Textareas
- **Style:** paper background, 1px paper-line border (input tokens `#D8CBA6` at rest), 44px height, 6px radius.
- **Focus:** 2px brass ring (`--ring #93732A` at 50%) + border shift — the law is looking.
- **Placeholder:** ink-faint (`#667084`), phrased as a question, ≥4.5:1.

### Chips (example scenarios)
- **Style:** paper background, 1px paper-line border, ink-soft text, 6px radius, ~28px height.
- **State:** hover darkens border to ink and tints the background; they fill the intake textarea on click.

### Cards & Containers
- **Corner Style:** 6px (10px for large surfaces).
- **Background:** paper `#FBF8F1` on paper-shade mat — never white, never shadowed at rest.
- **Border:** 1px paper-line; the analysis "why it may apply" callout uses the same hairline on a muted paper tone.

### Badges (confidence & status)
- **Style:** 4px radius, icon + label, 11px/500. Semantic pairs: FACT (ink-soft on neutral wash), POSSIBLE ISSUE (seal on seal wash), LEGAL INFORMATION (brass-deep on brass wash), AI INTERPRETATION (brass-deep on brass wash, dashed border), VERIFIED (verified green on verified wash), DEMO (brass-deep on brass wash + shield icon). Text is never color-only.

### The Case Stepper (signature component)
- **Style:** a ruled rail of five steps (Situation → Analysis → Evidence → Next steps → Document). Connectors are 1px lines that fill brass as steps complete; done steps get a brass check circle; the active step is brass-wash pill with brass-deep text. `aria-current="step"` marks position. Mobile collapses to "Step 2 of 5" with a progress bar and prev/next arrows.

### The Document Sheet (signature component)
- **Style:** paper `#FBF8F1` on the mat, `max-w-[760px]`, serif type, 2px ink letterhead rule, hairline footer with the disclaimer. Anatomy: letterhead (LegalAId + helpline 15100) → title → date → parties → subject → numbered sections → legal references → remedy → signature block. Inline editing shows subtle focus washes; preview mode is clean. Print renders only the sheet on white.

### The Journey Ledger (signature component)
- **Style:** the five steps as a ruled contents table — serif page numerals (01–05) in ink-faint, hairline row dividers, one brass arrow per row. No icons: the sequence is the content.

## Do's and Don'ts

### Do:
- **Do** keep text ≥4.5:1; ink-faint `#667084` is the floor for metadata.
- **Do** let one element command each screen — the intake sheet on home, the document on the last step.
- **Do** label every legal claim (FACT / POSSIBLE / LEGAL INFO / AI INTERPRETATION) — icon + text, never color alone.
- **Do** use the serif for the cover title, ledger numerals, and document only.

### Don't:
- **Don't** use gradients, glassmorphism, or neon — the paper world is flat and warm.
- **Don't** use pill buttons, heavy shadows, or pure-white cards.
- **Don't** use emoji in the UI, stock illustrations, or floating AI orbs.
- **Don't** use dark mode; the desk is daytime.
- **Don't** ship a chatbot visual language — LegalAId is a guided file, not a chat.
