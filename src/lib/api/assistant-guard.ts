/**
 * Server-side request validation for /api/assistant. The assistant receives
 * the user's own case data (localized analysis + current draft) plus their
 * question — bounded here so a misbehaving client can't blow up the prompt.
 */

import type { Language } from "@/lib/types/domain";
import { ASSISTANT_PAGES, type AssistantPage } from "@/lib/model/assistant";

export const ASSISTANT_LIMITS = {
	/** Raw body cap — localized context + draft + history is sizeable but bounded. */
	bodyBytes: 96 * 1024,
	question: 2_000,
	instruction: 1_000,
	history: 8,
	historyMessage: 2_000,
	contextBytes: 64 * 1024,
	draftBytes: 32 * 1024,
} as const;

export class AssistantBadRequestError extends Error {}

function fail(msg: string): never {
	throw new AssistantBadRequestError(msg);
}

function optStr(v: unknown, max: number): string | undefined {
	if (v === undefined) return undefined;
	if (typeof v !== "string") fail("invalid assistant field");
	const s = v.trim();
	if (s.length === 0) return undefined;
	if (s.length > max) fail("assistant field too long");
	return s;
}

function reqStr(v: unknown, max: number): string {
	const s = optStr(v, max);
	if (s === undefined) fail("missing assistant field");
	return s;
}

function guardLang(v: unknown): Language {
	if (v !== "en" && v !== "hi") fail("missing or invalid lang");
	return v;
}

function guardPage(v: unknown): AssistantPage {
	if (typeof v !== "string" || !ASSISTANT_PAGES.includes(v as AssistantPage)) {
		fail("invalid page");
	}
	return v as AssistantPage;
}

function guardContext(v: unknown): Record<string, unknown> {
	if (typeof v !== "object" || v === null || Array.isArray(v)) {
		fail("invalid context");
	}
	const raw = JSON.stringify(v);
	if (raw.length > ASSISTANT_LIMITS.contextBytes) fail("context too large");
	return v as Record<string, unknown>;
}

function guardHistory(
	v: unknown,
): Array<{ role: "user" | "assistant"; content: string }> {
	if (v === undefined) return [];
	if (!Array.isArray(v) || v.length > ASSISTANT_LIMITS.history)
		fail("invalid history");
	const out: Array<{ role: "user" | "assistant"; content: string }> = [];
	for (const m of v) {
		if (typeof m !== "object" || m === null || Array.isArray(m))
			fail("invalid history");
		const mm = m as Record<string, unknown>;
		if (mm.role !== "user" && mm.role !== "assistant") fail("invalid history");
		const content = reqStr(mm.content, ASSISTANT_LIMITS.historyMessage);
		out.push({ role: mm.role, content });
	}
	return out;
}

/** Validate + normalize a chat-mode body. */
export function guardAssistantChat(body: unknown): {
	question: string;
	history: Array<{ role: "user" | "assistant"; content: string }>;
	context: Record<string, unknown>;
	lang: Language;
	page: AssistantPage;
} {
	if (typeof body !== "object" || body === null || Array.isArray(body))
		fail("invalid json");
	const b = body as Record<string, unknown>;
	const question = reqStr(b.question, ASSISTANT_LIMITS.question);
	const history = guardHistory(b.history);
	const context = guardContext(b.context);
	const lang = guardLang(b.lang);
	const page = guardPage(b.page);
	return { question, history, context, lang, page };
}

/** Validate + normalize a document-mode body. */
export function guardAssistantDocument(body: unknown): {
	instruction: string;
	draft: Record<string, unknown>;
	context: Record<string, unknown>;
	lang: Language;
} {
	if (typeof body !== "object" || body === null || Array.isArray(body))
		fail("invalid json");
	const b = body as Record<string, unknown>;
	const instruction = reqStr(b.instruction, ASSISTANT_LIMITS.instruction);
	const draft = guardContext(b.draft);
	const rawDraft = JSON.stringify(draft);
	if (rawDraft.length > ASSISTANT_LIMITS.draftBytes) fail("draft too large");
	const context = guardContext(b.context);
	const lang = guardLang(b.lang);
	return { instruction, draft, context, lang };
}
