import { NextResponse } from "next/server";
import type { Language } from "@/lib/types/domain";
import { chatCompletionJson, type ChatMessage } from "@/lib/model/chat";
import {
	buildDocumentSection,
	buildSectionPrompts,
	type SectionSpec,
} from "@/lib/model/prompt";
import { detectDomain } from "@/lib/providers/content/shared";
import { candidateSources } from "@/lib/providers/candidates";
import { BadRequestError, guardIntakePayload, LIMITS } from "@/lib/api/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Grammar-constrained output is valid JSON by construction, but the model can
 * still stall inside the grammar and exhaust its token budget (llama.cpp then
 * 500s with a peg-native mismatch), or emit a grammar-conforming but hollow
 * object. Treat both as section failures so the retry covers them. */
function isEmptySectionContent(v: unknown): boolean {
	if (v === null || v === undefined) return true;
	if (typeof v === "string") return v.trim() === "";
	if (Array.isArray(v)) return v.every(isEmptySectionContent);
	if (typeof v === "object") {
		const entries = Object.values(v);
		return entries.length === 0 || entries.every(isEmptySectionContent);
	}
	return false; // numbers / booleans count as content
}

/** One section, up to 2 attempts: first at default temperature, then with a
 * repair hint at a slightly higher temperature (same pattern the pre-stream
 * route used). The failure is transient, so a fresh constrained generation
 * usually succeeds. */
async function runSection(spec: {
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
			if (isEmptySectionContent(content)) {
				throw new Error("section produced empty content");
			}
			return { section: spec.section, content };
		} catch (err) {
			lastErr = err;
		}
	}
	throw lastErr;
}

export async function POST(req: Request) {
	// Coarse body-size cap before any parsing.
	const contentLength = Number(req.headers.get("content-length") ?? 0);
	if (contentLength > LIMITS.bodyBytes) {
		return NextResponse.json({ error: "payload too large" }, { status: 413 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}

	let intake: ReturnType<typeof guardIntakePayload>["intake"];
	let lang: Language;
	try {
		({ intake, lang } = guardIntakePayload(body));
	} catch (err) {
		if (err instanceof BadRequestError) {
			return NextResponse.json({ error: err.message }, { status: 400 });
		}
		throw err;
	}

	// Security: the server is authoritative for law sources. Candidates are
	// resolved from the registry by domain — client-supplied sources are never
	// trusted (indirect prompt-injection boundary).
	const domain = intake.domain ?? detectDomain(intake.description);
	const lawSources = domain ? candidateSources(domain) : [];
	if (lawSources.length === 0) {
		return NextResponse.json({ error: "unsupported domain" }, { status: 400 });
	}

	const sections = buildSectionPrompts({ intake, lang, lawSources });

	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			// Phase 1: core/risk/steps run concurrently on the 4 llama.cpp slots.
			// runSection retries once per section (transient grammar-stall 500s);
			// a section that still fails must not drop the others. Each section
			// is enqueued the moment it completes so the client renders
			// progressively.
			// Phase 2: the document section runs AFTER they settle, with the
			// completed analysis as context — the letter is grounded in the
			// full findings, not just the intake.
			let pending = sections.length + 1;
			let failures = 0;
			const maybeFinish = () => {
				if (pending > 0) return;
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ done: failures === 0 })}\n\n`),
				);
				controller.close();
			};

			const context: Record<string, unknown> = {};

			await Promise.allSettled(
				sections.map(async (spec) => {
					try {
						const { section, content } = await runSection(spec);
						Object.assign(context, content);
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({ section, content })}\n\n`,
							),
						);
					} catch (err) {
						failures++;
						const msg =
							err instanceof Error ? err.message : String(err);
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									section: spec.section,
									error: msg,
								})}\n\n`,
							),
						);
					} finally {
						pending--;
					}
				}),
			);

			try {
				const docSpec = buildDocumentSection({
					intake,
					lang,
					lawSources,
					context,
				});
				const { section, content } = await runSection(docSpec);
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({ section, content })}\n\n`,
					),
				);
			} catch (err) {
				failures++;
				const msg = err instanceof Error ? err.message : String(err);
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({ section: "document", error: msg })}\n\n`,
					),
				);
			} finally {
				pending--;
				maybeFinish();
			}
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
