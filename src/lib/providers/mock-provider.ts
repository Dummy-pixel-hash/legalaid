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
    const base = buildDocumentForDomain(ctx.analysis.domain, ctx.intake, ctx.lang);
    return { ...base, ...(ctx.edits ?? {}) };
  }

  detectDomain(text: string): Domain | undefined {
    return detectDomain(text);
  }
}
