/**
 * LegalAId — domain contract.
 * Every screen renders from these types. Providers produce them; components consume them.
 * No legal content lives in components — only in data of these shapes.
 */

export type Domain = "consumer" | "labour" | "tenant";
export type Language = "en" | "hi";

/** How confident a claim is. Rendered as an icon + label, never color-only. */
export type ConfidenceKind =
	| "fact" // what the user told us / established text
	| "possible-issue" // a plausible issue, not a ruling
	| "legal-info" // general law, cited
	| "ai-interpretation" // the assistant's reading — clearly marked
	| "verified" // a real, confirmed Act/Code section
	| "demo"; // placeholder / state-specific guidance — verify with an expert

export interface IntakeData {
	description: string;
	domain?: Domain;
	state?: string;
	otherParty?: string;
	amount?: number;
	dates?: { label: string; date?: string }[];
	evidenceOnHand?: string[];
	/** Clarifying answers keyed by question id. */
	answers?: Record<string, string>;
}

export interface SourceRef {
	name: string; // e.g. "Consumer Protection Act, 2019"
	type: "act" | "code" | "rule" | "guideline" | "state-law";
	ref: string; // e.g. "§35" or "Rule 6"
	url?: string;
	/** STRICT: never silently true. Only real, confirmed citations. */
	verified: boolean;
	note?: string; // e.g. "state adoption varies"
}

export interface LawReference {
	id: string; // key into lib/legal/sources.ts
	act: string;
	section: string;
	/** Bilingual — the canonical analysis carries both languages. */
	title: Partial<BilingualText>; // short human title
	plainExplanation: Partial<BilingualText>;
	whyApplies: Partial<BilingualText>;
	source: SourceRef;
}

export interface Issue {
	id: string;
	label: Partial<BilingualText>;
	kind: ConfidenceKind;
	detail: Partial<BilingualText>;
}

export interface Right {
	id: string;
	title: Partial<BilingualText>;
	plain: Partial<BilingualText>;
	linkedLaws: string[]; // law ids
}

export interface Uncertainty {
	id: string;
	plain: Partial<BilingualText>;
	changesAnswer: Partial<BilingualText>;
	resolve: Partial<BilingualText>;
}

export type EvidenceStatus = "have" | "dont-have" | "need-to-find" | "unset";

/** Text provided in both supported languages (en + hi). */
export interface BilingualText {
	en: string;
	hi: string;
}

/** Pick the text for the active language, falling back across the other.
 * Plain strings pass through (older persisted analyses are single-language). */
export function localize(
	bt: Partial<BilingualText> | string | undefined,
	lang: Language,
): string {
	if (bt == null) return "";
	if (typeof bt === "string") return bt;
	return bt[lang] ?? bt.en ?? bt.hi ?? "";
}

export interface EvidenceItem {
	id: string;
	/** Bilingual so the checklist is identical across language toggles; the UI
	 * renders the active language (see localize). */
	label: Partial<BilingualText>;
	why: Partial<BilingualText>;
	status: EvidenceStatus;
	note?: string;
}

export interface Step {
	id: string;
	order: number;
	title: Partial<BilingualText>;
	plain: Partial<BilingualText>;
	why: Partial<BilingualText>;
	effort: "quick" | "moderate" | "long";
	urgent?: boolean;
}

export type DocumentType =
	| "legal-notice"
	| "consumer-complaint"
	| "labour-complaint"
	| "other";

export interface DocumentSection {
	heading: string;
	body: string;
}

export interface DocumentData {
	type: DocumentType;
	title: string;
	date: string;
	fromParty: string;
	toParty: string;
	subject: string;
	sections: DocumentSection[];
	legalReferences: string[]; // e.g. "Consumer Protection Act, 2019 — §35"
	remedy: string;
	signature: { name: string; role: string };
	language: Language;
}

export interface CaseAnalysis {
	id: string;
	/** The language the analysis was first generated in; the content fields are
	 * bilingual, so the UI renders the active language regardless. */
	language: Language;
	domain: Domain | "other";
	caseSummary: Partial<BilingualText>; // restated understanding (FACT)
	facts: BilingualText[];
	issues: Issue[];
	rights: Right[];
	laws: LawReference[];
	uncertainty: Uncertainty[];
	evidence: EvidenceItem[];
	nextSteps: Step[];
	document: DocumentData;
	disclaimer: string;
	generatedAt: string;
}

/** Stage of the analysis pipeline, for staged loading UI. */
export type AnalysisStage =
	| "reading"
	| "issues"
	| "rights"
	| "laws"
	| "evidence"
	| "steps"
	| "document";

export type AnalysisStatus = "idle" | "analyzing" | "ready" | "error";

export interface Progress {
	stage: AnalysisStage;
	pct: number;
}
