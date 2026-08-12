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
  EvidenceStatus,
  IntakeData,
  Language,
  Progress,
} from "@/lib/types/domain";
import { getProvider } from "@/lib/providers";
import { DEMO_CASES, isDemoId } from "@/lib/mock/demo-cases";

const STORAGE_KEY = "laid.cases.v1";

interface CaseOverrides {
  evidence: Record<string, { status: EvidenceStatus; note?: string }>;
  document: Partial<DocumentData> | null;
}

interface CaseRecord {
  id: string;
  intake: IntakeData;
  isDemo: boolean;
  baseAnalysis: CaseAnalysis | null;
  overrides: CaseOverrides;
  status: AnalysisStatus;
  stage: Progress["stage"] | null;
  pct: number;
  createdAt: string;
}

function emptyOverrides(): CaseOverrides {
  return { evidence: {}, document: null };
}

function applyOverrides(
  analysis: CaseAnalysis,
  overrides: CaseOverrides,
): CaseAnalysis {
  if (Object.keys(overrides.evidence).length === 0 && !overrides.document) {
    return analysis;
  }
  return {
    ...analysis,
    evidence: analysis.evidence.map((item) => {
      const ov = overrides.evidence[item.id];
      return ov
        ? { ...item, status: ov.status, note: ov.note ?? item.note }
        : item;
    }),
    document: overrides.document
      ? { ...analysis.document, ...overrides.document }
      : analysis.document,
  };
}

type PersistedRecord = Pick<
  CaseRecord,
  "id" | "intake" | "isDemo" | "baseAnalysis" | "overrides" | "createdAt"
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
        overrides: rec.overrides ?? emptyOverrides(),
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
  updateDocument: (id: string, patch: Partial<DocumentData>) => void;
  /** Effective analysis = base + user overrides. */
  effectiveAnalysis: (id: string) => CaseAnalysis | null;
}

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Record<string, CaseRecord>>(
    loadPersisted,
  );
  const recordsRef = useRef(records);
  recordsRef.current = records;

  useEffect(() => {
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
        const analysis = await provider.analyze(intake, lang, (p) =>
          patchRecord(id, { stage: p.stage, pct: p.pct }),
        { fast },
        );
        patchRecord(id, {
          baseAnalysis: analysis,
          intake,
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
      patchRecord(id, { intake, overrides: emptyOverrides() });
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
      await runAnalysis(id, rec.intake, lang, rec.isDemo, true); // fast: language-only
    },
    [runAnalysis],
  );

  const updateEvidence = useCallback(
    (id: string, evidenceId: string, patch: { status?: EvidenceStatus; note?: string }) => {
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

  const updateDocument = useCallback(
    (id: string, patch: Partial<DocumentData>) => {
      const prev = recordsRef.current[id]?.overrides ?? emptyOverrides();
      patchRecord(id, {
        overrides: { ...prev, document: { ...(prev.document ?? {}), ...patch } },
      });
    },
    [patchRecord],
  );

  const effectiveAnalysis = useCallback(
    (id: string): CaseAnalysis | null => {
      const rec = recordsRef.current[id];
      if (!rec?.baseAnalysis) return null;
      return applyOverrides(rec.baseAnalysis, rec.overrides);
    },
    [],
  );

  const value = useMemo(
    () => ({
      records,
      ensureCase,
      createFromIntake,
      reanalyze,
      ensureLanguage,
      updateEvidence,
      updateDocument,
      effectiveAnalysis,
    }),
    [
      records,
      ensureCase,
      createFromIntake,
      reanalyze,
      ensureLanguage,
      updateEvidence,
      updateDocument,
      effectiveAnalysis,
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

  useEffect(() => {
    const rec = store.ensureCase(id, lang);
    if (rec?.baseAnalysis && rec.baseAnalysis.language !== lang) {
      void store.ensureLanguage(id, lang);
    }
  }, [id, lang, store]);

  return {
    record,
    analysis: store.effectiveAnalysis(id),
    ...store,
  };
}
