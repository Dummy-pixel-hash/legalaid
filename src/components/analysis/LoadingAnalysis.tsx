"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/provider";
import type { AnalysisStage } from "@/lib/types/domain";

const STAGE_COPY: Record<
	AnalysisStage,
	| "analyzingStepReading"
	| "analyzingStepIssues"
	| "analyzingStepRights"
	| "analyzingStepLaws"
	| "analyzingStepEvidence"
	| "analyzingStepSteps"
	| "analyzingStepDocument"
> = {
	reading: "analyzingStepReading",
	issues: "analyzingStepIssues",
	rights: "analyzingStepRights",
	laws: "analyzingStepLaws",
	evidence: "analyzingStepEvidence",
	steps: "analyzingStepSteps",
	document: "analyzingStepDocument",
};

const BLOCKS: AnalysisStage[] = [
	"reading",
	"issues",
	"rights",
	"laws",
	"evidence",
	"steps",
];

/**
 * Static film grain — a painted feTurbulence texture (URL-encoded SVG), no
 * animation, so the "heavy blur + grain" stage costs one painted layer, not a
 * live effect.
 */
const GRAIN =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The analysis wait becomes a composed full-screen stage: the page beneath is
 * heavy-blurred behind a paper veil with a film-grain texture, so the static
 * screen never reads as a half-finished page or a see-through background.
 */
export function LoadingAnalysis({
	stage,
	progress,
}: {
	stage: AnalysisStage | null;
	progress: number;
}) {
	const { t } = useI18n();
	const activeIndex = stage ? BLOCKS.indexOf(stage) : 0;

	return (
		<div
			className="fixed inset-0 z-40 overflow-y-auto"
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			{/* Heavy blur + paper veil over the page beneath */}
			<div
				aria-hidden
				className="fixed inset-0 bg-background/70 backdrop-blur-xl"
			/>
			{/* Film grain over the veil */}
			<div
				aria-hidden
				className="fixed inset-0 opacity-[0.06] mix-blend-multiply"
				style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
			/>

			<div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
				<p className="flex items-center gap-2 text-sm font-medium text-ink-70">
					<span className="relative flex h-2.5 w-2.5">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-strong opacity-40" />
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-strong" />
					</span>
					{t(STAGE_COPY[stage ?? "reading"])}
					<span className="text-xs text-ink-50">({progress}%)</span>
				</p>

				<div className="mt-6 space-y-5">
					{BLOCKS.map((block, i) => {
						const isResolved = i < activeIndex;
						const isActive = i === activeIndex;
						return (
							<div
								key={block}
								className={`rounded-lg border border-line bg-surface p-5 transition-opacity duration-300 ${
									isResolved
										? "opacity-40"
										: isActive
											? "opacity-100"
											: "opacity-25"
								}`}
							>
								<Skeleton className="h-3 w-32" />
								<Skeleton className="mt-3 h-4 w-full" />
								<Skeleton className="mt-2 h-4 w-4/5" />
								{block === "laws" && (
									<>
										<Skeleton className="mt-4 h-3 w-40" />
										<Skeleton className="mt-2 h-4 w-full" />
										<Skeleton className="mt-2 h-4 w-3/5" />
									</>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
