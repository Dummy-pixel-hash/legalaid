/**
 * Candidate legal sources offered to the model, per domain.
 *
 * Shared by the client provider (ApiLegalAnalysisProvider) and the server API
 * routes. The SERVER is authoritative: routes resolve candidates from this
 * registry by domain and never trust client-supplied law sources — that is the
 * indirect prompt-injection trust boundary (attacker-controlled "law" text
 * must never reach the model prompt).
 */

import { LEGAL_SOURCES, type LegalSource } from "@/lib/legal/sources";
import type { Domain } from "@/lib/types/domain";

export const CANDIDATE_IDS: Record<Domain, string[]> = {
	consumer: [
		"cpa-2019-s2-7",
		"cpa-2019-s2-42",
		"cpa-2019-s35",
		"cpa-2019-s39",
		"cpa-2019-s72",
		"ecom-rules-2020-r4",
		"ecom-rules-2020-r6",
	],
	labour: [
		"cow-2019-s17",
		"cow-2019-s18",
		"pwa-1936-s4",
		"pwa-1936-s5",
		"mwa-1948-s12",
		"ida-1947-s33c2",
		"ida-1947-s25f",
		"epf-1952-s7a",
		"pga-1972-s4",
	],
	tenant: [
		"tpa-1882-s105",
		"tpa-1882-s106",
		"tpa-1882-s108",
		"tpa-1882-s111",
		"ica-1872-s73",
		"mta-2021-deposit",
		"state-rent-act",
	],
};

/** Resolve the registry sources for a domain. Unknown domains → []. */
export function candidateSources(domain: Domain): LegalSource[] {
	const ids = CANDIDATE_IDS[domain];
	if (!ids) return [];
	return ids
		.map((id) => LEGAL_SOURCES.find((s) => s.id === id))
		.filter((s): s is LegalSource => Boolean(s));
}
