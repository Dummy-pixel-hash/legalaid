/**
 * Builds the localized case-context payload the assistant is grounded in.
 *
 * The analysis is canonical (bilingual); the payload localizes every field to
 * the ACTIVE language so the server prompt is half the size. The document
 * (current draft incl. user edits) is only included for the document page.
 */

import {
	localize,
	type CaseAnalysis,
	type DocumentData,
	type EvidenceStatus,
	type IntakeData,
	type Language,
} from "@/lib/types/domain";

export type AssistantPage = "analysis" | "evidence" | "steps" | "document";

export const ASSISTANT_PAGES: readonly AssistantPage[] = [
	"analysis",
	"evidence",
	"steps",
	"document",
];

export interface AssistantContextPayload {
	domain: CaseAnalysis["domain"];
	intake: {
		description: string;
		state?: string;
		otherParty?: string;
		amount?: number;
		dates?: string[];
	};
	caseSummary: string;
	issues: Array<{ label: string; detail: string }>;
	rights: Array<{ title: string; plain: string }>;
	laws: Array<{
		act: string;
		section: string;
		title: string;
		plain: string;
		whyApplies: string;
		verified: boolean;
	}>;
	uncertainty: Array<{ plain: string; changesAnswer: string; resolve: string }>;
	evidence: Array<{ label: string; why: string; status: EvidenceStatus }>;
	nextSteps: Array<{ title: string; plain: string; why: string }>;
	document?: DocumentData;
}

export function buildAssistantContext(
	record: { intake: IntakeData },
	analysis: CaseAnalysis,
	lang: Language,
	document?: DocumentData,
): AssistantContextPayload {
	const it = record.intake;
	return {
		domain: analysis.domain,
		intake: {
			description: it.description,
			...(it.state && { state: it.state }),
			...(it.otherParty && { otherParty: it.otherParty }),
			...(it.amount !== undefined && { amount: it.amount }),
			...(it.dates?.length && {
				dates: it.dates.map((d) =>
					d.date ? `${d.label}: ${d.date}` : d.label,
				),
			}),
		},
		caseSummary: localize(analysis.caseSummary, lang),
		issues: analysis.issues.map((i) => ({
			label: localize(i.label, lang),
			detail: localize(i.detail, lang),
		})),
		rights: analysis.rights.map((r) => ({
			title: localize(r.title, lang),
			plain: localize(r.plain, lang),
		})),
		laws: analysis.laws.map((l) => ({
			act: l.act,
			section: l.section,
			title: localize(l.title, lang),
			plain: localize(l.plainExplanation, lang),
			whyApplies: localize(l.whyApplies, lang),
			verified: l.source.verified,
		})),
		uncertainty: analysis.uncertainty.map((u) => ({
			plain: localize(u.plain, lang),
			changesAnswer: localize(u.changesAnswer, lang),
			resolve: localize(u.resolve, lang),
		})),
		evidence: analysis.evidence.map((e) => ({
			label: localize(e.label, lang),
			why: localize(e.why, lang),
			status: e.status,
		})),
		nextSteps: analysis.nextSteps.map((s) => ({
			title: localize(s.title, lang),
			plain: localize(s.plain, lang),
			why: localize(s.why, lang),
		})),
		...(document ? { document } : {}),
	};
}
