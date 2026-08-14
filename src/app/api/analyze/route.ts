import { NextResponse } from "next/server";
import type { Language } from "@/lib/types/domain";
import { buildDocumentSection, buildSectionPrompts } from "@/lib/model/prompt";
import { runSection } from "@/lib/model/section";
import { detectDomain } from "@/lib/providers/content/shared";
import { candidateSources } from "@/lib/providers/candidates";
import { BadRequestError, guardIntakePayload, LIMITS } from "@/lib/api/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
			// Phase 1: core/risk/steps are issued concurrently. Whether they
			// actually run in parallel depends on the model server's slot count
			// (llama.cpp --parallel N); on a single-slot server the requests
			// queue, so total time is the sum of the sections, not the max.
			// runSection retries once per section (transient grammar-stall 500s);
			// a section that still fails must not drop the others. Each section
			// is enqueued the moment it completes so the client renders
			// progressively.
			// Phase 2: the document section runs AFTER they settle, with the
			// completed analysis as context — the letter is grounded in the
			// full findings, not just the intake. The alternate-language letter
			// is pre-warmed in the background by the case store (see runAnalysis),
			// so toggling the letter's language is instant instead of a second
			// slow on-demand generation.
			let pending = sections.length + 1;
			let failures = 0;
			const maybeFinish = () => {
				if (pending > 0) return;
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({ done: failures === 0 })}\n\n`,
					),
				);
				controller.close();
			};

			const context: Record<string, unknown> = {};

			// Issue every section as its own promise so Promise.allSettled drives
			// them (concurrency is then the server's business — see note above).
			const sectionPromises: Promise<void>[] = [];
			for (const spec of sections) {
				sectionPromises.push(
					(async () => {
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
							const msg = err instanceof Error ? err.message : String(err);
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
					})(),
				);
			}
			await Promise.allSettled(sectionPromises);

			try {
				const docSpec = buildDocumentSection({
					intake,
					lang,
					lawSources,
					context,
				});
				const { section, content } = await runSection(docSpec);
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ section, content })}\n\n`),
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
