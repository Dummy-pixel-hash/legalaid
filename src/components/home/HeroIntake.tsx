"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { EXAMPLE_SCENARIOS } from "@/lib/mock/demo-cases";

export function HeroIntake() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    router.push(`/intake?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-accent-strong">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("headerSub")}
          </p>
          <h1 className="mt-3 text-[34px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-5xl">
            {t("homeHeroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-70 sm:text-lg">
            {t("homeHeroSubtitle")}
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5">
          <form
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
              className="mt-2 min-h-[120px] text-base leading-relaxed"
              autoFocus={false}
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ul className="flex flex-wrap gap-2" aria-label={t("homeExamplesHeading")}>
                {EXAMPLE_SCENARIOS.map((s) => {
                  const label = lang === "hi" ? s.hi : s.en;
                  return (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => setText(lang === "hi" ? s.hi : s.en)}
                        className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-70 transition-colors hover:border-ink-30 hover:bg-surface-muted hover:text-ink"
                      >
                        {label.length > 60 ? `${label.slice(0, 60)}…` : label}
                      </button>
                    </li>
                  );
                })}
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
