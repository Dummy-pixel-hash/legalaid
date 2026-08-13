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
  | "ai-interpretation"; // the assistant's reading — clearly marked

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
  title: string; // short human title
  plainExplanation: string;
  whyApplies: string;
  source: SourceRef;
}

export interface Issue {
  id: string;
  label: string;
  kind: ConfidenceKind;
  detail: string;
}

export interface Right {
  id: string;
  title: string;
  plain: string;
  linkedLaws: string[]; // law ids
}

export interface Uncertainty {
  id: string;
  plain: string;
  changesAnswer: string;
  resolve: string;
}

export type EvidenceStatus = "have" | "dont-have" | "need-to-find" | "unset";

/** Text provided in both supported languages (en + hi). */
export interface BilingualText {
  en: string;
  hi: string;
}

/** Pick the text for the active language, falling back across the other. */
export function localize(bt: Partial<BilingualText> | undefined, lang: Language): string {
  if (!bt) return "";
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
  title: string;
  plain: string;
  why: string;
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
  language: Language;
  domain: Domain | "other";
  caseSummary: string; // restated understanding (FACT)
  facts: string[];
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

export type AnalysisStatus =
  | "idle"
  | "analyzing"
  | "ready"
  | "error";

export interface Progress {
  stage: AnalysisStage;
  pct: number;
}
