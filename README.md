# LegalAId

**Understand your rights. Know what to do next.**

LegalAId is a civic-tech web app that helps first-generation litigants in India
understand a legal problem in plain language and act on it — for Consumer,
Labour, and Tenant disputes, in English and Hindi.

## The journey

**Problem → Understanding → Applicable Law → Evidence → Next Action → Document**

1. **Situation** (`/intake`) — describe what happened in your own words (English, Hindi, or mixed). Optional clarifying questions.
2. **Analysis** (`/case/[id]/analysis`) — what we understood, possible issues, your possible rights, applicable law with plain-language explanations, and an honest "what we're unsure about" section.
3. **Evidence** (`/case/[id]/evidence`) — an interactive checklist: have it / don't have it / need to find it.
4. **Next steps** (`/case/[id]/next-steps`) — a prioritized, honest action plan.
5. **Document** (`/case/[id]/document`) — an editable legal notice/complaint draft you can save, copy, and export as PDF.

## Try it fast

- `/case/demo-consumer` — defective refrigerator within warranty (₹18,500)
- `/case/demo-labour` — three months of unpaid wages (₹48,000)
- `/case/demo-tenant` — security deposit not returned (₹30,000)

Each demo exists in English and Hindi — switch language in the header.

## Run it

```bash
pnpm install
pnpm dev        # development
pnpm build      # production build
pnpm start      # serve the build
pnpm tsx scripts/smoke.ts   # pipeline smoke tests
```

## Architecture in brief

- **Next.js 15 (App Router) + TypeScript + Tailwind v4 + shadcn/ui.** Client-only MVP; all state lives in a context store persisted to `localStorage`.
- **AI provider seam** (`src/lib/providers/`) — `LegalAnalysisProvider` interface; a mock provider generates structured, parameterized analyses. Swap in an API/local/fine-tuned/RAG provider later without touching the UI.
- **Versioned legal-source registry** (`src/lib/legal/sources.ts`) — the single source of truth for citations.
- **First-class language** (`src/lib/i18n/`) — typed dictionaries (en, hi) + per-language analysis content. Adding a language = one dictionary file + content.

## Legal verification rule (strict)

- `verified: true` only for real, confirmed Act/Code + section.
- `verified: false` for demo/state-specific/advisory references — the UI tags these **"Demo — verify with an expert"** and never presents them as established law.
- LegalAId provides **general legal information, not legal advice**. Every analysis and document carries the disclaimer. Free legal aid: **State Legal Services Authority helpline 15100**.

## Documentation

See `PRODUCT.md`, `UX.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `ROUTES.md`,
`COMPONENTS.md`, `MOCK_DATA.md`, `ROADMAP.md` in the repo root.
