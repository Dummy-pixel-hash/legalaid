"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { EvidenceStatus } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const OPTIONS: {
	value: EvidenceStatus;
	labelKey: "have" | "dontHave" | "needToFind";
}[] = [
	{ value: "have", labelKey: "have" },
	{ value: "dont-have", labelKey: "dontHave" },
	{ value: "need-to-find", labelKey: "needToFind" },
];

export function EvidenceStatusControl({
	value,
	onChange,
}: {
	value: EvidenceStatus;
	onChange: (status: EvidenceStatus) => void;
}) {
	const { t } = useI18n();
	// Roving tabindex anchor: the checked option (or the first when unset).
	const [focused, setFocused] = useState<EvidenceStatus>(() =>
		OPTIONS.some((o) => o.value === value) ? value : OPTIONS[0].value,
	);
	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const idx = OPTIONS.findIndex((o) => o.value === focused);
		let next = -1;
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			next = (idx + 1) % OPTIONS.length;
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			next = (idx - 1 + OPTIONS.length) % OPTIONS.length;
		}
		if (next >= 0) {
			e.preventDefault();
			const v = OPTIONS[next].value;
			setFocused(v);
			onChange(v);
		}
	};

	return (
		<div
			role="radiogroup"
			aria-label={t("evidenceStatusLabel")}
			onKeyDown={onKeyDown}
			className="inline-flex flex-wrap gap-1 rounded-md border border-line bg-background p-0.5"
		>
			{OPTIONS.map((opt) => {
				const selected = value === opt.value;
				return (
					<button
						key={opt.value}
						role="radio"
						aria-checked={selected}
						tabIndex={focused === opt.value ? 0 : -1}
						onClick={() => {
							setFocused(opt.value);
							onChange(opt.value);
						}}
						onFocus={() => setFocused(opt.value)}
						className={cn(
							"inline-flex min-h-11 items-center px-2.5 py-1.5 text-xs font-medium transition-colors",
							selected
								? opt.value === "have"
									? "bg-status-success-bg text-status-success"
									: opt.value === "dont-have"
										? "bg-status-danger-bg text-status-danger"
										: "bg-status-caution-bg text-status-caution"
								: "text-ink-50 hover:bg-surface-muted hover:text-ink",
						)}
					>
						{t(opt.labelKey)}
					</button>
				);
			})}
		</div>
	);
}
