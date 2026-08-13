"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import { EvidenceRow } from "@/components/evidence/EvidenceRow";

export default function EvidencePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  return <EvidenceClient caseId={caseId} />;
}

function EvidenceClient({ caseId }: { caseId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const {
    record,
    analysis,
    updateEvidence,
    addCustomEvidence,
    updateCustomEvidence,
    removeCustomEvidence,
  } = useCase(caseId, lang);
  const [newLabel, setNewLabel] = useState("");
  const [newWhy, setNewWhy] = useState("");

  if (!record) return null;
  if (record.status === "analyzing") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <LoadingAnalysis stage={record.stage} progress={record.pct} />
      </div>
    );
  }
  if (record.status === "error") return <ErrorState onRetry={() => router.refresh()} />;
  if (!analysis) return <EmptyState />;

  const custom = record.overrides.customEvidence;
  const customIds = new Set(custom.map((c) => c.id));
  const items = analysis.evidence;
  const have = items.filter((i) => i.status === "have").length;
  const find = items.filter((i) => i.status === "need-to-find").length;
  const progressPct = items.length ? Math.round((have / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
        03 · {t("stepEvidence")}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t("evidenceTitle")}
      </h1>
      <p className="mt-2 text-ink-70">{t("evidenceSubtitle")}</p>

      <div className="mt-6 rounded-lg border border-line bg-surface p-4">
        <p className="text-sm font-medium text-ink">
          {t("evidenceProgress", {
            have: String(have),
            total: String(items.length),
            find: String(find),
          })}
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-status-success transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {items.length > 0 &&
          items.every((i) => i.status !== "unset") && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-status-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {t("evidenceAllReviewed")}
            </p>
          )}
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((item) =>
          customIds.has(item.id) ? (
            <li key={item.id} className="space-y-2">
              <EvidenceRow
                item={item}
                onStatus={(status) =>
                  updateCustomEvidence(caseId, item.id, { status })
                }
                onNote={(note) =>
                  updateCustomEvidence(caseId, item.id, { note })
                }
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeCustomEvidence(caseId, item.id)}
                  className="text-xs font-medium text-ink-50 underline underline-offset-2 hover:text-accent-strong"
                >
                  {t("evidenceRemove")}
                </button>
              </div>
            </li>
          ) : (
            <EvidenceRow
              key={item.id}
              item={item}
              onStatus={(status) => updateEvidence(caseId, item.id, { status })}
              onNote={(note) => updateEvidence(caseId, item.id, { note })}
            />
          ),
        )}
      </ul>

      <form
        className="mt-6 rounded-lg border border-dashed border-line bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const label = newLabel.trim();
          const why = newWhy.trim();
          if (!label) return;
          addCustomEvidence(caseId, {
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `ev-${Date.now()}`,
            label: { [lang]: label },
            why: { [lang]: why },
            status: "need-to-find",
            note: "",
          });
          setNewLabel("");
          setNewWhy("");
        }}
      >
        <p className="text-sm font-medium text-ink">{t("evidenceAddTitle")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink-50">
              {t("evidenceAddLabel")}
            </span>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={t("evidenceAddLabel")}
              className="mt-1 w-full rounded-md border border-line bg-background px-3 py-2 text-xs text-ink placeholder:text-ink-30 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-50">
              {t("evidenceAddWhy")}
            </span>
            <input
              type="text"
              value={newWhy}
              onChange={(e) => setNewWhy(e.target.value)}
              placeholder={t("evidenceAddWhy")}
              className="mt-1 w-full rounded-md border border-line bg-background px-3 py-2 text-xs text-ink placeholder:text-ink-30 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20"
            />
          </label>
        </div>
        <div className="mt-3">
          <Button type="submit" size="sm">
            {t("evidenceAddButton")}
          </Button>
        </div>
      </form>

      <div className="mt-10 border-t border-line pt-6">
        <Button size="lg" onClick={() => router.push(`/case/${caseId}/next-steps`)}>
          {t("evidenceNext")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
