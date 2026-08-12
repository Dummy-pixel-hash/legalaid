# LegalAId — Component Inventory

> Status: MVP baseline · Owner: engineering · Last updated: initial
> Rules: primitives come from shadcn/ui where sensible; product components are thin, typed, and render data — never legal content. Every component is a11y-checked per UX.md §7.

## 1. UI primitives (`components/ui/`)

From shadcn/ui, restyled to DESIGN_SYSTEM tokens:

- `Button` — variants: primary / secondary / ghost / link / destructive. All 44px min height.
- `Card` — flat, hairline border, 6px radius (see DESIGN_SYSTEM §7).
- `Input`, `Textarea`, `Select`, `RadioGroup`, `Checkbox`, `Switch` — 44px, focus ring accent.
- `Badge` — icon+label, semantic variants (status system below).
- `Alert` — info/caution/error blocks with icon + title + body.
- `Skeleton` — muted pulse block.
- `Progress` — thin bar for stepper mobile + evidence progress.
- `Tooltip`, `Dialog` (confirm reset), `Separator`, `Label`, `FormError`.

## 2. Shell (`components/shell/`)

| Component | Responsibility |
|---|---|
| `AppHeader` | Sticky top bar: wordmark → `/`, "New situation" (in case), "Legal info" link, `LanguageSwitcher` |
| `AppFooter` | Short disclaimer, NALSA helpline 15100, links to `/legal` |
| `LanguageSwitcher` | en/hi segmented control; sets `html lang`, persists choice, swaps font vars |
| `CaseStepper` | 5-step rail (Situation→Analysis→Evidence→Next steps→Document); `aria-current` on active; checkmarks on done; clickable visited steps; mobile = "Step 2 of 5" + progress bar + prev/next |
| `CaseShell` | Layout for `/case/*`: stepper + `<main>` + footer; owns case hydration/loading/error states |
| `StepTransition` | Cross-fade wrapper between steps (respects reduced motion) |

## 3. Home (`components/home/`)

| Component | Responsibility |
|---|---|
| `HeroIntake` | Headline, one-liner, textarea + "Understand my situation" primary; example chips below; the first-viewport thesis |
| `ExampleChips` | Clickable real scenarios (fills textarea) |
| `DomainCards` | Consumer / Labour / Tenant cards: description, example lines, "Start here" → intake with domain |
| `HowItWorks` | 5-step strip, one line per step |
| `TrustSection` | Sources & honesty: verified vs demo explanation, disclaimer, works-on-device note |
| `SectionMarker` | Numbered small-caps label ("01 · Your situation") — shared rhythm device |

## 4. Intake (`components/intake/`)

| Component | Responsibility |
|---|---|
| `SituationForm` | Stage A: textarea (min 140px) + collapsible "Add details (optional)": domain, state, amount, other party, dates |
| `ClarifyingQuestions` | Stage B: renders 1–4 typed questions from the provider; each with Skip; progress "Question 1 of 3"; summary of what will be checked |
| `IntakeSummary` | Read-only recap shown during/after analysis ("We'll check: …") |
| `DomainPicker` | Three-choice radio for manual domain selection (also the "not detected" fallback) |

## 5. Analysis (`components/analysis/`)

| Component | Responsibility |
|---|---|
| `AnalysisPageBlocks` | Orchestrates block order + staged reveal from `Progress` events |
| `UnderstandingBlock` | Restated summary (FACT) + "Edit my situation" |
| `IssuesBlock` | Issue labels with `ConfidenceBadge`, 1–2 line details |
| `RightsBlock` | Right cards with links to law ids |
| `LawsBlock` | List of `LawCard`s |
| `LawCard` | Act (h3) + section chip · plain explanation · "Why it may apply" · `SourceTag` row |
| `UncertaintyBlock` | Honest "what we don't know" items: what would change the answer + how to resolve |
| `ConfidenceBadge` | FACT / POSSIBLE ISSUE / LEGAL INFO / AI INTERPRETATION — icon + text |
| `SourceTag` | verified (neutral) vs demo (violet) tag + ref text |
| `DisclaimerBanner` | Always-visible disclaimer, per language |

## 6. Evidence (`components/evidence/`)

| Component | Responsibility |
|---|---|
| `EvidenceChecklist` | Ordered list of `EvidenceItem`s + header guidance |
| `EvidenceItem` | Label, why-line, three-state segmented control (Have/Don't have/Need to find) + note field |
| `EvidenceProgress` | "3 of 6 items you already have · 2 to find" summary bar |

## 7. Next steps (`components/steps/`)

| Component | Responsibility |
|---|---|
| `NextStepsList` | Numbered list in order, leads to document CTA |
| `StepItem` | Title, plain, why, effort tag (Quick/Moderate/Long), urgency flag |

## 8. Document (`components/document/`)

| Component | Responsibility |
|---|---|
| `DocumentWorkspace` | Sheet + toolbar orchestration; edit/preview modes; unsaved-changes indicator |
| `DocumentToolbar` | Edit/Preview toggle · Save (Saved ✓) · Download PDF · Copy text · (mobile: sticky bottom bar) |
| `DocumentSheet` | The paper artifact: title, date, parties, subject, body sections, legal references, remedy, signature, footer disclaimer |
| `EditableSection` | Inline-editable block (edit mode) with "Regenerate wording" per-section action |
| `DocumentPreview` | Clean read-only render |
| `PrintDocument` | Print-only render of the sheet (hidden in UI mode) |
| `SignatureBlock` | Name + designation line |

## 9. Shared (`components/shared/`)

| Component | Responsibility |
|---|---|
| `EmptyState` | Friendly, specific empty states (no case, no evidence yet, etc.) with a CTA |
| `ErrorState` | Calm error card: what happened, Retry, "Show general guidance instead" |
| `LoadingAnalysis` | Staged skeletons + honest copy per Progress stage |

## 10. Status system (mapping to DESIGN_SYSTEM §8)

- `Badge` semantic variants: `neutral` (FACT) · `caution` (POSSIBLE ISSUE / need-to-find) · `info` (LEGAL INFO) · `accent` (AI INTERPRETATION, dashed) · `success` (have) · `danger` (don't-have) · `demo` (violet placeholder).
- Icons: `Info` · `AlertTriangle` · `BookOpen`/`Scale` · `Sparkles` · `CheckCircle2` · `Circle` · `Search` · `ShieldAlert`.

## 11. Component rules

- **No legal text in components.** All strings come from `useI18n()` or the analysis object. (The one exception: the disclaimer constants, imported from `lib/legal/disclaimers.ts`.)
- **Props are typed domain objects**, not loose strings where semantics matter.
- **Accessibility:** every interactive component has a name; badges carry text; lists are semantic; focus-visible rings; reduced-motion respected.
- **Sizes:** no component smaller than 44px touch target; no hover-dependent info.
