"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import { UnderstandingBlock } from "@/components/analysis/UnderstandingBlock";
import { IssuesBlock } from "@/components/analysis/IssuesBlock";
import { RightsBlock } from "@/components/analysis/RightsBlock";
import { LawsBlock } from "@/components/analysis/LawsBlock";
import { UncertaintyBlock } from "@/components/analysis/UncertaintyBlock";
import { DisclaimerBanner } from "@/components/analysis/DisclaimerBanner";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <AnalysisClient caseId={caseId} />;
}

function AnalysisClient({ caseId }: { caseId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { record, analysis, ensureLanguage, reanalyze } = useCase(caseId, lang);

  // Wait for the store to hydrate the case before rendering.
  const ready = record !== undefined;

  useEffect(() => {
    if (!ready) return;
    if (record.status === "analyzing") return;
    if (record.baseAnalysis && record.baseAnalysis.language !== lang) {
      void ensureLanguage(caseId, lang);
    }
  }, [ready, record, lang, caseId, ensureLanguage]);

  if (!ready) return null;

  if (record.status === "analyzing") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <LoadingAnalysis stage={record.stage} progress={record.pct} />
      </div>
    );
  }

  if (record.status === "error") {
    return (
      <div className="px-4 py-10">
        <ErrorState
          onRetry={() => void reanalyze(caseId, record.intake, lang)}
        />
      </div>
    );
  }

  if (!analysis) return <EmptyState />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
        02 · {t("stepAnalysis")}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t("analysisTitle")}
      </h1>
      <p className="mt-2 text-ink-70">{t("analysisSubtitle")}</p>

      <div className="mt-8 space-y-8">
        <UnderstandingBlock analysis={analysis} caseId={caseId} />
        <IssuesBlock analysis={analysis} />
        <RightsBlock analysis={analysis} />
        <LawsBlock analysis={analysis} />
        <UncertaintyBlock analysis={analysis} />
        <DisclaimerBanner text={analysis.disclaimer} />
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <Button size="lg" onClick={() => router.push(`/case/${caseId}/evidence`)}>
          {t("nextEvidence")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
