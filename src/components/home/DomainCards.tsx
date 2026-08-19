"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Briefcase, Home } from "lucide-react";
import { useI18n, type LanguageContextValue } from "@/lib/i18n/provider";
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

function DomainCard({
	domain,
	index,
	t,
	serif,
}: {
	domain: (typeof DOMAINS)[number];
	index: number;
	t: LanguageContextValue["t"];
	serif: string;
}) {
	const Icon = domain.icon;
	return (
		<div className="flex flex-col border-t border-line pt-5">
			<div className="flex items-center gap-3">
				<span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-ink-70">
					<Icon className="h-5 w-5" aria-hidden />
				</span>
				<span
					aria-hidden
					className={`${serif} text-[13px] text-ink-50`}
				>
					{String(index + 1).padStart(2, "0")}
				</span>
			</div>
			<h3 className="mt-3 text-lg font-semibold text-ink">
				{t(domain.titleKey)}
			</h3>
			<p className="mt-2 text-sm leading-relaxed text-ink-70">
				{t(domain.plainKey)}
			</p>
			<ul className="mt-4 space-y-1.5">
				{domain.exampleKeys.map((k) => (
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
					href={`/intake?domain=${domain.id}`}
					className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
				>
					{t("startHere")}
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
				</Link>
				<Link
					href={`/case/${domain.demoId}/analysis`}
					className="text-xs text-ink-50 hover:underline"
				>
					{t("viewWorkedExample")}
				</Link>
			</div>
		</div>
	);
}

export function DomainCards() {
	const { t, lang } = useI18n();
	const serif = lang === "hi" ? "font-doc-hi" : "font-doc";

	return (
		<section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
			<div className="max-w-2xl">
				<h2 className="text-lg font-semibold text-ink">
					{t("homeDomainsHeading")}
				</h2>
				<p className="mt-1 text-ink-70">{t("homeDomainsHint")}</p>
			</div>

			{/* Asymmetric bento: consumer (most common) spans full left,
			    labour + tenant stack right. Collapses to single column on mobile. */}
			<div className="mt-8 grid gap-8 sm:grid-cols-5 sm:gap-6">
				{/* Consumer — left column, full height */}
				<div className="sm:col-span-3">
					<DomainCard
						domain={DOMAINS[0]}
						index={0}
						t={t}
						serif={serif}
					/>
				</div>

				{/* Labour + Tenant — right column, stacked */}
				<div className="flex flex-col gap-8 sm:col-span-2 sm:gap-6">
					<DomainCard
						domain={DOMAINS[1]}
						index={1}
						t={t}
						serif={serif}
					/>
					<DomainCard
						domain={DOMAINS[2]}
						index={2}
						t={t}
						serif={serif}
					/>
				</div>
			</div>
		</section>
	);
}
