"use client";

import Link from "next/link";
import { PencilLine } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";

export function UnderstandingBlock({
  analysis,
  caseId,
}: {
  analysis: CaseAnalysis;
  caseId: string;
}) {
  const { t } = useI18n();
  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <SectionMarker
          label={t("understandingHeading")}
          className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong"
        />
        <Link
          href={`/intake?edit=${caseId}`}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-accent-strong hover:bg-accent"
        >
          <PencilLine className="h-3.5 w-3.5" aria-hidden />
          {t("editMySituation")}
        </Link>
      </div>
      <p className="mt-4 text-base leading-relaxed text-ink">
        {analysis.caseSummary}
      </p>
      {analysis.facts.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {analysis.facts.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-sm text-ink-70"
            >
              <span
                aria-hidden
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-strong"
              />
              {f}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
