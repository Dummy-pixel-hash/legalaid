/**
 * Provider factory — the single seam where the AI backend is swapped.
 * NEXT_PUBLIC_AI_PROVIDER=mock (default) | api | local | rag (future).
 *   api → ApiLegalAnalysisProvider: drives the model backend via /api/analyze
 *         (configure server-side AI_ENDPOINT / AI_MODEL in src/lib/model/chat.ts).
 */

import type { LegalAnalysisProvider } from "./legal-analysis";
import { MockLegalAnalysisProvider } from "./mock-provider";
import { ApiLegalAnalysisProvider } from "./api-provider";

let cached: LegalAnalysisProvider | null = null;

export function getProvider(): LegalAnalysisProvider {
  if (cached) return cached;
  const kind = process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock";
  switch (kind) {
    case "api":
      cached = new ApiLegalAnalysisProvider();
      return cached;
    // Future providers implement the same interface:
    // case "local": return new LocalModelProvider();
    // case "rag":  return new RagProvider({ sources });
    default:
      cached = new MockLegalAnalysisProvider();
      return cached;
  }
}
