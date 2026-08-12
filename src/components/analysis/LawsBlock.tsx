"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";
import { LawCard } from "./LawCard";

export function LawsBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t } = useI18n();
  if (analysis.laws.length === 0) return null;
  return (
    <section>
      <SectionMarker number="04" label={t("lawsHeading")} />
      <p className="mt-1 text-sm text-ink-50">{t("lawsHint")}</p>
      <ul className="mt-4 space-y-3">
        {analysis.laws.map((law) => (
          <LawCard key={law.id} law={law} />
        ))}
      </ul>
    </section>
  );
}
