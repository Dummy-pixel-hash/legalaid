"use client";

import { use } from "react";
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
import { DevelopmentProviderNotice } from "@/components/analysis/DevelopmentProviderNotice";

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  return <AnalysisClient caseId={caseId} />;
}

function AnalysisClient({ caseId }: { caseId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { record, analysis, reanalyze } = useCase(caseId, lang);

  // Wait for the store to hydrate the case before rendering. The analysis is
  // canonical (bilingual); useCase already ensures the letter draft for the
  // active language, so no re-analysis on toggle.
  const ready = record !== undefined;

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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {t("analysisTitle")}
        </h1>
        <p className="mt-3 max-w-[56ch] text-[15.5px] leading-relaxed text-ink-70">
          {t("analysisSubtitle")}
        </p>
      </header>

      <div className="mt-6">
        <DevelopmentProviderNotice />
      </div>

      <div className="mt-2 divide-y divide-line">
        <div className="py-8"><UnderstandingBlock analysis={analysis} caseId={caseId} /></div>
        <div className="py-8"><IssuesBlock analysis={analysis} /></div>
        <div className="py-8"><RightsBlock analysis={analysis} /></div>
        <div className="py-8"><LawsBlock analysis={analysis} /></div>
        <div className="py-8"><UncertaintyBlock analysis={analysis} /></div>
        <div className="py-8"><DisclaimerBanner text={analysis.disclaimer} /></div>
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
