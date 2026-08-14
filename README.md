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
| `AI_API_KEY` | model backend (`/api/analyze`, `/api/document`, `/api/assistant`) | yes, for real analysis |
| `GROQ_API_KEY` | speech-to-text (`/api/transcribe`, Groq Whisper large-v3) | only for voice input |

`AI_ENDPOINT` / `AI_ENDPOINT_REGISTRY` / `AI_MODEL` / `AI_ENABLE_THINKING`
additionally tune the model backend (see `src/lib/model/chat.ts`).

> **Why generation can feel slow.** The analysis runs as four grammar-
> constrained sections (summary/issues/rights · uncertainty/evidence · next
> steps · document). The first three are issued concurrently, but real
> parallelism depends on the model server's slot count — run llama.cpp with
> `--parallel 4` (and enough KV cache) to actually execute them side by side;
> on a single-slot server the requests queue and total time is the sum of the
> sections. The letter is generated per language: the second language's draft
> is pre-warmed in the background right after analysis, so toggling the
> letter's language on the document page is instant instead of a slow
> on-demand call. If a single analysis feels too slow, prefer a faster model
> or more VRAM over smaller outputs — the bilingual content is what makes
> language switching instant.

### Voice input (speech-to-text)

On the intake page, the mic button records your description in your own words
and transcribes it into the situation text — in English or Hindi (the current
UI language is sent as a Whisper language hint). Recording happens in the
browser (`MediaRecorder`); the audio clip is uploaded to `POST /api/transcribe`,
which forwards it to Groq's `whisper-large-v3` model. The Groq key never
reaches the client. Requires a browser with `MediaRecorder` + microphone
permission, and `GROQ_API_KEY` set on the server.

### Case assistant (Q&A + document revisions)

On every case page, a **pill button** (bottom-right) expands into the
case-aware assistant window and collapses back when you click away. It answers
follow-up questions grounded in *that case* (intake, analysis, evidence state,
next steps, and the current letter draft on the document page) and has a
voice-input mic for composing. Answers stream in and are constrained to the
law sources the analysis already established (the server resolves sources;
none are ever invented).

The conversation is **persisted per case** in the case store (localStorage) —
it survives navigating between case pages and page reloads. The suggestion
chips adapt to the current step, and on the document page the letter draft is
included as context. On the document page the assistant also **revises the
letter**: pick a preset (firmer, more formal, translate, shorten) or type an
instruction, and the assistant proposes a revised draft you can **Apply** or
**Discard** — an AI-collaborative editing loop on top of the existing
edits-wins draft model.

Backend: `POST /api/assistant` (mode `chat` streams SSE deltas; mode
`document` returns a grammar-constrained draft). The mock provider returns
honestly-labeled demo answers, so the flow works without the model backend.

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
