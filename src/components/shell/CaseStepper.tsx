"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const STEPS = [
	{ key: "stepSituation", path: "" },
	{ key: "stepAnalysis", path: "/analysis" },
	{ key: "stepEvidence", path: "/evidence" },
	{ key: "stepNextSteps", path: "/next-steps" },
	{ key: "stepDocument", path: "/document" },
] as const;

function stepIndexFromPath(pathname: string): number {
	const idx = STEPS.findIndex(
		(s) => s.path !== "" && pathname.endsWith(s.path),
	);
	return idx === -1 ? 0 : idx;
}

export function CaseStepper({ caseId }: { caseId: string }) {
	const { t } = useI18n();
	const pathname = usePathname() ?? "";
	const current = stepIndexFromPath(pathname);

	return (
		<nav
			aria-label={t("caseProgress")}
			className="print-hide border-b border-line bg-background"
		>
			{/* Desktop rail */}
			<ol className="mx-auto hidden max-w-5xl items-center gap-0 px-4 pt-3 sm:flex sm:px-6">
				{STEPS.map((step, i) => {
					const isCurrent = i === current;
					const isDone = i < current;
					const href =
						step.path === ""
							? `/intake?edit=${caseId}`
							: `/case/${caseId}${step.path}`;
					return (
						<li key={step.key} className="flex flex-1 items-center">
							{i > 0 && (
								<span
									aria-hidden
									className={cn(
										"mx-2 h-px flex-1",
										i <= current ? "bg-accent-strong" : "bg-line",
									)}
								/>
							)}
							<Link
								href={href}
								aria-current={isCurrent ? "step" : undefined}
								className={cn(
									"flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
									isCurrent
										? "bg-accent text-accent-foreground"
										: isDone
											? "text-accent-strong hover:bg-accent"
											: "text-ink-50 hover:text-ink",
								)}
							>
								<span
									className={cn(
										"flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
										isCurrent
											? "border-accent-strong bg-accent-strong text-white"
											: isDone
												? "border-accent-strong bg-accent-strong text-white"
												: "border-ink-30 bg-surface text-ink-50",
									)}
									aria-hidden
								>
									{isDone ? <Check className="h-3 w-3" /> : i + 1}
								</span>
								<span className="whitespace-nowrap">{t(step.key)}</span>
							</Link>
						</li>
					);
				})}
			</ol>

			{/* Mobile compact */}
			<div className="mx-auto max-w-5xl px-4 py-3 sm:hidden">
				<div className="flex items-center justify-between gap-3">
					<Link
						href={
							current === 0 || STEPS[current - 1].path === ""
								? `/intake?edit=${caseId}`
								: `/case/${caseId}${STEPS[current - 1].path}`
						}
						aria-label={t("back")}
						className={cn(
							"flex h-11 w-11 items-center justify-center rounded-md border border-line text-ink-70",
							current === 0 && "pointer-events-none opacity-40",
						)}
					>
						<ChevronLeft className="h-4 w-4" aria-hidden />
					</Link>
					<p className="text-sm font-medium text-ink">
						{t("stepOf", { current: current + 1, total: STEPS.length })}
						<span className="ml-1.5 text-ink-50">
							· {t(STEPS[current].key)}
						</span>
					</p>
					<Link
						href={
							current === STEPS.length - 1
								? `/case/${caseId}${STEPS[current].path}`
								: `/case/${caseId}${STEPS[current + 1].path}`
						}
						aria-label={t("next")}
						className={cn(
							"flex h-11 w-11 items-center justify-center rounded-md border border-line text-ink-70",
							current === STEPS.length - 1 && "pointer-events-none opacity-40",
						)}
					>
						<ChevronRight className="h-4 w-4" aria-hidden />
					</Link>
				</div>
				<div
					className="mt-2 h-1 overflow-hidden rounded-full bg-line"
					role="progressbar"
					aria-valuenow={((current + 1) / STEPS.length) * 100}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<div
						className="h-full rounded-full bg-accent-strong transition-all duration-300"
						style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
					/>
				</div>
			</div>
		</nav>
	);
}
