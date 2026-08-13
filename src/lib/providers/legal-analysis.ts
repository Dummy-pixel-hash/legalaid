/**
 * LegalAId — AI provider abstraction.
 * The UI consumes structured CaseAnalysis; providers are replaceable.
 * Current: MockLegalAnalysisProvider. Future: API / local model / fine-tuned / RAG.
 */

import type {
  CaseAnalysis,
  Domain,
  DocumentData,
  IntakeData,
  Language,
  Progress,
} from "@/lib/types/domain";

export interface LegalAnalysisProvider {
  id: string;
  /** True when this provider is a development/demo stand-in, not the trained model. */
  readonly isDevelopment: boolean;
  /** Full analysis for an intake. onProgress drives the staged loading UI. */
  analyze(
    intake: IntakeData,
    lang: Language,
    onProgress?: (p: Progress) => void,
    opts?: { fast?: boolean },
  ): Promise<CaseAnalysis>;
  /** Return the document for an analysis, regenerated for a language and intake,
   * with user edits applied on top. */
  generateDocument(
    ctx: {
      analysis: CaseAnalysis;
      intake: IntakeData;
      lang: Language;
      edits?: Partial<DocumentData>;
    },
  ): Promise<DocumentData>;
  /** Best-effort domain detection from free text (en/hi/mixed). */
  detectDomain(text: string): Domain | undefined;
}

export const ANALYSIS_STAGES: Progress["stage"][] = [
  "reading",
  "issues",
  "rights",
  "laws",
  "evidence",
  "steps",
  "document",
];
