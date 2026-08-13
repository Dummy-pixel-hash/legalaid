/**
 * Shared grammar-constrained section runner for the model routes.
 * One section = one json_schema call, up to 2 attempts (transient llama.cpp
 * grammar-stall 500s or hollow generations are retried with a repair hint).
 */

import { chatCompletionJson, type ChatMessage } from "./chat";
import type { SectionSpec } from "./prompt";

/** Grammar-constrained output is valid JSON by construction, but the model can
 * still stall inside the grammar and exhaust its token budget (llama.cpp then
 * 500s with a peg-native mismatch), or emit a grammar-conforming but hollow
 * object. Treat both as section failures so the retry covers them. */
export function isEmptySectionContent(v: unknown): boolean {
	if (v === null || v === undefined) return true;
	if (typeof v === "string") return v.trim() === "";
	if (Array.isArray(v)) return v.every(isEmptySectionContent);
	if (typeof v === "object") {
		const entries = Object.values(v);
		return entries.length === 0 || entries.every(isEmptySectionContent);
	}
	return false; // numbers / booleans count as content
}

/**
 * The document section's "type" enum defaults to a non-empty string, so a
 * skeleton draft (type + empty everything else) slips past
 * isEmptySectionContent. A real letter always has a title and sections.
 */
function isEmptyDocument(v: unknown): boolean {
	const doc =
		v && typeof v === "object"
			? (v as Record<string, unknown>).document
			: undefined;
	if (!doc || typeof doc !== "object") return true;
	const d = doc as Record<string, unknown>;
	const title = typeof d.title === "string" ? d.title.trim() : "";
	if (!title) return true;
	const sections = Array.isArray(d.sections) ? d.sections : [];
	if (sections.length === 0) return true;
	return sections.every((s) => {
		const o = s as Record<string, unknown>;
		return typeof o?.heading !== "string" || o.heading.trim() === "";
	});
}

function isHollowContent(section: SectionSpec["section"], v: unknown): boolean {
	if (section === "document") return isEmptyDocument(v);
	return isEmptySectionContent(v);
}

/** One section, up to 3 attempts: the fine-tuned model occasionally loops or
 * truncates mid-JSON; escalating temperature + a repair hint breaks the loop
 * and produces a fresh constrained generation. */
export async function runSection(spec: {
	section: SectionSpec["section"];
	messages: ChatMessage[];
	name: string;
	schema: object;
	maxTokens: number;
}): Promise<{ section: SectionSpec["section"]; content: unknown }> {
	const attempts: Array<{ temperature: number; hint?: string }> = [
		{ temperature: 0.2 },
		{
			temperature: 0.3,
			hint: "Your previous response did not match the required JSON schema or was empty. Reply with ONLY one valid JSON object matching the schema exactly, with real content for every field — no extra fields, no prose, no markdown fences.",
		},
		{
			temperature: 0.4,
			hint: "Again: output ONLY the required JSON object, nothing else. Ensure every array and object is properly closed and quoted.",
		},
	];
	let lastErr: unknown = new Error("section failed");
	for (const a of attempts) {
		try {
			const messages = a.hint
				? [...spec.messages, { role: "user" as const, content: a.hint }]
				: spec.messages;
			const content = await chatCompletionJson({
				messages,
				maxTokens: spec.maxTokens,
				temperature: a.temperature,
				name: spec.name,
				schema: spec.schema,
			});
			if (isHollowContent(spec.section, content)) {
				throw new Error("section produced empty content");
			}
			return { section: spec.section, content };
		} catch (err) {
			lastErr = err;
		}
	}
	throw lastErr;
}
