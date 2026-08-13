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

### Environment variables

Set these in `.env.local` (see `.gitignore` — env files are never committed):

| Variable | Used by | Required |
| --- | --- | --- |
| `AI_API_KEY` | model backend (`/api/analyze`, `/api/document`) | yes, for real analysis |
| `GROQ_API_KEY` | speech-to-text (`/api/transcribe`, Groq Whisper large-v3) | only for voice input |

`AI_ENDPOINT` / `AI_ENDPOINT_REGISTRY` / `AI_MODEL` / `AI_ENABLE_THINKING`
additionally tune the model backend (see `src/lib/model/chat.ts`).

### Voice input (speech-to-text)

On the intake page, the mic button records your description in your own words
and transcribes it into the situation text — in English or Hindi (the current
UI language is sent as a Whisper language hint). Recording happens in the
browser (`MediaRecorder`); the audio clip is uploaded to `POST /api/transcribe`,
which forwards it to Groq's `whisper-large-v3` model. The Groq key never
reaches the client. Requires a browser with `MediaRecorder` + microphone
permission, and `GROQ_API_KEY` set on the server.

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
