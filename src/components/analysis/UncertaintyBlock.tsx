"use client";

import { HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";

export function UncertaintyBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t } = useI18n();
  if (analysis.uncertainty.length === 0) return null;
  return (
    <section className="rounded-lg border border-dashed border-ink-30 bg-surface p-5">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-ink-50" aria-hidden />
        <SectionMarker number="05" label={t("uncertaintyHeading")} />
      </div>
      <p className="mt-1 text-sm text-ink-50">{t("uncertaintyHint")}</p>
      <ul className="mt-4 space-y-4">
        {analysis.uncertainty.map((u) => (
          <li key={u.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
            <p className="text-sm font-medium text-ink">{u.plain}</p>
            <dl className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-70">
              <div>
                <dt className="inline font-semibold text-ink">
                  {t("changesAnswerLabel")}:
                </dt>{" "}
                <dd className="inline">{u.changesAnswer}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink">
                  {t("resolveLabel")}:
                </dt>{" "}
                <dd className="inline">{u.resolve}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
