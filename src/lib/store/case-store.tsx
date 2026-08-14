"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import type {
	AnalysisStatus,
	CaseAnalysis,
	DocumentData,
	EvidenceItem,
	EvidenceStatus,
	IntakeData,
	Language,
	Progress,
} from "@/lib/types/domain";
import type { AssistantMessage } from "@/lib/providers/legal-analysis";
import { getProvider } from "@/lib/providers";
import { DEMO_CASES } from "@/lib/mock/demo-cases";

const STORAGE_KEY = "laid.cases.v1";

/** Assistant conversation cap per case — history stays bounded in storage. */
const THREAD_LIMIT = 50;

interface CaseOverrides {
	evidence: Record<string, { status: EvidenceStatus; note?: string }>;
	customEvidence: EvidenceItem[];
	/** Document edits (and regenerated drafts) per language, so editing or
	 * regenerating the letter in one language never leaks into the other. */
	document: Partial<Record<Language, Partial<DocumentData>>>;
}

interface CaseRecord {
	id: string;
	intake: IntakeData;
	isDemo: boolean;
	baseAnalysis: CaseAnalysis | null;
	overrides: CaseOverrides;
	/** The analysis is canonical (bilingual content) — one generation serves
	 * both languages. The letter is language-specific, so drafts are kept per
	 * language and generated on demand when toggling. */
	documentDrafts: Partial<Record<Language, DocumentData>>;
	/** Canonical evidence checklist (bilingual), generated once per case and
	 * stamped into every language's analysis, so the checklist is identical
	 * across language toggles (status overrides are id-keyed and carry over). */
	evidenceCache: EvidenceItem[] | null;
	/** The case-aware assistant's conversation, persisted so it survives
	 * navigation between case pages (one thread per case). Capped on append. */
	assistantThread: AssistantMessage[];
	status: AnalysisStatus;
	stage: Progress["stage"] | null;
	pct: number;
	createdAt: string;
}

function emptyOverrides(): CaseOverrides {
	return { evidence: {}, customEvidence: [], document: {} };
}

function applyOverrides(
	analysis: CaseAnalysis,
	overrides: CaseOverrides,
): CaseAnalysis {
	if (
		Object.keys(overrides.evidence).length === 0 &&
		overrides.customEvidence.length === 0
	) {
		return analysis;
	}
	return {
		...analysis,
		evidence: [
			...analysis.evidence.map((item) => {
				const ov = overrides.evidence[item.id];
				return ov
					? { ...item, status: ov.status, note: ov.note ?? item.note }
					: item;
			}),
			...overrides.customEvidence,
		],
		// Note: document edits are NOT merged here. The document page derives
		// its document from analysis.document + overrides.document[lang], so
		// analysis.document stays the base draft.
	};
}

type PersistedRecord = Pick<
	CaseRecord,
	| "id"
	| "intake"
	| "isDemo"
	| "baseAnalysis"
	| "overrides"
	| "documentDrafts"
	| "evidenceCache"
	| "assistantThread"
	| "createdAt"
>;

function migrateDocumentOverrides(
	doc: unknown,
	lang: Language | undefined,
): Partial<Record<Language, Partial<DocumentData>>> {
	if (!doc || typeof doc !== "object") return {};
	const o = doc as Record<string, unknown>;
	// Already per-language (keys are only "en"/"hi").
	if (Object.keys(o).every((k) => k === "en" || k === "hi")) {
		return o as Partial<Record<Language, Partial<DocumentData>>>;
	}
	// Legacy flat override — attribute it to the analysis language.
	return { [lang ?? "en"]: o as Partial<DocumentData> };
}

function loadPersisted(): Record<string, CaseRecord> {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as Record<string, PersistedRecord>;
		const out: Record<string, CaseRecord> = {};
		for (const [id, rec] of Object.entries(parsed)) {
			out[id] = {
				...rec,
				status: "ready",
				stage: null,
				pct: 100,
				overrides: {
					...(rec.overrides ?? emptyOverrides()),
					customEvidence: rec.overrides?.customEvidence ?? [],
					document: migrateDocumentOverrides(
						rec.overrides?.document,
						rec.baseAnalysis?.language,
					),
				},
				// Older persisted records carried per-language analyses (and no
				// documentDrafts); keep baseAnalysis as the canonical analysis
				// (its text fields may be single-language strings — localize
				// passes them through) and seed the draft from its document.
				documentDrafts:
					rec.documentDrafts ??
					(rec.baseAnalysis
						? { [rec.baseAnalysis.language]: rec.baseAnalysis.document }
						: {}),
				evidenceCache: rec.evidenceCache ?? null,
				assistantThread: rec.assistantThread ?? [],
			};
		}
		return out;
	} catch {
		return {};
	}
}

function persist(records: Record<string, CaseRecord>) {
	if (typeof window === "undefined") return;
	try {
		const slim: Record<string, PersistedRecord> = {};
		for (const [id, rec] of Object.entries(records)) {
			if (rec.status === "ready" || rec.status === "error") {
				slim[id] = {
					id: rec.id,
					intake: rec.intake,
					isDemo: rec.isDemo,
					baseAnalysis: rec.baseAnalysis,
					overrides: rec.overrides,
					documentDrafts: rec.documentDrafts,
					evidenceCache: rec.evidenceCache,
					assistantThread: rec.assistantThread,
					createdAt: rec.createdAt,
				};
			}
		}
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
	} catch {
		// storage full/unavailable — session only
	}
}

function newId(): string {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `case-${Date.now()}`;
}

interface CaseStoreValue {
	records: Record<string, CaseRecord>;
	/** Hydrate a case (demo or persisted); returns the record or undefined. */
	ensureCase: (id: string, lang: Language) => CaseRecord | undefined;
	/** Create a new case from intake and run the analysis pipeline. */
	createFromIntake: (
		intake: IntakeData,
		lang: Language,
	) => Promise<{ id: string }>;
	reanalyze: (id: string, intake: IntakeData, lang: Language) => Promise<void>;
	/** Ensure the letter draft exists for the active language (the analysis is
	 * canonical; only the letter is language-specific). */
	ensureDocumentDraft: (id: string, lang: Language) => Promise<void>;
	updateEvidence: (
		id: string,
		evidenceId: string,
		patch: { status?: EvidenceStatus; note?: string },
	) => void;
	addCustomEvidence: (id: string, item: EvidenceItem) => void;
	updateCustomEvidence: (
		id: string,
		evidenceId: string,
		patch: Partial<EvidenceItem>,
	) => void;
	removeCustomEvidence: (id: string, evidenceId: string) => void;
	updateDocument: (
		id: string,
		lang: Language,
		patch: Partial<DocumentData>,
	) => void;
	/** Append a turn to the persisted per-case assistant conversation. */
	appendAssistantMessage: (id: string, msg: AssistantMessage) => void;
	/** Reset the per-case assistant conversation. */
	clearAssistantThread: (id: string) => void;
}

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
	const [records, setRecords] =
		useState<Record<string, CaseRecord>>(loadPersisted);
	const recordsRef = useRef(records);
	useEffect(() => {
		// Keep the ref in sync after commit so memoized callbacks can read the
		// latest records without depending on `records` (which would churn them).
		recordsRef.current = records;
		persist(records);
	}, [records]);

	const patchRecord = useCallback((id: string, patch: Partial<CaseRecord>) => {
		setRecords((prev) => {
			const rec = prev[id];
			if (!rec) return prev;
			return { ...prev, [id]: { ...rec, ...patch } };
		});
	}, []);

	const ensureCase = useCallback(
		(id: string, lang: Language): CaseRecord | undefined => {
			const existing = recordsRef.current[id];
			if (existing) return existing;

			const demo = DEMO_CASES[id];
			if (demo) {
				const record: CaseRecord = {
					id,
					intake: demo.intake,
					isDemo: true,
					baseAnalysis: demo.analysis(lang),
					overrides: emptyOverrides(),
					// Demo content is deterministic: the analysis is canonical
					// (bilingual), and both letter drafts are seeded so toggling
					// is instant with no model call.
					documentDrafts: {
						en: demo.analysis("en").document,
						hi: demo.analysis("hi").document,
					},
					evidenceCache: demo.analysis("en").evidence,
					assistantThread: [],
					status: "ready",
					stage: null,
					pct: 100,
					createdAt: new Date().toISOString(),
				};
				setRecords((prev) => ({ ...prev, [id]: record }));
				return record;
			}
			return undefined;
		},
		[],
	);

	const runAnalysis = useCallback(
		async (
			id: string,
			intake: IntakeData,
			lang: Language,
			_isDemo: boolean,
			fast = false,
		) => {
			patchRecord(id, { status: "analyzing", stage: "reading", pct: 0 });
			const provider = getProvider();
			try {
				// Always through the provider so re-analysis (edits, language switch)
				// reflects the current intake — even for demo cases.
				const analysis = await provider.analyze(
					intake,
					lang,
					(p) => patchRecord(id, { stage: p.stage, pct: p.pct }),
					{ fast },
				);
				const prev = recordsRef.current[id];
				patchRecord(id, {
					baseAnalysis: analysis,
					intake,
					documentDrafts: {
						...(prev?.documentDrafts ?? {}),
						[lang]: analysis.document,
					},
					status: "ready",
					stage: null,
					pct: 100,
				});
				// Pre-warm the OTHER language's letter in the background: the
				// letter is per-language, and generating it on first toggle cost a
				// slow on-demand model call (and silently showed the old language
				// meanwhile). Fired right after analysis while the user reads, so
				// toggling the letter language is instant in practice.
				if (analysis.domain !== "other") {
					const other: Language = lang === "en" ? "hi" : "en";
					void provider
						.generateDocument({
							analysis,
							intake,
							lang: other,
							edits: {},
						})
						.then((draft) => {
							// Skip if the case was re-analyzed while this ran (stale).
							const cur = recordsRef.current[id];
							if (cur?.baseAnalysis?.id !== analysis.id) return;
							patchRecord(id, {
								documentDrafts: {
									...(cur.documentDrafts ?? {}),
									[other]: draft,
								},
							});
						})
						.catch(() => {
							// Cold path: the document page regenerates on demand
							// (ensureDocumentDraft) and shows a preparing state.
						});
				}
			} catch (err) {
				console.error("Analysis failed", err);
				patchRecord(id, { status: "error" });
			}
		},
		[patchRecord],
	);

	const createFromIntake = useCallback(
		async (intake: IntakeData, lang: Language) => {
			const id = newId();
			const record: CaseRecord = {
				id,
				intake,
				isDemo: false,
				baseAnalysis: null,
				overrides: emptyOverrides(),
				documentDrafts: {},
				evidenceCache: null,
				assistantThread: [],
				status: "analyzing",
				stage: "reading",
				pct: 0,
				createdAt: new Date().toISOString(),
			};
			setRecords((prev) => ({ ...prev, [id]: record }));
			void runAnalysis(id, intake, lang, false);
			return { id };
		},
		[runAnalysis],
	);

	const reanalyze = useCallback(
		async (id: string, intake: IntakeData, lang: Language) => {
			// Intake changed → the canonical analysis and letter drafts are stale.
			// The assistant's answers referenced the old facts — start it over.
			patchRecord(id, {
				intake,
				overrides: emptyOverrides(),
				documentDrafts: {},
				evidenceCache: null,
				assistantThread: [],
			});
			const rec = recordsRef.current[id];
			await runAnalysis(id, intake, lang, rec?.isDemo ?? false);
		},
		[patchRecord, runAnalysis],
	);

	const ensureDocumentDraft = useCallback(
		async (id: string, lang: Language) => {
			const rec = recordsRef.current[id];
			if (!rec?.baseAnalysis) return;
			if (rec.documentDrafts?.[lang]) return; // already drafted
			if (rec.status === "analyzing") return; // analysis still running
			if (rec.baseAnalysis.domain === "other") return; // generic fallback has no per-language letter
			const provider = getProvider();
			try {
				const draft = await provider.generateDocument({
					analysis: rec.baseAnalysis,
					intake: rec.intake,
					lang,
					edits: {},
				});
				patchRecord(id, {
					documentDrafts: {
						...(rec.documentDrafts ?? {}),
						[lang]: draft,
					},
				});
			} catch (err) {
				console.error("Document draft generation failed", err);
			}
		},
		[patchRecord],
	);

	const updateEvidence = useCallback(
		(
			id: string,
			evidenceId: string,
			patch: { status?: EvidenceStatus; note?: string },
		) => {
			patchRecord(id, {
				overrides: {
					...(recordsRef.current[id]?.overrides ?? emptyOverrides()),
					evidence: {
						...(recordsRef.current[id]?.overrides.evidence ?? {}),
						[evidenceId]: {
							...(recordsRef.current[id]?.overrides.evidence[evidenceId] ?? {}),
							...patch,
						},
					},
				},
			});
		},
		[patchRecord],
	);

	const addCustomEvidence = useCallback(
		(id: string, item: EvidenceItem) => {
			const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
			patchRecord(id, {
				overrides: {
					...prev,
					customEvidence: [...prev.customEvidence, item],
				},
			});
		},
		[patchRecord],
	);

	const updateCustomEvidence = useCallback(
		(id: string, evidenceId: string, patch: Partial<EvidenceItem>) => {
			const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
			patchRecord(id, {
				overrides: {
					...prev,
					customEvidence: prev.customEvidence.map((item) =>
						item.id === evidenceId ? { ...item, ...patch } : item,
					),
				},
			});
		},
		[patchRecord],
	);

	const removeCustomEvidence = useCallback(
		(id: string, evidenceId: string) => {
			const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
			patchRecord(id, {
				overrides: {
					...prev,
					customEvidence: prev.customEvidence.filter(
						(item) => item.id !== evidenceId,
					),
				},
			});
		},
		[patchRecord],
	);

	const updateDocument = useCallback(
		(id: string, lang: Language, patch: Partial<DocumentData>) => {
			const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
			patchRecord(id, {
				overrides: {
					...prev,
					document: {
						...(prev.document ?? {}),
						[lang]: { ...(prev.document?.[lang] ?? {}), ...patch },
					},
				},
			});
		},
		[patchRecord],
	);

	const appendAssistantMessage = useCallback(
		(id: string, msg: AssistantMessage) => {
			const prev = recordsRef.current[id]?.assistantThread ?? [];
			patchRecord(id, {
				assistantThread: [...prev, msg].slice(-THREAD_LIMIT),
			});
		},
		[patchRecord],
	);

	const clearAssistantThread = useCallback(
		(id: string) => patchRecord(id, { assistantThread: [] }),
		[patchRecord],
	);

	const value = useMemo(
		() => ({
			records,
			ensureCase,
			createFromIntake,
			reanalyze,
			ensureDocumentDraft,
			updateEvidence,
			addCustomEvidence,
			updateCustomEvidence,
			removeCustomEvidence,
			updateDocument,
			appendAssistantMessage,
			clearAssistantThread,
		}),
		[
			records,
			ensureCase,
			createFromIntake,
			reanalyze,
			ensureDocumentDraft,
			updateEvidence,
			addCustomEvidence,
			updateCustomEvidence,
			removeCustomEvidence,
			updateDocument,
			appendAssistantMessage,
			clearAssistantThread,
		],
	);

	return (
		<CaseStoreContext.Provider value={value}>
			{children}
		</CaseStoreContext.Provider>
	);
}

export function useCaseStore(): CaseStoreValue {
	const ctx = useContext(CaseStoreContext);
	if (!ctx) throw new Error("useCaseStore must be used within CaseProvider");
	return ctx;
}

/** Convenience: hydrate + language-sync a case from a route segment. */
export function useCase(id: string, lang: Language) {
	const store = useCaseStore();
	const record = store.records[id];

	// Derive from the live records state (not a ref) so the analysis re-renders
	// when the record lands. The canonical analysis is bilingual; the document
	// is stamped with the active language's draft (falling back to the base).
	const analysis = useMemo(() => {
		const rec = store.records[id];
		if (!rec?.baseAnalysis) return null;
		const withDoc = {
			...rec.baseAnalysis,
			document: rec.documentDrafts?.[lang] ?? rec.baseAnalysis.document,
		};
		return applyOverrides(withDoc, rec.overrides);
	}, [store.records, id, lang]);

	useEffect(() => {
		const rec = store.ensureCase(id, lang);
		if (rec?.baseAnalysis) {
			void store.ensureDocumentDraft(id, lang);
		}
	}, [id, lang, store]);

	return {
		record,
		analysis,
		...store,
	};
}
