/**
 * Provider factory — the single seam where the AI backend is swapped.
 * NEXT_PUBLIC_AI_PROVIDER=mock (default) | api | local | rag (future).
 */

import type { LegalAnalysisProvider } from "./legal-analysis";
import { MockLegalAnalysisProvider } from "./mock-provider";

let cached: LegalAnalysisProvider | null = null;

export function getProvider(): LegalAnalysisProvider {
  if (cached) return cached;
  const kind = process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock";
  switch (kind) {
    // Future providers implement the same interface:
    // case "api":  return new ApiProvider({ endpoint, apiKey });
    // case "local": return new LocalModelProvider();
    // case "rag":  return new RagProvider({ sources });
    default:
      cached = new MockLegalAnalysisProvider();
      return cached;
  }
}
