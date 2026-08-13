"use client";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/types/domain";

const OPTIONS: { value: Language; label: string }[] = [
	{ value: "en", label: "English" },
	{ value: "hi", label: "हिन्दी" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
	const { lang, setLang } = useI18n();

	return (
		<div
			role="group"
			aria-label="Language / भाषा"
			className={cn(
				"inline-flex items-center rounded-md border border-line bg-surface p-0.5",
				className,
			)}
		>
			{OPTIONS.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => setLang(opt.value)}
					aria-pressed={lang === opt.value}
					className={cn(
						"rounded-sm px-3 py-1.5 min-h-11 text-xs font-medium transition-colors",
						lang === opt.value
							? "bg-accent text-accent-foreground"
							: "text-ink-70 hover:bg-surface-muted hover:text-ink",
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}
