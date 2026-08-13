"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { useCaseStore } from "@/lib/store/case-store";
import { getProvider } from "@/lib/providers";
import { getDemoIntake } from "@/lib/mock/demo-cases";
import type { Domain, IntakeData } from "@/lib/types/domain";
import { ClarifyingQuestions } from "@/components/intake/ClarifyingQuestions";
import { VoiceInput } from "@/components/shared/VoiceInput";

export default function IntakePage() {
	return (
		<Suspense fallback={<div className="min-h-[60vh]" />}>
			<IntakeClient />
		</Suspense>
	);
}

function IntakeClient() {
	const { t, lang } = useI18n();
	const router = useRouter();
	const params = useSearchParams();
	const store = useCaseStore();

	const editId = params.get("edit");
	const editingRecord = editId ? store.records[editId] : undefined;

	const prefill = useMemo(() => {
		if (editId && editingRecord) return editingRecord.intake;
		const demoKey = params.get("demo");
		if (demoKey) {
			const demo = getDemoIntake(demoKey);
			if (demo) return demo;
		}
		return {
			description: params.get("q") ?? "",
			domain: (params.get("domain") as Domain | null) ?? undefined,
		} as IntakeData;
	}, [editId, editingRecord, params]);

	const [description, setDescription] = useState(prefill.description);
	const [domain, setDomain] = useState<Domain | undefined>(prefill.domain);
	const [showDetails, setShowDetails] = useState(
		Boolean(prefill.state || prefill.amount || prefill.otherParty),
	);
	const [details, setDetails] = useState({
		state: prefill.state ?? "",
		amount: prefill.amount ? String(prefill.amount) : "",
		otherParty: prefill.otherParty ?? "",
		date: prefill.dates?.[0]?.date ?? "",
	});
	const [stage, setStage] = useState<"describe" | "clarify">("describe");
	const [detected, setDetected] = useState<Domain | undefined>(undefined);
	const [checking, setChecking] = useState(false);

	// Detect domain as the user types (lightweight, no request needed).
	useEffect(() => {
		const handle = setTimeout(() => {
			if (description.trim().length < 20) {
				setDetected(undefined);
				return;
			}
			setDetected(getProvider().detectDomain(description));
		}, 350);
		return () => clearTimeout(handle);
	}, [description]);

	const buildIntake = useCallback(
		(answers?: Record<string, string>): IntakeData => {
			const n = Number(details.amount.replace(/[^\d]/g, ""));
			return {
				description: description.trim(),
				domain: domain ?? detected,
				state: details.state.trim() || undefined,
				amount: n > 0 ? n : undefined,
				otherParty: details.otherParty.trim() || undefined,
				dates:
					details.date.trim() || prefill.dates?.length
						? [
								{
									label: lang === "hi" ? "मुख्य तारीख़" : "Key date",
									date: details.date.trim() || prefill.dates?.[0]?.date,
								},
							]
						: [],
				answers,
			};
		},
		[description, domain, detected, details, lang, prefill.dates],
	);

	const finish = useCallback(
		async (answers: Record<string, string>, final: IntakeData) => {
			if (editId && editingRecord) {
				await store.reanalyze(editId, final, lang);
				router.push(`/case/${editId}/analysis`);
				return;
			}
			const { id } = await store.createFromIntake(final, lang);
			router.push(`/case/${id}/analysis`);
		},
		[editId, editingRecord, store, lang, router],
	);

	const onContinue = () => {
		setChecking(true);
		// Move to clarifying questions — domain fallback to detected.
		setStage("clarify");
	};

	return (
		<div className="p3-page mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
			<p className="p3-step flex items-baseline gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent-strong">
				<span className="p3-num font-doc text-base" aria-hidden>
					01
				</span>
				<span>· {t("stepSituation")}</span>
			</p>
			<div className="p3-rule" aria-hidden />
			<h1 className="p3-title mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
				{t("intakeTitle")}
			</h1>
			<p className="p3-sub mt-2 max-w-[52ch] text-ink-70">
				{t("intakeSubtitle")}
			</p>

			{params.get("demo") && (
				<p className="mt-4 flex items-center gap-2 rounded-md border border-line bg-surface-muted px-3 py-2 text-xs text-ink-70">
					<Info
						className="h-3.5 w-3.5 shrink-0 text-accent-strong"
						aria-hidden
					/>
					{t("scenarioPrefilled")}
				</p>
			)}

			{stage === "describe" ? (
				<form
					className="v1-sheet mt-6 rounded-lg border border-line bg-surface p-6 sm:p-8"
					style={{
						boxShadow:
							"0 1px 2px rgba(27,36,54,0.06), 0 8px 24px rgba(27,36,54,0.08)",
					}}
					onSubmit={(e) => {
						e.preventDefault();
						onContinue();
					}}
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<Label htmlFor="intake-description" className="v1-eyebrow">
							{t("describeLabel")}
						</Label>
						<VoiceInput
							language={lang}
							onTranscribed={(text) =>
								setDescription((prev) =>
									prev.trim() ? `${prev.trim()} ${text}` : text,
								)
							}
						/>
					</div>
					<div className="v1-rule" aria-hidden />
					<Textarea
						id="intake-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={t("describePlaceholder")}
						className="v1-textarea text-base leading-relaxed"
						autoFocus={!prefill.description}
					/>
					{detected && !domain && (
						<div className="v1-detect">
							{lang === "hi" ? "लगता है यह" : "This looks like a"}{" "}
							<span className="font-semibold text-accent-strong">
								{detected === "consumer"
									? t("domainConsumer")
									: detected === "labour"
										? t("domainLabour")
										: t("domainTenant")}
							</span>{" "}
							{lang === "hi" ? "मामला है।" : "matter."}
						</div>
					)}

					<div className="mt-5">
						<button
							type="button"
							onClick={() => setShowDetails((v) => !v)}
							className="flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
						>
							{showDetails ? (
								<ChevronDown className="h-4 w-4" aria-hidden />
							) : (
								<ChevronRight className="h-4 w-4" aria-hidden />
							)}
							{t("addDetails")}
						</button>
						{showDetails && (
							<div className="mt-3 grid gap-4 rounded-md border border-line bg-surface-muted p-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Label htmlFor="d-domain" className="text-xs text-ink-70">
										{t("domainField")}{" "}
										<span className="text-ink-50">({t("optional")})</span>
									</Label>
									<Select
										value={domain ?? "none"}
										onValueChange={(v) =>
											setDomain(v === "none" ? undefined : (v as Domain))
										}
									>
										<SelectTrigger id="d-domain" className="mt-1.5">
											<SelectValue placeholder={t("domainField")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">{t("skip")}</SelectItem>
											<SelectItem value="consumer">
												{t("domainConsumerOption")}
											</SelectItem>
											<SelectItem value="labour">
												{t("domainLabourOption")}
											</SelectItem>
											<SelectItem value="tenant">
												{t("domainTenantOption")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="d-state" className="text-xs text-ink-70">
										{t("stateField")}{" "}
										<span className="text-ink-50">({t("optional")})</span>
									</Label>
									<Input
										id="d-state"
										value={details.state}
										onChange={(e) =>
											setDetails((d) => ({ ...d, state: e.target.value }))
										}
										placeholder={t("statePlaceholder")}
										className="mt-1.5"
									/>
								</div>
								<div>
									<Label htmlFor="d-amount" className="text-xs text-ink-70">
										{t("amountField")}{" "}
										<span className="text-ink-50">({t("optional")})</span>
									</Label>
									<Input
										id="d-amount"
										inputMode="numeric"
										value={details.amount}
										onChange={(e) =>
											setDetails((d) => ({ ...d, amount: e.target.value }))
										}
										placeholder={t("amountPlaceholder")}
										className="mt-1.5"
									/>
								</div>
								<div>
									<Label htmlFor="d-party" className="text-xs text-ink-70">
										{t("otherPartyField")}{" "}
										<span className="text-ink-50">({t("optional")})</span>
									</Label>
									<Input
										id="d-party"
										value={details.otherParty}
										onChange={(e) =>
											setDetails((d) => ({ ...d, otherParty: e.target.value }))
										}
										placeholder={t("otherPartyPlaceholder")}
										className="mt-1.5"
									/>
								</div>
								<div>
									<Label htmlFor="d-date" className="text-xs text-ink-70">
										{t("dateField")}{" "}
										<span className="text-ink-50">({t("optional")})</span>
									</Label>
									<Input
										id="d-date"
										value={details.date}
										onChange={(e) =>
											setDetails((d) => ({ ...d, date: e.target.value }))
										}
										placeholder={t("dateFieldHint")}
										className="mt-1.5"
									/>
								</div>
							</div>
						)}
					</div>

					<Button
						type="submit"
						size="lg"
						disabled={!description.trim()}
						className="mt-5 w-full sm:w-auto"
					>
						{t("continue")}
						<ChevronRight className="h-4 w-4" aria-hidden />
					</Button>
				</form>
			) : (
				<div className="mt-8">
					<ClarifyingQuestions
						key={`${domain ?? detected ?? "any"}-${checking}`}
						domain={domain ?? detected}
						initial={buildIntake()}
						onComplete={finish}
					/>
					<button
						type="button"
						onClick={() => setStage("describe")}
						className="mt-6 text-sm font-medium text-ink-50 hover:text-ink"
					>
						← {t("back")}
					</button>
				</div>
			)}
		</div>
	);
}
