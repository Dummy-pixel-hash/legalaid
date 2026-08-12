/**
 * MockLegalAnalysisProvider — deterministic, parameterized mock of the AI backend.
 * Replaces the future fine-tuned model / RAG pipeline behind the same interface.
 * Emits staged Progress events so the loading UI is real, not theater.
 */

import type {
  CaseAnalysis,
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

  async analyze(
    intake: IntakeData,
    lang: Language,
    onProgress?: (p: Progress) => void,
  ): Promise<CaseAnalysis> {
    const domain = intake.domain ?? detectDomain(intake.description);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `case-${Date.now()}`;

    // Staged "work" with honest progress copy per stage.
    let pct = 0;
    for (const stage of ANALYSIS_STAGES) {
      pct += Math.round(100 / ANALYSIS_STAGES.length);
      onProgress?.({ stage, pct });
      await sleep(STAGE_DELAY_MS[stage]);
    }

    const builders: Record<Domain, typeof buildConsumerAnalysis> = {
      consumer: buildConsumerAnalysis,
      labour: buildLabourAnalysis,
      tenant: buildTenantAnalysis,
    };

    const build = domain ? builders[domain] : buildGenericAnalysis;
    return build({ intake, lang, id });
  }

  async generateDocument(): Promise<never> {
    // The mock analysis already includes the document; regeneration is a no-op
    // in this provider (kept for interface parity with future providers).
    throw new Error("Mock provider: use analysis.document");
  }

  detectDomain(text: string): Domain | undefined {
    return detectDomain(text);
  }
}
