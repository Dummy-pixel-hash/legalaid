/**
 * MockLegalAnalysisProvider — deterministic, parameterized mock of the AI backend.
 * Replaces the future fine-tuned model / RAG pipeline behind the same interface.
 * Emits staged Progress events so the loading UI is real, not theater.
 */

import type {
	CaseAnalysis,
	DocumentData,
	Domain,
	IntakeData,
	Language,
	Progress,
} from "@/lib/types/domain";
import { ANALYSIS_STAGES, type LegalAnalysisProvider } from "./legal-analysis";
import type { AssistantMessage } from "./legal-analysis";
import type {
	AssistantContextPayload,
	AssistantPage,
} from "@/lib/assistant-context";
import { detectDomain } from "./content/shared";
import { buildConsumerAnalysis } from "./content/consumer";
import { buildLabourAnalysis } from "./content/labour";
import { buildTenantAnalysis } from "./content/tenant";
import { buildGenericAnalysis } from "./content/generic";
import { buildDocumentForDomain } from "./content/document";

const STAGE_DELAY_MS: Record<Progress["stage"], number> = {
	reading: 700,
	issues: 600,
	rights: 550,
	laws: 900,
	evidence: 450,
	steps: 500,
	document: 700,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockLegalAnalysisProvider implements LegalAnalysisProvider {
	id = "mock";
	isDevelopment = true;

	async analyze(
		intake: IntakeData,
		lang: Language,
		onProgress?: (p: Progress) => void,
		opts?: { fast?: boolean },
	): Promise<CaseAnalysis> {
		const domain = intake.domain ?? detectDomain(intake.description);
		const id =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `case-${Date.now()}`;

		// Staged "work" with honest progress copy per stage.
		// Language switches pass fast:true so they resolve the same intake
		// instantly instead of replaying the full staged pipeline.
		let pct = 0;
		if (!opts?.fast) {
			for (const stage of ANALYSIS_STAGES) {
				pct += Math.round(100 / ANALYSIS_STAGES.length);
				onProgress?.({ stage, pct });
				await sleep(STAGE_DELAY_MS[stage]);
			}
		} else {
			pct = 100;
			onProgress?.({ stage: "document", pct });
		}

		const builders: Record<Domain, typeof buildConsumerAnalysis> = {
			consumer: buildConsumerAnalysis,
			labour: buildLabourAnalysis,
			tenant: buildTenantAnalysis,
		};

		const build = domain ? builders[domain] : buildGenericAnalysis;
		return build({ intake, lang, id });
	}

	async generateDocument(ctx: {
		analysis: CaseAnalysis;
		intake: IntakeData;
		lang: Language;
		edits?: Partial<DocumentData>;
	}): Promise<DocumentData> {
		const base = buildDocumentForDomain(
			ctx.analysis.domain,
			ctx.intake,
			ctx.lang,
		);
		return { ...base, ...(ctx.edits ?? {}) };
	}

	/** Deterministic demo answers — keyword-matched to the page, streamed in
	 * chunks so the typewriter UI is real. Honesty: every mock answer carries
	 * a visible demo note (mirrors DevelopmentProviderNotice). */
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
		const answer = this.mockAnswer(ctx);
		const chunks: string[] = [];
		for (let i = 0; i < answer.length; i += 64) {
			chunks.push(answer.slice(i, i + 64));
		}
		for (const chunk of chunks) onDelta?.(chunk);
		return answer;
	}

	private mockAnswer(ctx: {
		context: AssistantContextPayload;
		question: string;
		lang: Language;
		page: AssistantPage;
	}): string {
		const { context, question, lang, page } = ctx;
		const q = question.toLowerCase();
		const hi = lang === "hi";
		const demoNote = hi
			? "[डेमो उत्तर — असली जवाब के लिए मॉडल बैकएंड जोड़ें]"
			: "[Demo answer — connect the model backend for real responses]";

		// Explicit Hindi request → answer in Hindi regardless of UI language.
		if (q.includes("hindi") || q.includes("हिंदी")) {
			return `आपके मामले की बात करें तो: ${context.caseSummary || "आपकी स्थिति का सारांश"}। यह केवल सामान्य कानूनी जानकारी है। मदद के लिए हेल्पलाइन 15100 पर संपर्क करें। ${demoNote}`;
		}

		const firstLaw = context.laws[0];
		const firstStep = context.nextSteps[0];
		const firstEvidence = context.evidence[0];
		const summary =
			context.caseSummary || (hi ? "आपकी स्थिति" : "your situation");

		if (page === "evidence" && firstEvidence) {
			return hi
				? `यह सबूत इसलिए महत्वपूर्ण है क्योंकि ${firstEvidence.why}। ${firstEvidence.label} रखना और सुरक्षित करना आपके मामले को मज़बूत करता है। ${demoNote}`
				: `This evidence matters because ${firstEvidence.why} — keeping ${firstEvidence.label} safe strengthens your case. ${demoNote}`;
		}

		if (page === "steps" && firstStep) {
			return hi
				? `पहले यह करें: ${firstStep.title} — ${firstStep.plain}। कारण: ${firstStep.why}। ${demoNote}`
				: `Start with this first: ${firstStep.title} — ${firstStep.plain}. Why: ${firstStep.why}. ${demoNote}`;
		}

		if (page === "document") {
			return hi
				? `आपका दस्तावेज़ (${context.document?.type ?? "मसौदा"}) मुख्य रूप से ${context.document?.remedy ?? "मांग"} पर केंद्रित है। इसे जाँचें और फिर PDF डाउनलोड करें। ${demoNote}`
				: `Your ${context.document?.type ?? "draft"} centres on ${context.document?.remedy ?? "your remedy"} — review it, then export it as PDF. ${demoNote}`;
		}

		if (page === "analysis") {
			const lawBit = firstLaw
				? hi
					? `संभवित कानून: ${firstLaw.act} — ${firstLaw.section} (${firstLaw.whyApplies})`
					: `​A law that may apply: ${firstLaw.act} — ${firstLaw.section} (${firstLaw.whyApplies})`
				: "";
			return hi
				? `संक्षेप में: ${summary}${
						lawBit
							? `

${lawBit}`
							: ""
					} । यह सामान्य जानकारी है, सलाह नहीं। ${demoNote}`
				: `In brief: ${summary}${
						lawBit
							? `

${lawBit}`
							: ""
					}. This is general information, not advice. ${demoNote}`;
		}

		return hi
			? `आपके मामले के आगे के कदमों के लिए “अगले कदम” देखें। ${demoNote}`
			: `Check “Next steps” for what to do next with your case. ${demoNote}`;
	}

	/** Deterministic demo revision: visibly marks the draft so the round-trip
	 * (propose → apply/discard) is testable without a backend. */
	async reviseDocument(ctx: {
		analysis: CaseAnalysis;
		intake: IntakeData;
		lang: Language;
		currentDraft: DocumentData;
		instruction: string;
	}): Promise<DocumentData> {
		const { currentDraft, lang } = ctx;
		const note =
			lang === "hi"
				? "[डेमो संशोधन — असली बदलाव के लिए मॉडल बैकएंड जोड़ें]"
				: "[Demo revision — connect the model backend for real changes]";
		return {
			...currentDraft,
			sections: currentDraft.sections.map((s, i) =>
				i === 0 ? { ...s, body: `${s.body}\n\n${note}` } : s,
			),
		};
	}

	detectDomain(text: string): Domain | undefined {
		return detectDomain(text);
	}
}
