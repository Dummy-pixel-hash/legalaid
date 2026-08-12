"use client";

import { FileText, Lightbulb, ListChecks, MessageSquareText, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const STEPS = [
  {
    icon: MessageSquareText,
    titleKey: "homeStep1Title",
    plainKey: "homeStep1Plain",
  },
  { icon: Scale, titleKey: "homeStep2Title", plainKey: "homeStep2Plain" },
  { icon: ListChecks, titleKey: "homeStep3Title", plainKey: "homeStep3Plain" },
  { icon: Lightbulb, titleKey: "homeStep4Title", plainKey: "homeStep4Plain" },
  { icon: FileText, titleKey: "homeStep5Title", plainKey: "homeStep5Plain" },
] as const;

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
            03 · {t("homeHowHeading")}
          </p>
          <p className="mt-2 text-ink-70">{t("homeHowHint")}</p>
        </div>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.titleKey} className="flex gap-3 lg:flex-col lg:gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-background text-ink-70">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-30">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-ink">
                    {t(s.titleKey)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-70">
                    {t(s.plainKey)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
