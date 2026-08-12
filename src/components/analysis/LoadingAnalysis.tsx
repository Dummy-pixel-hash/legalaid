"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/provider";
import type { AnalysisStage } from "@/lib/types/domain";

const STAGE_COPY: Record<AnalysisStage, "analyzingStepReading" | "analyzingStepIssues" | "analyzingStepRights" | "analyzingStepLaws" | "analyzingStepEvidence" | "analyzingStepSteps" | "analyzingStepDocument"> = {
  reading: "analyzingStepReading",
  issues: "analyzingStepIssues",
  rights: "analyzingStepRights",
  laws: "analyzingStepLaws",
  evidence: "analyzingStepEvidence",
  steps: "analyzingStepSteps",
  document: "analyzingStepDocument",
};

const BLOCKS: AnalysisStage[] = [
  "reading",
  "issues",
  "rights",
  "laws",
  "evidence",
  "steps",
];

export function LoadingAnalysis({
  stage,
  progress,
}: {
  stage: AnalysisStage | null;
  progress: number;
}) {
  const { t } = useI18n();
  const activeIndex = stage ? BLOCKS.indexOf(stage) : 0;

  return (
    <div aria-live="polite" aria-busy="true">
      <p className="flex items-center gap-2 text-sm font-medium text-ink-70">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-strong opacity-40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-strong" />
        </span>
        {t(STAGE_COPY[stage ?? "reading"])}
        <span className="text-xs text-ink-50">({progress}%)</span>
      </p>

      <div className="mt-6 space-y-5">
        {BLOCKS.map((block, i) => {
          const isResolved = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <div
              key={block}
              className={`rounded-lg border border-line bg-surface p-5 transition-opacity duration-300 ${
                isResolved
                  ? "opacity-40"
                  : isActive
                    ? "opacity-100"
                    : "opacity-25"
              }`}
            >
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              {block === "laws" && (
                <>
                  <Skeleton className="mt-4 h-3 w-40" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-3/5" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
