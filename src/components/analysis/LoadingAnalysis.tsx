"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/provider";
import { GRAIN } from "@/lib/visual";
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
 * The analysis wait becomes a composed full-screen stage. The page beneath is
 * heavy-blurred behind a paper veil; SOFT COLOR FIELDS + film grain are painted
 * INTO the stage itself, so the blur-and-grain look is visible even when there
 * is little content behind the overlay (the usual case during first analysis).
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
			{/* Soft blurred color fields — the blur look even over empty page */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 overflow-hidden"
			>
				<div className="absolute -top-24 left-[15%] h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
				<div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-accent-strong/15 blur-3xl" />
				<div className="absolute -bottom-28 left-[8%] h-80 w-80 rounded-full bg-ink/10 blur-3xl" />
			</div>
			{/* Film grain over everything */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 opacity-[0.06] mix-blend-multiply"
				style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
			/>

			<div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-14">
				<p className="flex items-center gap-2 text-sm font-medium text-ink-70">
					<span className="relative flex h-2.5 w-2.5">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-strong opacity-40" />
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-strong" />
					</span>
					{t(STAGE_COPY[stage ?? "reading"])}
					<span className="text-xs text-ink-50">({progress}%)</span>
				</p>

				<div className="mt-6 w-full space-y-5">
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
											? "opacity-100 loader-tile-active"
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
