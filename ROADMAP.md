# LegalAId — Roadmap

> Status: MVP baseline · Owner: engineering · Last updated: initial
> Milestones M0→M7. Each milestone ends with a runnable app and a short acceptance check. No milestone depends on unapproved architectural decisions.

## M0 — Scaffold & tooling
- git repo initialized (done), `.gitignore` (node_modules, .next, env), `README.md` stub.
- `pnpm` project: Next.js 15 (App Router) + TypeScript strict + Tailwind v4.
- shadcn/ui init; install primitives we know we need (button, card, input, textarea, select, radio-group, checkbox, badge, alert, skeleton, progress, separator, label, tooltip, dialog).
- Fonts via `next/font/google`: IBM Plex Sans, IBM Plex Devanagari, Source Serif 4, Noto Serif Devanagari; CSS variables `--font-ui`, `--font-doc`.
- ESLint + `tsc --noEmit` pass; first commit.

**Accept:** `pnpm dev` renders a blank shell with correct fonts; `pnpm build` passes.

## M1 — Design system + shell
- Tailwind `@theme` tokens per DESIGN_SYSTEM (colors, spacing, radius, type scale, shadows).
- Restyle shadcn primitives to tokens (buttons, inputs, badges, cards).
- `AppHeader`, `AppFooter`, `LanguageSwitcher`, `CaseStepper` (desktop rail + mobile "2 of 5"), `StepTransition`, `SectionMarker`.
- i18n foundation: `lib/i18n` (types, en.ts, hi.ts, provider, `useI18n`); `html lang` swap + font swap; `?lang=` handling.
- `lib/types/domain.ts` + `lib/legal/disclaimers.ts` (en+hi).

**Accept:** shell renders; language switch flips UI strings and fonts end-to-end; tokens visible on a scratch page.

## M2 — Home + intake
- Home page: `HeroIntake`, `ExampleChips`, `DomainCards`, `HowItWorks`, `TrustSection`, disclaimer.
- `/intake`: `SituationForm` (textarea + collapsible optional details), domain preselect (`?domain=`), `?demo=` prefill.
- `CaseProvider` (`lib/store/case-store.tsx`): create case, persist to localStorage, route to `/case/[id]/analysis`.

**Accept:** type a problem → case created → redirected; demo chips prefill; Hindi UI works.

## M3 — Data layer (provider + mock + sources)
- `lib/legal/sources.ts`: versioned registry (verified list + demo flags from ARCHITECTURE §7).
- `lib/providers/legal-analysis.ts` (interface + Progress), `lib/providers/mock-provider.ts` (per-domain en+hi templates, fact injection, staged delays, generic fallback), `lib/providers/index.ts` (factory).
- `lib/mock/demo-cases.ts`: the three demo cases (en+hi) from MOCK_DATA.md.
- `LoadingAnalysis` skeletons + `Progress` wiring into the store.

**Accept:** intake → staged loading → complete `CaseAnalysis` for all three domains (en+hi); demo deep links work; undetected domain → fallback + picker.

## M4 — Analysis page
- Blocks: Understanding, Issues, Rights, Laws (LawCard + SourceTag), Uncertainty, DisclaimerBanner, ConfidenceBadge.
- "Edit my situation" → intake with `?edit=`; re-analysis replaces analysis.
- Staged reveal from Progress; `aria-live` status.

**Accept:** full brief renders for all domains; badges/source tags correct; uncertainty section present; disclaimer visible.

## M5 — Evidence + Next steps
- Evidence: checklist, three-state control, note field, progress summary, persistence.
- Next steps: `StepItem` list with effort/urgency/why; CTA to document.

**Accept:** statuses persist across reload; both pages render from analysis data in en+hi.

## M6 — Document builder + PDF
- `DocumentWorkspace`: sheet, toolbar (Edit/Preview · Save · Download PDF · Copy), `EditableSection` with per-section "Regenerate wording".
- `PrintDocument` + print stylesheet; `Download PDF` → `window.print()`.
- Mobile sticky bottom toolbar; unsaved-changes indicator.

**Accept:** edit → preview → print produces a clean, professional document (no nav/stepper in print) for all three domains, in both languages.

## M7 — Hardening & polish
- Responsive audit at 360/640/768/1024/1280 (UX.md §11).
- Accessibility pass: landmarks, focus, aria-current/live, contrast, reduced motion, 44px targets (UX.md §7).
- Empty/error states: missing case, provider failure (+retry/fallback), offline note.
- Full Hindi pass: all screens + demo content, mixed-script input, number/date formatting.
- Final doc sync (PRODUCT/UX/DESIGN_SYSTEM/ARCHITECTURE/ROUTES/COMPONENTS/MOCK_DATA reflect the shipped app).
- `pnpm build` clean; final commit.

**Accept:** end-to-end walkthrough in en and hi on mobile + desktop; quality-bar review per DESIGN_SYSTEM §13 (no drift); every screen passes the "would a first-time litigant understand this?" test.

## Post-MVP (designed, not scheduled)
- API provider behind a server route; RAG over `legal/sources.ts`; fine-tuning schema from mock templates; additional languages (Marathi, Tamil, Bengali); server-side PDF; accounts/persistence; more domains.
