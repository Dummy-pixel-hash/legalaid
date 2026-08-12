"use client";

import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const STEPS = [
  { titleKey: "homeStep1Title", plainKey: "homeStep1Plain" },
  { titleKey: "homeStep2Title", plainKey: "homeStep2Plain" },
  { titleKey: "homeStep3Title", plainKey: "homeStep3Plain" },
  { titleKey: "homeStep4Title", plainKey: "homeStep4Plain" },
  { titleKey: "homeStep5Title", plainKey: "homeStep5Plain" },
] as const;

/**
 * The journey rendered as a ruled contents ledger — the table of contents
 * of the file the visitor is about to create. Serif page numbers, hairlines,
 * one direction arrow. No icons: the sequence is the content.
 */
export function HowItWorks() {
  const { t, lang } = useI18n();
  const serif = lang === "hi" ? "font-doc-hi" : "font-doc";

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
            {t("homeHowHeading")}
          </p>
          <p className="mt-2 text-ink-70">{t("homeHowHint")}</p>
        </div>

        <ol className="mt-9 divide-y divide-line border-y border-line">
          {STEPS.map((s, i) => (
            <li key={s.titleKey} className="group flex items-center gap-4 py-4 sm:gap-7">
              <span
                aria-hidden
                className={`w-9 shrink-0 text-right text-2xl leading-none font-semibold tabular-nums text-ink-30 sm:w-12 sm:text-3xl ${serif}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-ink">{t(s.titleKey)}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-70 sm:text-sm">
                  {t(s.plainKey)}
                </p>
              </div>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-ink-30 transition-all group-hover:translate-x-0.5 group-hover:text-accent-strong"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
