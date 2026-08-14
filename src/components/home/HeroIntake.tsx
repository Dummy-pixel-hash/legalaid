"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { EXAMPLE_SCENARIOS } from "@/lib/mock/demo-cases";
import { VoiceInput } from "@/components/shared/VoiceInput";

/**
 * The cover page of the file: serif document title, and the intake
 * styled as the first sheet — letterhead rule, filing row, body.
 */
export function HeroIntake() {
	const { t, lang } = useI18n();
	const router = useRouter();
	const [text, setText] = useState("");

	const serif = lang === "hi" ? "font-doc-hi" : "font-doc";

	const submit = () => {
		if (!text.trim()) return;
		router.push(`/intake?q=${encodeURIComponent(text.trim())}`);
	};

	return (
		<section className="relative overflow-hidden">
			<div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-between gap-4 px-4 pb-5 pt-4 text-center sm:gap-5 sm:px-6 sm:pb-[6vh] sm:pt-[5vh]">
				<div className="max-w-3xl">
					<p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-strong">
						{t("headerSub")}
					</p>
					<h1 className="mt-3 text-[clamp(28px,6.5vw,60px)] font-semibold uppercase leading-[1.05] tracking-[0.01em] text-ink sm:mt-[18px]">
						{t("homeHeroTitle")}
					</h1>
					<p className="mx-auto mt-3 max-w-[34rem] text-base leading-[1.6] text-ink-70 sm:mt-5 sm:text-[17px]">
						{t("homeHeroSubtitle")}
					</p>
				</div>

				{/* The first sheet of the file */}
				<div className="mt-auto w-full max-w-[720px] rounded-[10px] border border-line bg-surface text-left shadow-[0_1px_2px_rgba(27,36,54,0.08),0_8px_24px_rgba(27,36,54,0.10)]">
					<div className="flex items-baseline justify-between gap-3 border-b-4 border-ink px-6 pt-4 pb-2.5 sm:px-7 sm:pt-[18px] sm:pb-3">
						<p
							className={`${serif} text-[15px] font-semibold uppercase tracking-[0.08em] text-ink sm:text-[17px]`}
						>
							{t("situationSheet")}
						</p>
						<p className="text-[11px] uppercase tracking-[0.12em] text-ink-50">
							{t("stepOf", { current: 1, total: 5 })}
						</p>
					</div>
					<form
						className="px-6 pb-[26px] pt-[22px] sm:px-7"
						onSubmit={(e) => {
							e.preventDefault();
							submit();
						}}
					>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<label
								htmlFor="hero-situation"
								className="text-sm font-medium text-ink"
							>
								{t("describeLabel")}
							</label>
							<VoiceInput
								language={lang}
								onTranscribed={(transcript) =>
									setText((prev) =>
										prev.trim() ? `${prev.trim()} ${transcript}` : transcript,
									)
								}
							/>
						</div>
						<p className="mt-1.5 text-xs leading-snug text-ink-50">
							{t("voicePrivacyNote")}
						</p>
						<Textarea
							id="hero-situation"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder={t("homeIntakePlaceholder")}
							className="mt-2 min-h-[130px] w-full text-[17px] leading-[1.6] sm:min-h-[170px]"
						/>
						<div className="mt-[18px] flex flex-wrap items-center justify-between gap-4">
							<ul
								className="flex gap-2.5 overflow-x-auto sm:overflow-visible sm:flex-wrap"
								aria-label={t("homeExamplesHeading")}
							>
								{EXAMPLE_SCENARIOS.map((s) => (
									<li key={s.key} className="shrink-0">
										<button
											type="button"
											onClick={() => setText(lang === "hi" ? s.hi : s.en)}
											className="inline-flex min-h-10 shrink-0 items-center rounded-md border border-line bg-surface px-3.5 py-1.5 text-left text-[13px] leading-tight font-medium text-ink-70 transition-colors hover:border-ink-30 hover:bg-surface-muted hover:text-ink"
										>
											{lang === "hi" ? s.labelHi : s.labelEn}
										</button>
									</li>
								))}
							</ul>
							<Button
								type="submit"
								size="lg"
								disabled={!text.trim()}
								className="h-14 shrink-0 px-9 text-[15px]"
							>
								{t("understandMySituation")}
								<ArrowRight className="h-4 w-4" aria-hidden />
							</Button>
						</div>
						{!text.trim() && (
							<p className="mt-2 text-right text-xs leading-snug text-ink-50">
								{t("understandHint")}
							</p>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}
