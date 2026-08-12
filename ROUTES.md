# LegalAId — Routes

> Status: MVP baseline · Owner: engineering · Last updated: initial
> All routes are client-rendered (`"use client"` at the page level as needed); the app is a static SPA-style experience served by Next.js.

## Route table

| Route | Step | Purpose | Key behavior |
|---|---|---|---|
| `/` | Home | Identity, intake entry, examples, domains, how-it-works, trust | Hero intake textarea; example chips fill it; domain cards → `/intake?domain=x`; language switch; disclaimer |
| `/intake` | 1 · Your situation | Describe the problem; optional clarifying questions | Stage A: textarea + optional details (collapsible). Stage B: 1–4 clarifying questions with Skip. Submit → creates case → `/case/[id]/analysis`. `?demo=` prefills a scenario (e.g. `?demo=deposit`). `?domain=` preselects the domain |
| `/case/[caseId]/analysis` | 2 · Analysis | The legal brief: understanding, issues, rights, laws, uncertainty | Loads analysis (staged skeletons on first run); "Edit my situation" → `/intake?edit=[caseId]`; badges + sources + disclaimer; "Next: Evidence →" |
| `/case/[caseId]/evidence` | 3 · Evidence | Interactive checklist | Three-state items (Have / Don't have / Need to find); progress summary; persisted; "Next: Next steps →" |
| `/case/[caseId]/next-steps` | 4 · Next steps | Prioritized action plan | Numbered steps with effort/urgency/why; leads to document |
| `/case/[caseId]/document` | 5 · Document | Edit → preview → save → export | Sheet + toolbar (Edit/Preview, Save, Download PDF, Copy); print stylesheet for PDF; "Start over / new case" |
| `/legal` | — | Trust: sources, disclaimer, how it works | Static; explains verified vs demo data, NALSA 15100, privacy note ("stays on your device") |
| `/*` | — | Not found | Calm 404: explains the page doesn't exist, link home |

## Case lifecycle

- **Creation:** intake submit → `id = crypto.randomUUID()` → `CaseProvider` seeds from intake → navigates to analysis.
- **Hydration:** `/case/[caseId]` reads `localStorage['laid.case.<id>']`; demo ids (`demo-consumer`, `demo-labour`, `demo-tenant`) hydrate from `lib/mock/demo-cases.ts`.
- **Missing case:** no store entry and not a demo id → friendly error + "Start a new situation" CTA (no 500).
- **Re-analysis:** editing intake for an existing case re-runs `analyze()` and replaces the analysis (progress preserved where stages match).
- **Persistence:** everything lives in localStorage; "New case" clears current case (with confirm) and returns to `/intake`.

## Query params

| Param | Effect |
|---|---|
| `?demo=<key>` | Prefills intake with demo scenario `<key>` from `demo-cases.ts` |
| `?domain=<consumer\|labour\|tenant>` | Preselects domain in intake |
| `?edit=<caseId>` | Intake preloaded with existing case's intake for editing |
| `?lang=en\|hi` | Overrides language for the session (persisted thereafter) |

## Navigation rules

- Stepper appears only inside a case shell (`/case/*`); step 1 (Situation) links back to intake editing the current case.
- Header: wordmark → home · "Legal info" → `/legal` · language switcher · "New situation" (when inside a case).
- Footer: disclaimer short-form + links (about, legal info, NALSA helpline).
- All stepper transitions are client-side (no full reloads); each step is a real route so back/forward and deep links work.
