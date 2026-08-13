"use client";

import {
	AlertTriangle,
	BadgeCheck,
	BookOpen,
	Info,
	ShieldAlert,
	Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { ConfidenceKind } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const CONFIG: Record<
	ConfidenceKind,
	{
		labelKey:
			| "confidenceFact"
			| "confidencePossible"
			| "confidenceLegalInfo"
			| "confidenceAi"
			| "verifiedTag"
			| "demoTag";
		icon: typeof Info;
		classes: string;
		iconColor: string;
	}
> = {
	fact: {
		labelKey: "confidenceFact",
		icon: Info,
		classes: "bg-status-neutral-bg text-status-neutral",
		iconColor: "text-status-neutral",
	},
	"possible-issue": {
		labelKey: "confidencePossible",
		icon: AlertTriangle,
		classes: "bg-status-caution-bg text-status-caution",
		iconColor: "text-status-caution",
	},
	"legal-info": {
		labelKey: "confidenceLegalInfo",
		icon: BookOpen,
		classes: "bg-status-info-bg text-status-info",
		iconColor: "text-status-info",
	},
	"ai-interpretation": {
		labelKey: "confidenceAi",
		icon: Sparkles,
		classes:
			"bg-status-ai-bg text-status-ai border border-dashed border-accent-strong/40",
		iconColor: "text-status-ai",
	},
	verified: {
		labelKey: "verifiedTag",
		icon: BadgeCheck,
		classes: "bg-status-success-bg text-status-success",
		iconColor: "text-status-success",
	},
	demo: {
		labelKey: "demoTag",
		icon: ShieldAlert,
		classes: "bg-status-demo-bg text-status-demo",
		iconColor: "text-status-demo",
	},
};

export function ConfidenceBadge({
	kind,
	className,
}: {
	kind: ConfidenceKind;
	className?: string;
}) {
	const { t } = useI18n();
	const cfg = CONFIG[kind];
	const Icon = cfg.icon;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
				cfg.classes,
				className,
			)}
		>
			<Icon className={cn("h-3 w-3", cfg.iconColor)} aria-hidden />
			{t(cfg.labelKey)}
		</span>
	);
}
