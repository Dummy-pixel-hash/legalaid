/**
 * ApiLegalAnalysisProvider — drives the LegalAId model backend (llama.cpp /
 * OpenAI-compatible) through a server-side route. isDevelopment = false: this
 * is a real model, not the mock stand-in.
 *
 * Law citations stay registry-grounded: the model may reference ONLY the
 * candidate sources we pass it, and we resolve every LawReference from the
 * registry (PRODUCT.md §7 — never invent a legal section). Invalid or
 * unparseable model output throws so the UI shows the honest error state
 * rather than fabricated content.
 */

import type {
	CaseAnalysis,
	Domain,
	DocumentData,
	DocumentType,
	EvidenceItem,
	IntakeData,
	Issue,
	Language,
	LawReference,
	Progress,
	Step,
	Uncertainty,
} from "@/lib/types/domain";
import type { LegalSource } from "@/lib/legal/sources";
import { getLocalSource } from "@/lib/providers/legal-source";
import { candidateSources } from "@/lib/providers/candidates";
import type { LegalAnalysisProvider } from "./legal-analysis";
import type { AssistantMessage } from "./legal-analysis";
import type {
	AssistantContextPayload,
	AssistantPage,
} from "@/lib/assistant-context";
import {
	detectDomain,
	disclaimerFor,
	factLines,
	todayLabel,
} from "./content/shared";
import { buildGenericAnalysis } from "./content/generic";

/**
 * Candidate registry sources offered to the model per domain. Shared with the
 * server routes (see ./candidates) — the client only computes the local set
 * to validate model output; the server resolves its own authoritative copy.
 */

// ── tiny safe-coercion helpers ────────────────────────────────────────────
const str = (v: unknown, fallback = ""): string =>
	typeof v === "string" ? v : fallback;
const num = (v: unknown, fallback = 0): number =>
	typeof v === "number" && Number.isFinite(v) ? v : fallback;

type ModelIssues = Array<Record<string, unknown>>;
type ModelRights = Array<Record<string, unknown>>;
type ModelSteps = Array<Record<string, unknown>>;
type ModelSections = Array<Record<string, unknown>>;

/** Coerce a model field that may be a plain string or a {en,hi} object into a
 * bilingual value; the other language falls back to whatever exists. */
const bi = (
	v: unknown,
	fallback: string,
): Partial<{ en: string; hi: string }> => {
	if (typeof v === "string") {
		return v.trim() ? { en: v, hi: v } : { en: fallback, hi: fallback };
	}
	if (v && typeof v === "object") {
		const o = v as Record<string, unknown>;
		const en = typeof o.en === "string" && o.en.trim() ? o.en.trim() : "";
		const hi = typeof o.hi === "string" && o.hi.trim() ? o.hi.trim() : "";
		if (en || hi) return { ...(en ? { en } : {}), ...(hi ? { hi } : {}) };
	}
	return { en: fallback, hi: fallback };
};

export class ApiLegalAnalysisProvider implements LegalAnalysisProvider {
	id = "api";
	isDevelopment = false;

	async analyze(
		intake: IntakeData,
		lang: Language,
		onProgress?: (p: Progress) => void,
		opts?: { fast?: boolean },
	): Promise<CaseAnalysis> {
		void opts; // accepted for LegalAnalysisProvider interface conformance; unused today
		const id =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `case-${Date.now()}`;

		const domain = intake.domain ?? detectDomain(intake.description);
		if (!domain) {
			return buildGenericAnalysis({ intake, lang, id });
		}

		const emit = (p: Progress) => onProgress?.(p);
		emit({ stage: "reading", pct: 10 });

		const lawSources = candidateSources(domain);
		// The server resolves its own authoritative candidate set by domain;
		// the client only sends intake + lang (see security review fix #1).
		const res = await fetch("/api/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ intake, lang }),
			signal: AbortSignal.timeout(600_000),
		});

		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			throw new Error(`analysis failed (${res.status}) ${detail}`);
		}
		if (!res.body) {
			throw new Error("analysis failed: empty model stream");
		}

		// SSE frames: `data: {"section":"<name>","content":{...}}` per completed
		// section (or `"error"` per failed one), then `data: {"done":bool}`.
		// All four sections merge into the same key set the single-call response
		// used, so assemble() consumes them unchanged.
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		const m: Record<string, unknown> = {};
		let buffer = "";
		let allDone = false;
		let firstError = "";

		// Progress stages owned by each section, emitted as its content lands.
		const sectionStages: Record<string, Progress[]> = {
			core: [
				{ stage: "issues", pct: 35 },
				{ stage: "rights", pct: 50 },
				{ stage: "laws", pct: 60 },
			],
			risk: [{ stage: "evidence", pct: 75 }],
			steps: [{ stage: "steps", pct: 90 }],
			document: [{ stage: "document", pct: 100 }],
		};

		while (!allDone) {
			const { value, done: streamDone } = await reader.read();
			if (streamDone) break;
			buffer += decoder.decode(value, { stream: true });
			let sep = buffer.indexOf("\n\n");
			while (sep !== -1) {
				const raw = buffer.slice(0, sep);
				buffer = buffer.slice(sep + 2);
				sep = buffer.indexOf("\n\n");
				if (!raw.startsWith("data: ")) continue;
				let evt: {
					section?: string;
					content?: unknown;
					error?: string;
					done?: boolean;
				};
				try {
					evt = JSON.parse(raw.slice(6));
				} catch {
					continue; // malformed frame — skip
				}
				if (evt.done !== undefined) {
					allDone = true;
					break;
				}
				if (!evt.section) continue;
				if (typeof evt.error === "string") {
					if (!firstError) firstError = evt.error;
					continue;
				}
				if (evt.content && typeof evt.content === "object") {
					// Flatten: each section's content carries the flat keys
					// assemble() reads (caseSummary/issues/…/document), so spread
					// it into m rather than nesting under the section name.
					Object.assign(m, evt.content);
					for (const p of sectionStages[evt.section] ?? []) emit(p);
				}
			}
		}

		const required = [
			"caseSummary",
			"issues",
			"rights",
			"lawIds",
			"uncertainty",
			"evidence",
			"nextSteps",
		];
		// "document" is intentionally absent: the letter is pass-2 (generated
		// on demand via generateDocument), so its section is never required of
		// the analysis stream. The server may still stream it; it is ignored.
		const missing = required.filter((k) => !(k in m));
		if (!allDone || missing.length > 0) {
			throw new Error(
				`analysis failed: ${
					firstError || "model stream ended before all sections completed"
				}`,
			);
		}

		return this.assemble({
			m,
			intake,
			lang,
			id,
			domain,
			lawSources,
			emit,
		});
	}

	private assemble(ctx: {
		m: Record<string, unknown>;
		intake: IntakeData;
		lang: Language;
		id: string;
		domain: Domain;
		lawSources: LegalSource[];
		emit: (p: Progress) => void;
	}): CaseAnalysis {
		const { m, intake, lang, id, domain, lawSources, emit } = ctx;
		const validIds = new Set(lawSources.map((s) => s.id));

		// Law references — resolve ONLY from the registry, via the model's chosen ids.
		const lawIdsRaw = Array.isArray(m.lawIds)
			? (m.lawIds as ModelSections)
			: [];
		const whyMap = new Map<string, ReturnType<typeof bi>>();
		const laws: LawReference[] = [];
		for (const entry of lawIdsRaw) {
			const lid = str(entry.id);
			if (!validIds.has(lid)) continue; // never invent — drop non-candidates
			const src = getLocalSource(lid);
			whyMap.set(lid, bi(entry.whyApplies, ""));
			laws.push({
				id: lid,
				act: src.act,
				section: src.section,
				title: src.title,
				plainExplanation: src.plain,
				whyApplies: whyMap.get(lid) ?? { en: "", hi: "" },
				source: src.source,
			});
		}

		emit({ stage: "laws", pct: 60 });

		const issuesRaw = Array.isArray(m.issues) ? (m.issues as ModelIssues) : [];
		const issues = issuesRaw.map((i) => ({
			id: str(i.id, "issue"),
			label: bi(i.label, "Issue"),
			kind: ([
				"fact",
				"possible-issue",
				"legal-info",
				"ai-interpretation",
			].includes(str(i.kind))
				? str(i.kind)
				: "possible-issue") as Issue["kind"],
			detail: bi(i.detail, ""),
		}));

		const rightsRaw = Array.isArray(m.rights) ? (m.rights as ModelRights) : [];
		const rights = rightsRaw.map((r) => ({
			id: str(r.id, "right"),
			title: bi(r.title, "Right"),
			plain: bi(r.plain, ""),
			linkedLaws: (Array.isArray(r.linkedLaws) ? r.linkedLaws : []).filter(
				(lid): lid is string => typeof lid === "string" && validIds.has(lid),
			),
		}));

		const uncertaintyRaw = Array.isArray(m.uncertainty)
			? (m.uncertainty as Array<Record<string, unknown>>)
			: [];
		const uncertainty: Uncertainty[] = uncertaintyRaw.map((u) => ({
			id: str(u.id, "uncertainty"),
			plain: bi(u.plain, ""),
			changesAnswer: bi(u.changesAnswer, ""),
			resolve: bi(u.resolve, ""),
		}));

		const evidenceRaw = Array.isArray(m.evidence)
			? (m.evidence as Array<Record<string, unknown>>)
			: [];
		const evidence: EvidenceItem[] = evidenceRaw.map((e) => ({
			id: str(e.id, "evidence"),
			label: bi(e.label, "Evidence"),
			why: bi(e.why, ""),
			status: "need-to-find",
			note: str(e.note, ""),
		}));

		const stepsRaw = Array.isArray(m.nextSteps)
			? (m.nextSteps as ModelSteps)
			: [];
		const steps: Step[] = stepsRaw.map((s, i) => ({
			id: str(s.id, `step-${i + 1}`),
			order: num(s.order, i + 1),
			title: bi(s.title, "Next step"),
			plain: bi(s.plain, ""),
			why: bi(s.why, ""),
			effort: (["quick", "moderate", "long"].includes(str(s.effort))
				? str(s.effort)
				: "moderate") as Step["effort"],
			urgent: s.urgent === true,
		}));

		const docRaw = (
			m.document && typeof m.document === "object"
				? (m.document as Record<string, unknown>)
				: {}
		) as Record<string, unknown>;
		const document = this.coerceDocument(docRaw, lang);

		emit({ stage: "evidence", pct: 75 });

		const analysis: CaseAnalysis = {
			id,
			language: lang,
			domain,
			caseSummary: bi(m.caseSummary, `You told us: ${intake.description}`),
			facts: factLines(intake),
			issues,
			rights,
			laws,
			uncertainty,
			evidence,
			nextSteps: steps,
			document,
			disclaimer: disclaimerFor(lang),
			generatedAt: new Date().toISOString(),
		};

		emit({ stage: "steps", pct: 90 });
		emit({ stage: "document", pct: 100 });
		return analysis;
	}

	/** Coerce raw model output into a safe DocumentData (never fabricate). */
	private coerceDocument(
		raw: Record<string, unknown>,
		lang: Language,
	): DocumentData {
		const docType: DocumentType = [
			"legal-notice",
			"consumer-complaint",
			"labour-complaint",
			"other",
		].includes(str(raw.type))
			? (str(raw.type) as DocumentType)
			: "legal-notice";
		const sectionsRaw = Array.isArray(raw.sections)
			? (raw.sections as ModelSections)
			: [];
		return {
			type: docType,
			title: str(raw.title, "LEGAL NOTICE"),
			date: todayLabel(lang),
			fromParty: str(raw.fromParty, "[Your name and address]"),
			toParty: str(raw.toParty, "[Other party]"),
			subject: str(raw.subject),
			sections: sectionsRaw.map((s) => ({
				heading: str(s.heading, "SECTION"),
				body: str(s.body),
			})),
			legalReferences: (Array.isArray(raw.legalReferences)
				? (raw.legalReferences as unknown[])
				: []
			).filter((r): r is string => typeof r === "string"),
			remedy: str(raw.remedy),
			signature: {
				name: str(
					(raw.signature as Record<string, unknown> | undefined)?.name,
					"[Your name]",
				),
				role: str(
					(raw.signature as Record<string, unknown> | undefined)?.role,
					"[Your address and contact]",
				),
			},
			language: lang,
		};
	}

	async generateDocument(ctx: {
		analysis: CaseAnalysis;
		intake: IntakeData;
		lang: Language;
		edits?: Partial<DocumentData>;
	}): Promise<DocumentData> {
		const { analysis, intake, lang, edits } = ctx;
		if (analysis.domain === "other") {
			// No model call for the generic fallback — honor edits on the base
			// draft (pass 1 ships a generic letter for these cases).
			return { ...(analysis.document ?? {}), ...(edits ?? {}) } as DocumentData;
		}
		// The server resolves its own authoritative candidate set by domain;
		// the client only sends intake + lang (see security review fix #1).
		// The analysis context grounds the draft in the model's own findings
		// (issues, chosen laws, next steps), matching the analyze pipeline.
		const context = {
			caseSummary: analysis.caseSummary,
			issues: analysis.issues,
			rights: analysis.rights,
			lawIds: analysis.laws.map((l) => ({
				id: l.id,
				whyApplies: l.whyApplies,
			})),
			uncertainty: analysis.uncertainty,
			evidence: analysis.evidence,
			nextSteps: analysis.nextSteps,
		};
		const res = await fetch("/api/document", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ intake, lang, context }),
			signal: AbortSignal.timeout(300_000),
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			throw new Error(`document generation failed (${res.status}) ${detail}`);
		}
		const data = (await res.json()) as { content?: unknown };
		if (!data || typeof data.content !== "object" || data.content === null) {
			throw new Error("model returned no valid document");
		}
		// The context-grounded path returns the draft wrapped under a
		// "document" key (same shape as the analyze stream); the legacy plain
		// path returns the flat object. Unwrap before coercing.
		const content = data.content as Record<string, unknown>;
		const docRaw =
			content.document && typeof content.document === "object"
				? (content.document as Record<string, unknown>)
				: content;
		const base = this.coerceDocument(docRaw, lang);
		// User edits always win over the model's fresh draft.
		return { ...base, ...(edits ?? {}) };
	}

	/** Ask the case-aware assistant a follow-up question (streaming SSE). */
	async askAssistant(
		ctx: {
			context: AssistantContextPayload;
			question: string;
			history: AssistantMessage[];
			lang: Language;
			page: AssistantPage;
		},
		onDelta?: (delta: string) => void,
	): Promise<string> {
		const { context, question, history, lang, page } = ctx;
		const res = await fetch("/api/assistant", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				mode: "chat",
				page,
				lang,
				question,
				history,
				context,
			}),
			signal: AbortSignal.timeout(300_000),
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			throw new Error(`assistant failed (${res.status}) ${detail}`);
		}
		if (!res.body) throw new Error("assistant failed: empty stream");

		// SSE frames: `data: {"delta":"…"}` chunks, then `data: {"done":true}`
		// (or a `{"error":"…"}` frame mid-stream).
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		let text = "";
		let failed = "";
		let done = false;
		try {
			while (!done) {
				const { value, done: streamDone } = await reader.read();
				if (streamDone) break;
				buffer += decoder.decode(value, { stream: true });
				let sep = buffer.indexOf("\n\n");
				while (sep !== -1) {
					const raw = buffer.slice(0, sep);
					buffer = buffer.slice(sep + 2);
					sep = buffer.indexOf("\n\n");
					if (!raw.startsWith("data: ")) continue;
					let evt: { delta?: string; done?: boolean; error?: string };
					try {
						evt = JSON.parse(raw.slice(6));
					} catch {
						continue; // malformed frame — skip
					}
					if (typeof evt.error === "string" && evt.error) failed = evt.error;
					if (evt.done !== undefined) {
						done = true;
						break;
					}
					if (typeof evt.delta === "string" && evt.delta) {
						text += evt.delta;
						onDelta?.(evt.delta);
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
		if (failed) throw new Error(`assistant failed: ${failed}`);
		const trimmed = text.trim();
		if (!trimmed) throw new Error("assistant returned empty answer");
		return trimmed;
	}

	/** Ask the assistant to revise the current document draft per an instruction. */
	async reviseDocument(ctx: {
		analysis: CaseAnalysis;
		intake: IntakeData;
		lang: Language;
		currentDraft: DocumentData;
		instruction: string;
	}): Promise<DocumentData> {
		const { analysis, intake, lang, currentDraft, instruction } = ctx;
		if (analysis.domain === "other") {
			// The generic fallback has no model path — return the draft unchanged.
			return currentDraft;
		}
		const res = await fetch("/api/assistant", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				mode: "document",
				lang,
				instruction,
				draft: currentDraft,
				context: {
					domain: analysis.domain,
					intake,
					caseSummary: analysis.caseSummary,
					issues: analysis.issues,
				},
			}),
			signal: AbortSignal.timeout(300_000),
		});
		if (!res.ok) {
			const detail = await res.text().catch(() => "");
			throw new Error(`document revision failed (${res.status}) ${detail}`);
		}
		const data = (await res.json()) as { content?: unknown };
		const content =
			data.content && typeof data.content === "object"
				? (data.content as Record<string, unknown>)
				: {};
		const docRaw =
			content.document && typeof content.document === "object"
				? (content.document as Record<string, unknown>)
				: content;
		const base = this.coerceDocument(docRaw, lang);
		// The model shouldn't silently re-date the letter — keep the current date.
		return { ...base, date: currentDraft.date };
	}

	detectDomain(text: string): Domain | undefined {
		return detectDomain(text);
	}
}
