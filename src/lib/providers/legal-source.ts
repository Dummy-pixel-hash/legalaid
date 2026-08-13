/**
 * LegalAId — legal-source provider abstraction (spec §13).
 * The "legal retriever" seam: a replaceable backend that resolves legal sources.
 * Current: LocalLegalSourceProvider backed by the LEGAL_SOURCES registry.
 * Future: verified legal database / RAG retrieval behind the same interface.
 */

import { LEGAL_SOURCES, type LegalSource } from "@/lib/legal/sources";
import type { Domain } from "@/lib/types/domain";

export interface LegalSearchQuery {
  text: string;
  /** Accepted for interface completeness; unused today — the registry has no
   * per-source domain metadata, so matching is text-only. */
  domain?: Domain;
}

export interface LegalSourceProvider {
  /** Resolve a registry record by id, else null. */
  getSource(id: string): Promise<LegalSource | null>;
  /** Resolve a section record by id, else null. The registry stores sections,
   * so today this equals getSource; a future split may separate Act vs section. */
  getSection(id: string): Promise<LegalSource | null>;
  /** Case-insensitive substring match over act, section, title and plain
   * (en + hi). Empty/normalized-empty text returns []. */
  search(query: LegalSearchQuery): Promise<LegalSource[]>;
}

export class LocalLegalSourceProvider implements LegalSourceProvider {
  readonly id = "local";

  async getSource(id: string): Promise<LegalSource | null> {
    return LEGAL_SOURCES.find((s) => s.id === id) ?? null;
  }

  async getSection(id: string): Promise<LegalSource | null> {
    return this.getSource(id);
  }

  async search(query: LegalSearchQuery): Promise<LegalSource[]> {
    const text = query.text.trim().toLowerCase();
    if (!text) return [];
    return LEGAL_SOURCES.filter((s) =>
      [s.act, s.section, s.title.en, s.title.hi, s.plain.en, s.plain.hi].some(
        (field) => field.toLowerCase().includes(text),
      ),
    );
  }
}

let legalCache: LegalSourceProvider | null = null;

/** Memoized singleton provider factory. */
export function getLegalSourceProvider(): LegalSourceProvider {
  if (!legalCache) legalCache = new LocalLegalSourceProvider();
  return legalCache;
}

/**
 * Synchronous resolver — the single seam the (sync) content builders use.
 * The async interface above exists for a future verified-database/RAG backend.
 */
export function getLocalSource(id: string): LegalSource {
  const src = LEGAL_SOURCES.find((s) => s.id === id);
  if (!src) throw new Error("Unknown legal source: " + id);
  return src;
}
