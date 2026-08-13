import { NextResponse } from "next/server";
import type { Language } from "@/lib/types/domain";
import { chatCompletion, extractJson, escapeControlCharsInStrings, type ChatMessage } from "@/lib/model/chat";
import { buildDocumentPrompt, buildDocumentSection } from "@/lib/model/prompt";
import { runSection } from "@/lib/model/section";
import { detectDomain } from "@/lib/providers/content/shared";
import { candidateSources } from "@/lib/providers/candidates";
import { BadRequestError, guardIntakePayload, LIMITS } from "@/lib/api/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Call the model for a document draft, retrying once if truncated. */
async function modelDocument(base: ChatMessage[]): Promise<unknown> {
	const attempts: Array<{
		temperature: number;
		maxTokens: number;
		hint?: string;
	}> = [
		{ temperature: 0.2, maxTokens: 4096 },
		{
			temperature: 0.3,
			maxTokens: 4096,
			hint: "Your previous response was not valid JSON. Reply with ONLY one valid JSON object matching the required schema exactly — no extra fields, no prose, no markdown fences.",
		},
		{
			temperature: 0.4,
			maxTokens: 4096,
			hint: "Again: output ONLY the required JSON object, nothing else. Ensure every array and object is properly closed and quoted.",
		},
	];
	for (const a of attempts) {
		const messages: ChatMessage[] = a.hint
			? [
					...base,
					{
						role: "user",
						content: a.hint,
					},
				]
			: base;
		const raw = await chatCompletion({
			messages,
			maxTokens: a.maxTokens,
			temperature: a.temperature,
		});
		const parsed = extractJson(raw);
		try {
			return JSON.parse(parsed);
		} catch {
			try {
				// llama.cpp's grammar permits raw control chars in strings.
				return JSON.parse(escapeControlCharsInStrings(parsed));
			} catch {
				// truncated / malformed — retry with a correction hint
			}
		}
	}
	throw new Error("model returned invalid JSON after retries");
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

	try {
		// Regeneration with full analysis context: same grounded prompt the
		// analyze pipeline uses, grammar-constrained with retry.
		const context = (body as { context?: unknown })?.context;
		if (context && typeof context === "object") {
			const spec = buildDocumentSection({
				intake,
				lang,
				lawSources,
				context: context as Record<string, unknown>,
			});
			const { content } = await runSection(spec);
			return NextResponse.json({ content });
		}
		const base = buildDocumentPrompt({
			intake,
			lang,
			lawSources,
		});
		const content = await modelDocument(base);
		return NextResponse.json({ content });
	} catch (err) {
		// Log the real failure server-side; never leak backend details to clients.
		console.error("document model error", err);
		return NextResponse.json({ error: "model error" }, { status: 502 });
	}
}
