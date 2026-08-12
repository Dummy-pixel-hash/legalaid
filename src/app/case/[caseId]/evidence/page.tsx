"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import { EvidenceRow } from "@/components/evidence/EvidenceRow";

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <EvidenceClient caseId={caseId} />;
}

function EvidenceClient({ caseId }: { caseId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { record, analysis, updateEvidence } = useCase(caseId, lang);

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
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <EvidenceRow
            key={item.id}
            item={item}
            onStatus={(status) => updateEvidence(caseId, item.id, { status })}
            onNote={(note) => updateEvidence(caseId, item.id, { note })}
          />
        ))}
      </ul>

      <div className="mt-10 border-t border-line pt-6">
        <Button size="lg" onClick={() => router.push(`/case/${caseId}/next-steps`)}>
          {t("evidenceNext")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
