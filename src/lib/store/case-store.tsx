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
import { getProvider } from "@/lib/providers";
import { DEMO_CASES } from "@/lib/mock/demo-cases";

const STORAGE_KEY = "laid.cases.v1";

interface CaseOverrides {
	evidence: Record<string, { status: EvidenceStatus; note?: string }>;
	customEvidence: EvidenceItem[];
	document: Partial<DocumentData> | null;
}

interface CaseRecord {
	id: string;
	intake: IntakeData;
	isDemo: boolean;
	baseAnalysis: CaseAnalysis | null;
	overrides: CaseOverrides;
	/** Completed analyses per language, so language toggles reuse a previously
	 * analyzed language instead of re-running the model. The analysis carries
	 * the document draft (document section), so no separate document cache. */
	analysisCache: Partial<Record<Language, CaseAnalysis>>;
	/** Canonical evidence checklist (bilingual), generated once per case and
	 * stamped into every language's analysis, so the checklist is identical
	 * across language toggles (status overrides are id-keyed and carry over). */
	evidenceCache: EvidenceItem[] | null;
	status: AnalysisStatus;
	stage: Progress["stage"] | null;
	pct: number;
	createdAt: string;
}

function emptyOverrides(): CaseOverrides {
	return { evidence: {}, customEvidence: [], document: null };
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
		// its document from analysis.document + overrides.document, so
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
	| "analysisCache"
	| "evidenceCache"
	| "createdAt"
>;

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
				},
				analysisCache: rec.analysisCache ?? {},
				evidenceCache: rec.evidenceCache ?? null,
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
					analysisCache: rec.analysisCache,
					evidenceCache: rec.evidenceCache,
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
	ensureLanguage: (id: string, lang: Language) => Promise<void>;
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
	updateDocument: (id: string, patch: Partial<DocumentData>) => void;
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
					// Demo content is deterministic per language — seed both so
					// toggling is instant with no model call.
					analysisCache: {
						en: demo.analysis("en"),
						hi: demo.analysis("hi"),
					},
					// Demo content is deterministic — the evidence checklist is
					// identical in both languages, seeded as the canonical set.
					evidenceCache: demo.analysis("en").evidence,
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
				// The evidence checklist is canonical per case: the first analysis
				// establishes it (bilingual), and every later language analysis
				// reuses it so the checklist is identical across languages.
				const prev = recordsRef.current[id];
				const evidence = prev?.evidenceCache ?? analysis.evidence;
				const stamped =
					evidence === analysis.evidence
						? analysis
						: { ...analysis, evidence };
				const prevCache = prev?.analysisCache ?? {};
				patchRecord(id, {
					baseAnalysis: stamped,
					intake,
					analysisCache: { ...prevCache, [lang]: stamped },
					evidenceCache: evidence,
					status: "ready",
					stage: null,
					pct: 100,
				});
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
				analysisCache: {},
				evidenceCache: null,
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
			// Intake changed → cached per-language analyses/documents are stale.
			patchRecord(id, {
				intake,
				overrides: emptyOverrides(),
				analysisCache: {},
				evidenceCache: null,
			});
			const rec = recordsRef.current[id];
			await runAnalysis(id, intake, lang, rec?.isDemo ?? false);
		},
		[patchRecord, runAnalysis],
	);

	const ensureLanguage = useCallback(
		async (id: string, lang: Language) => {
			const rec = recordsRef.current[id];
			if (!rec || !rec.baseAnalysis) return;
			if (rec.baseAnalysis.language === lang) return;
			if (rec.status === "analyzing") return; // already regenerating
			// Reuse a previously analyzed language instead of re-running the model.
			const cached = rec.analysisCache?.[lang];
			if (cached) {
				patchRecord(id, {
					baseAnalysis: cached,
					status: "ready",
					stage: null,
					pct: 100,
				});
				return;
			}
			await runAnalysis(id, rec.intake, lang, rec.isDemo, true); // fast: language-only
		},
		[runAnalysis, patchRecord],
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
		(id: string, patch: Partial<DocumentData>) => {
			const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
			patchRecord(id, {
				overrides: {
					...prev,
					document: { ...(prev.document ?? {}), ...patch },
				},
			});
		},
		[patchRecord],
	);

	const value = useMemo(
		() => ({
			records,
			ensureCase,
			createFromIntake,
			reanalyze,
			ensureLanguage,
			updateEvidence,
			addCustomEvidence,
			updateCustomEvidence,
			removeCustomEvidence,
			updateDocument,
		}),
		[
			records,
			ensureCase,
			createFromIntake,
			reanalyze,
			ensureLanguage,
			updateEvidence,
			addCustomEvidence,
			updateCustomEvidence,
			removeCustomEvidence,
			updateDocument,
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
	// when the record lands; applyOverrides leaves document edits out.
	const analysis = useMemo(() => {
		const rec = store.records[id];
		if (!rec?.baseAnalysis) return null;
		return applyOverrides(rec.baseAnalysis, rec.overrides);
	}, [store.records, id]);

	useEffect(() => {
		const rec = store.ensureCase(id, lang);
		if (rec?.baseAnalysis && rec.baseAnalysis.language !== lang) {
			void store.ensureLanguage(id, lang);
		}
	}, [id, lang, store]);

	return {
		record,
		analysis,
		...store,
	};
}
