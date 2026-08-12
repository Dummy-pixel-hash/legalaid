"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { EXAMPLE_SCENARIOS } from "@/lib/mock/demo-cases";

/**
 * The cover page of the file: serif document title, and the intake
 * styled as the first sheet — letterhead rule, filing row, body.
 */
export function HeroIntake() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");

  const serif = lang === "hi" ? "font-doc-hi" : "font-doc";

  const submit = () => {
    if (!text.trim()) return;
    router.push(`/intake?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-strong">
            {t("headerSub")}
          </p>
          <h1
            className={`mt-4 text-[36px] leading-[1.12] font-semibold tracking-tight text-ink sm:text-[52px] ${serif}`}
          >
            {t("homeHeroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-70 sm:text-lg">
            {t("homeHeroSubtitle")}
          </p>
        </div>

        {/* The first sheet of the file */}
        <div className="mt-9 rounded-lg border border-line bg-surface shadow-sm">
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink px-4 pt-3.5 pb-2.5 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
              {t("situationSheet")}
            </p>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-50">
              {t("stepOf", { current: 1, total: 5 })}
            </p>
          </div>

          <form
            className="p-4 sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label
              htmlFor="hero-situation"
              className="text-sm font-medium text-ink"
            >
              {t("describeLabel")}
            </label>
            <Textarea
              id="hero-situation"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("homeIntakePlaceholder")}
              className="mt-2 min-h-[132px] text-base leading-relaxed"
            />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ul
                className="flex flex-wrap gap-2"
                aria-label={t("homeExamplesHeading")}
              >
                {EXAMPLE_SCENARIOS.map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => setText(lang === "hi" ? s.hi : s.en)}
                      className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-70 transition-colors hover:border-ink-30 hover:bg-surface-muted hover:text-ink"
                    >
                      {lang === "hi" ? s.labelHi : s.labelEn}
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                type="submit"
                size="lg"
                disabled={!text.trim()}
                className="shrink-0"
              >
                {t("understandMySituation")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
