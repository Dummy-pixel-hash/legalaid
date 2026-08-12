"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Briefcase, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { Domain } from "@/lib/types/domain";

const DOMAINS: {
  id: Domain;
  icon: typeof ShoppingCart;
  titleKey: "domainConsumer" | "domainLabour" | "domainTenant";
  plainKey: "domainConsumerPlain" | "domainLabourPlain" | "domainTenantPlain";
  demoId: string;
  exampleKeys: (
    | "domainConsumerExample1"
    | "domainConsumerExample2"
    | "domainLabourExample1"
    | "domainLabourExample2"
    | "domainTenantExample1"
    | "domainTenantExample2"
  )[];
}[] = [
  {
    id: "consumer",
    icon: ShoppingCart,
    titleKey: "domainConsumer",
    plainKey: "domainConsumerPlain",
    demoId: "demo-consumer",
    exampleKeys: ["domainConsumerExample1", "domainConsumerExample2"],
  },
  {
    id: "labour",
    icon: Briefcase,
    titleKey: "domainLabour",
    plainKey: "domainLabourPlain",
    demoId: "demo-labour",
    exampleKeys: ["domainLabourExample1", "domainLabourExample2"],
  },
  {
    id: "tenant",
    icon: Home,
    titleKey: "domainTenant",
    plainKey: "domainTenantPlain",
    demoId: "demo-tenant",
    exampleKeys: ["domainTenantExample1", "domainTenantExample2"],
  },
];

export function DomainCards() {
  const { t } = useI18n();

  return (
        <section className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
              {t("homeDomainsHeading")}
            </p>
            <p className="mt-2 text-ink-70">{t("homeDomainsHint")}</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {DOMAINS.map((d) => {
              const Icon = d.icon;
              const keyColor =
                d.id === "consumer"
                  ? "bg-seal"
                  : d.id === "labour"
                    ? "bg-accent-strong"
                    : "bg-status-success";
              return (
                <div
                  key={d.id}
                  className="relative flex flex-col rounded-lg border border-line bg-surface p-7"
                >
                  {/* seal keyline on the left edge */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-[-1px] w-2 rounded-l-lg ${keyColor}`}
                  />
                  <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-ink-70">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {t(d.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-70">
                    {t(d.plainKey)}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {d.exampleKeys.map((k) => (
                      <li
                        key={k}
                        className="flex items-start gap-2 text-xs text-ink-50"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-30"
                        />
                        {t(k)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-1.5 pt-5">
                    <Link
                      href={`/intake?domain=${d.id}`}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
                    >
                      {t("startHere")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                    <Link
                      href={`/case/${d.demoId}/analysis`}
                      className="text-xs text-ink-50 hover:underline"
                    >
                      {t("viewWorkedExample")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
  );
}
