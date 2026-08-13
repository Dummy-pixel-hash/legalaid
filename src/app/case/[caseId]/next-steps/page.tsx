"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import type { Step } from "@/lib/types/domain";
import { localize } from "@/lib/types/domain";

function StepItem({ step }: { step: Step }) {
	const { t, lang } = useI18n();
	const effortLabel =
		step.effort === "quick"
			? t("effortQuick")
			: step.effort === "moderate"
				? t("effortModerate")
				: t("effortLong");
	return (
		<li className="flex gap-4 rounded-lg border border-line bg-surface p-5">
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-background">
				{step.order}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="text-sm font-semibold text-ink">
						{localize(step.title, lang)}
					</h3>
					{step.urgent && (
						<span className="inline-flex items-center gap-1 rounded-sm bg-status-caution-bg px-1.5 py-0.5 text-[11px] font-medium text-status-caution">
							<Flag className="h-3 w-3" aria-hidden />
							{t("urgentLabel")}
						</span>
					)}
					<span className="inline-flex items-center gap-1 rounded-sm bg-status-neutral-bg px-1.5 py-0.5 text-[11px] font-medium text-status-neutral">
						<Clock className="h-3 w-3" aria-hidden />
						{effortLabel}
					</span>
				</div>
				<p className="mt-1.5 text-sm leading-relaxed text-ink-70">
					{localize(step.plain, lang)}
				</p>
				<p className="mt-2 text-xs leading-relaxed text-ink-50">
					<span className="font-semibold text-ink-70">{t("whyLabel")}: </span>
					{localize(step.why, lang)}
				</p>
			</div>
		</li>
	);
}

export default function NextStepsPage({
	params,
}: {
	params: Promise<{ caseId: string }>;
}) {
	const { caseId } = use(params);
	return <NextStepsClient caseId={caseId} />;
}

function NextStepsClient({ caseId }: { caseId: string }) {
	const { t, lang } = useI18n();
	const router = useRouter();
	const { record, analysis } = useCase(caseId, lang);

	if (!record) return null;
	if (record.status === "analyzing") {
		return (
			<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
				<LoadingAnalysis stage={record.stage} progress={record.pct} />
			</div>
		);
	}
	if (record.status === "error")
		return <ErrorState onRetry={() => router.refresh()} />;
	if (!analysis) return <EmptyState />;

	return (
		<div className="bs1-page mx-auto max-w-3xl px-4 py-10 sm:px-6">
			<p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
				{t("stepNextSteps")}
			</p>
			<h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
				{t("stepsTitle")}
			</h1>
			<p className="mt-2 text-ink-70">{t("stepsSubtitle")}</p>

			<ol className="bs1-list mt-6">
				{analysis.nextSteps.map((step) => (
					<StepItem key={step.id} step={step} />
				))}
			</ol>

			<p className="bs1-close mt-6 rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-70">
				{t("stepsClosing")}
			</p>

			<div className="mt-10 border-t border-line pt-6">
				<Button
					size="lg"
					onClick={() => router.push(`/case/${caseId}/document`)}
				>
					{t("generateDocumentCta")}
					<ArrowRight className="h-4 w-4" aria-hidden />
				</Button>
			</div>
		</div>
	);
}
