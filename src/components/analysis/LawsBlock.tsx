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
      <SectionMarker
        label={t("lawsHeading")}
        className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong"
      />
      <p className="mt-1 text-sm text-ink-50">{t("lawsHint")}</p>
      <ul className="mt-5 space-y-7">
        {analysis.laws.map((law) => (
          <LawCard key={law.id} law={law} />
        ))}
      </ul>
    </section>
  );
}
