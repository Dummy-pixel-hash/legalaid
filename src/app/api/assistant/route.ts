/**
 * Case-aware assistant route (/api/assistant).
 *
 * mode=chat: streams a free-form answer to a follow-up question about the
 *   user's own case. The case context is the user's own data (sent by the
 *   client, localized to the active language); law sources are resolved
 *   SERVER-side from the registry by domain — client-supplied sources are
 *   never trusted (same trust boundary as /api/analyze).
 * mode=document: grammar-constrained revision of the current letter draft
 *   per a user instruction; returns a complete new DocumentData JSON.
 *
 * Env: AI_ENDPOINT / AI_API_KEY / AI_MODEL (see src/lib/model/chat.ts).
 */

import { NextResponse } from "next/server";
import {
	buildAssistantChatMessages,
	buildAssistantDocumentMessages,
	sourcesContext,
	DOC_SECTION_SCHEMA,
} from "@/lib/model/assistant";
import { chatCompletionStream } from "@/lib/model/chat";
import { runSection } from "@/lib/model/section";
import { detectDomain } from "@/lib/providers/content/shared";
import { candidateSources } from "@/lib/providers/candidates";
import {
	AssistantBadRequestError,
	ASSISTANT_LIMITS,
	guardAssistantChat,
	guardAssistantDocument,
} from "@/lib/api/assistant-guard";
import type { Domain, Language } from "@/lib/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOMAINS = new Set<Domain>(["consumer", "labour", "tenant"]);

/** Resolve the authoritative law-source set from the (user-owned) context. */
function resolveSources(
	context: Record<string, unknown>,
	lang: Language,
): string {
	let domain: Domain | undefined;
	const rawDomain = context.domain;
	if (typeof rawDomain === "string" && DOMAINS.has(rawDomain as Domain)) {
		domain = rawDomain as Domain;
	} else {
		const intake = context.intake as Record<string, unknown> | undefined;
		const description =
			typeof intake?.description === "string" ? intake.description : "";
		domain = detectDomain(description);
	}
	const sources = domain ? candidateSources(domain) : [];
	return sourcesContext(
		sources.map((s) => ({
			id: s.id,
			act: s.act,
			section: s.section,
			title: s.title[lang],
			plain: s.plain[lang],
			verified: s.source.verified,
		})),
		lang,
	);
}

export async function POST(req: Request) {
	// Coarse body-size cap before any parsing (mirrors /api/analyze).
	const contentLength = Number(req.headers.get("content-length") ?? 0);
	if (contentLength > ASSISTANT_LIMITS.bodyBytes) {
		return NextResponse.json({ error: "payload too large" }, { status: 413 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}

	const mode = (body as Record<string, unknown> | null)?.mode;
	if (mode === "chat") return handleChat(body);
	if (mode === "document") return handleDocument(body);
	return NextResponse.json({ error: "invalid mode" }, { status: 400 });
}

async function handleChat(body: unknown): Promise<Response> {
	let guarded: ReturnType<typeof guardAssistantChat>;
	try {
		guarded = guardAssistantChat(body);
	} catch (err) {
		if (err instanceof AssistantBadRequestError) {
			return NextResponse.json({ error: err.message }, { status: 400 });
		}
		throw err;
	}
	const { question, history, context, lang, page } = guarded;
	void page; // context flavor is implicit in the payload

	const contextJson = JSON.stringify(context, null, 1);
	const sourcesJson = resolveSources(context, lang);
	const messages = buildAssistantChatMessages({
		lang,
		contextJson,
		sourcesJson,
		history,
		question,
	});

	const encoder = new TextEncoder();
	const abort = new AbortController();
	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			try {
				for await (const delta of chatCompletionStream({
					messages,
					maxTokens: 2048,
					temperature: 0.3,
					signal: abort.signal,
				})) {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
					);
				}
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`),
				);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error("assistant chat model error", err);
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`),
				);
			} finally {
				controller.close();
			}
		},
		cancel() {
			abort.abort();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}

async function handleDocument(body: unknown): Promise<Response> {
	let guarded: ReturnType<typeof guardAssistantDocument>;
	try {
		guarded = guardAssistantDocument(body);
	} catch (err) {
		if (err instanceof AssistantBadRequestError) {
			return NextResponse.json({ error: err.message }, { status: 400 });
		}
		throw err;
	}
	const { instruction, draft, context, lang } = guarded;

	const grounding = {
		intake: context.intake ?? null,
		caseSummary: context.caseSummary ?? null,
		issues: context.issues ?? null,
	};
	const messages = buildAssistantDocumentMessages({
		lang,
		draftJson: JSON.stringify(draft, null, 1),
		groundingJson: JSON.stringify(grounding, null, 1),
		instruction,
	});

	try {
		const { content } = await runSection({
			section: "document",
			name: "document-revision",
			schema: DOC_SECTION_SCHEMA,
			messages,
			maxTokens: 4096,
		});
		return NextResponse.json({ content });
	} catch (err) {
		console.error("assistant document revision error", err);
		return NextResponse.json({ error: "model error" }, { status: 502 });
	}
}
