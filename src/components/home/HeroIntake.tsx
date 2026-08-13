"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { EXAMPLE_SCENARIOS } from "@/lib/mock/demo-cases";
import type { TranslationKey } from "@/lib/i18n/types";

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
        <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-between gap-5 px-4 pb-[6vh] pt-[5vh] text-center sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-strong">
              {t("headerSub")}
            </p>
            <h1 className="mt-[18px] text-[clamp(38px,6.5vw,60px)] font-semibold uppercase leading-[1.05] tracking-[0.01em] text-ink">
              {t("homeHeroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-[34rem] text-[17px] leading-[1.6] text-ink-70">
              {t("homeHeroSubtitle")}
            </p>
          </div>

          {/* The first sheet of the file */}
          <div className="mt-auto w-full max-w-[720px] rounded-[10px] border border-line bg-surface text-left shadow-[0_1px_2px_rgba(27,36,54,0.08),0_8px_24px_rgba(27,36,54,0.10)]">
            <div className="flex items-baseline justify-between gap-3 border-b-4 border-ink px-6 pt-[18px] pb-3 sm:px-7">
              <p className={`${serif} text-[17px] font-semibold uppercase tracking-[0.08em] text-ink`}>
                {t("situationSheet")}
              </p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-50">
                {t("stepOf", { current: 1, total: 5 })}
              </p>
            </div>
            <form
              className="px-6 pb-[26px] pt-[22px] sm:px-7"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label htmlFor="hero-situation" className="text-sm font-medium text-ink">
                {t("describeLabel")}
              </label>
              <Textarea
                id="hero-situation"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("homeIntakePlaceholder")}
                className="mt-2 min-h-[170px] w-full text-[17px] leading-[1.6]"
              />
              <div className="mt-[18px] flex flex-wrap items-center justify-between gap-4">
                <ul className="flex flex-wrap gap-2.5" aria-label={t("homeExamplesHeading")}>
                  {EXAMPLE_SCENARIOS.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => setText(lang === "hi" ? s.hi : s.en)}
                        className="inline-flex min-h-10 items-center rounded-md border border-line bg-surface px-3.5 py-1.5 text-left text-[13px] leading-tight font-medium text-ink-70 transition-colors hover:border-ink-30 hover:bg-surface-muted hover:text-ink"
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
                  className="h-14 shrink-0 px-9 text-[15px]"
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
