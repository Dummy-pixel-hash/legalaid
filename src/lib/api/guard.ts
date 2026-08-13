/**
 * Server-side request validation for the model API routes (/api/analyze,
 * /api/document). This is the trust boundary: nothing in the request body
 * reaches the model prompt unless it passes these shape + size checks.
 *
 * Rejects (400) rather than silently truncating: an oversized or malformed
 * payload is a client bug or abuse — fail loudly instead of shipping partial
 * or attacker-shaped facts to the model.
 */

import type { Domain, IntakeData, Language } from "@/lib/types/domain";

/** Payload size caps (generous for real use, bounded against abuse). */
export const LIMITS = {
	bodyBytes: 128 * 1024, // raw request body cap (checked via content-length)
	description: 10_000,
	otherParty: 500,
	state: 200,
	amountMax: 1_000_000_000, // ₹1 billion
	dates: 20,
	dateLabel: 100,
	dateValue: 50,
	evidenceOnHand: 30,
	evidenceItem: 200,
	answerKey: 100,
	answerValue: 500,
	answers: 20,
} as const;

const DOMAINS: ReadonlySet<string> = new Set<Domain>([
	"consumer",
	"labour",
	"tenant",
]);

/** Thrown for any validation violation; routes map it to a 400 response. */
export class BadRequestError extends Error {}

function fail(msg: string): never {
	throw new BadRequestError(msg);
}

/** Optional bounded string: absent → undefined, blank → undefined, else trimmed. */
function optStr(v: unknown, max: number): string | undefined {
	if (v === undefined) return undefined;
	if (typeof v !== "string") fail("invalid intake field");
	const s = v.trim();
	if (s.length === 0) return undefined;
	if (s.length > max) fail("intake field too long");
	return s;
}

/** Required bounded string. */
function reqStr(v: unknown, max: number): string {
	const s = optStr(v, max);
	if (s === undefined) fail("missing intake or lang");
	return s;
}

/**
 * Validate + normalize an API request body into a bounded IntakeData.
 * Throws BadRequestError on the first violation.
 */
export function guardIntakePayload(body: unknown): {
	intake: IntakeData;
	lang: Language;
} {
	if (typeof body !== "object" || body === null || Array.isArray(body)) {
		fail("invalid json");
	}
	const b = body as Record<string, unknown>;
	const lang = b.lang;
	if (lang !== "en" && lang !== "hi") fail("missing intake or lang");

	const raw = b.intake;
	if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
		fail("missing intake or lang");
	}
	const it = raw as Record<string, unknown>;

	const description = reqStr(it.description, LIMITS.description);

	let domain: Domain | undefined;
	if (it.domain !== undefined) {
		if (typeof it.domain !== "string" || !DOMAINS.has(it.domain)) {
			fail("invalid domain");
		}
		domain = it.domain as Domain;
	}

	const state = optStr(it.state, LIMITS.state);
	const otherParty = optStr(it.otherParty, LIMITS.otherParty);

	let amount: number | undefined;
	if (it.amount !== undefined) {
		if (
			typeof it.amount !== "number" ||
			!Number.isFinite(it.amount) ||
			it.amount < 0 ||
			it.amount > LIMITS.amountMax
		) {
			fail("invalid amount");
		}
		amount = it.amount;
	}

	let dates: IntakeData["dates"];
	if (it.dates !== undefined) {
		if (!Array.isArray(it.dates) || it.dates.length > LIMITS.dates) {
			fail("invalid dates");
		}
		dates = it.dates.map((d) => {
			if (typeof d !== "object" || d === null || Array.isArray(d)) {
				fail("invalid dates");
			}
			const dd = d as Record<string, unknown>;
			const label = reqStr(dd.label, LIMITS.dateLabel);
			const date = optStr(dd.date, LIMITS.dateValue);
			return date === undefined ? { label } : { label, date };
		});
	}

	let evidenceOnHand: string[] | undefined;
	if (it.evidenceOnHand !== undefined) {
		if (
			!Array.isArray(it.evidenceOnHand) ||
			it.evidenceOnHand.length > LIMITS.evidenceOnHand
		) {
			fail("invalid evidence list");
		}
		evidenceOnHand = it.evidenceOnHand
			.map((e) => optStr(e, LIMITS.evidenceItem))
			.filter((e): e is string => e !== undefined);
	}

	let answers: Record<string, string> | undefined;
	if (it.answers !== undefined) {
		if (
			typeof it.answers !== "object" ||
			it.answers === null ||
			Array.isArray(it.answers)
		) {
			fail("invalid answers");
		}
		const entries = Object.entries(it.answers as Record<string, unknown>);
		if (entries.length > LIMITS.answers) fail("too many answers");
		answers = {};
		for (const [k, v] of entries) {
			const key = optStr(k, LIMITS.answerKey);
			if (key === undefined) fail("invalid answers");
			const val = typeof v === "string" ? v.trim() : fail("invalid answers");
			if (val.length > LIMITS.answerValue) fail("answers too long");
			answers[key] = val;
		}
	}

	const intake: IntakeData = {
		description,
		...(domain !== undefined && { domain }),
		...(state !== undefined && { state }),
		...(otherParty !== undefined && { otherParty }),
		...(amount !== undefined && { amount }),
		...(dates !== undefined && { dates }),
		...(evidenceOnHand !== undefined && { evidenceOnHand }),
		...(answers !== undefined && { answers }),
	};

	return { intake, lang };
}
