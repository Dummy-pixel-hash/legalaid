"use client";

import { useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { VoiceInput } from "@/components/shared/VoiceInput";
import type { Domain, IntakeData } from "@/lib/types/domain";

export interface ClarifyingQuestion {
	id: string;
	domains: Domain[] | "all";
	prompt: { en: string; hi: string };
	placeholder: { en: string; hi: string };
	kind: "amount" | "state" | "party" | "yesno";
	target: "amount" | "state" | "otherParty" | "answers";
	alreadyAnswered: (intake: IntakeData) => boolean;
}

const QUESTIONS: ClarifyingQuestion[] = [
	{
		id: "amount",
		domains: "all",
		prompt: {
			en: "About how much money is involved?",
			hi: "लगभग कितनी राशि शामिल है?",
		},
		placeholder: { en: "e.g. 30000", hi: "जैसे: 30000" },
		kind: "amount",
		target: "amount",
		alreadyAnswered: (i) => i.amount !== undefined,
	},
	{
		id: "state",
		domains: "all",
		prompt: {
			en: "Which state or city is this about?",
			hi: "यह मामला किस राज्य या शहर से जुड़ा है?",
		},
		placeholder: { en: "e.g. Bengaluru, Karnataka", hi: "जैसे: बेंगलुरु, कर्नाटक" },
		kind: "state",
		target: "state",
		alreadyAnswered: (i) => Boolean(i.state),
	},
	{
		id: "party",
		domains: "all",
		prompt: {
			en: "Who is the other party? (a name is enough)",
			hi: "दूसरा पक्ष कौन है? (नाम काफी है)",
		},
		placeholder: { en: "e.g. my landlord", hi: "जैसे: मेरे मकान मालिक" },
		kind: "party",
		target: "otherParty",
		alreadyAnswered: (i) => Boolean(i.otherParty),
	},
	{
		id: "written-doc",
		domains: ["tenant", "labour"],
		prompt: {
			en: "Do you have any written document? (agreement, appointment letter, receipts)",
			hi: "क्या आपके पास कोई लिखित दस्तावेज़ है? (समझौता, नियुक्ति पत्र, रसीदें)",
		},
		placeholder: {
			en: "e.g. rent receipts only",
			hi: "जैसे: सिर्फ़ किराए की रसीदें",
		},
		kind: "yesno",
		target: "answers",
		alreadyAnswered: (i) => Boolean(i.answers?.["written-doc"]),
	},
];

function questionsFor(
	domain: Domain | undefined,
	intake: IntakeData,
): ClarifyingQuestion[] {
	const pool = QUESTIONS.filter(
		(q) =>
			!q.alreadyAnswered(intake) &&
			(q.domains === "all" || (domain && q.domains.includes(domain))),
	);
	return pool.slice(0, 3);
}

export function ClarifyingQuestions({
	domain,
	initial,
	onComplete,
}: {
	domain: Domain | undefined;
	initial: IntakeData;
	onComplete: (answers: Record<string, string>, final: IntakeData) => void;
}) {
	const { t, lang } = useI18n();
	const [intake, setIntake] = useState<IntakeData>(initial);
	const [answers] = useState<Record<string, string>>({});
	const [index, setIndex] = useState(0);
	const [value, setValue] = useState("");

	const questions = questionsFor(domain, intake);
	const question = questions[index];
	const isLast = index >= questions.length - 1;

	if (!question) {
		return (
			<div className="rounded-lg border border-line bg-surface p-6 text-center">
				<p className="text-sm text-ink-70">{t("weWillCheckHeading")}</p>
				<Button
					size="lg"
					className="mt-4"
					onClick={() => onComplete(answers, intake)}
				>
					{t("submitIntake")}
					<ArrowRight className="h-4 w-4" aria-hidden />
				</Button>
			</div>
		);
	}

	const save = () => {
		const next = { ...intake };
		if (question.target === "amount") {
			const n = Number(value.replace(/[^\d]/g, ""));
			next.amount = n > 0 ? n : undefined;
		} else if (question.target === "state") {
			next.state = value.trim() || undefined;
		} else if (question.target === "otherParty") {
			next.otherParty = value.trim() || undefined;
		} else if (question.target === "answers") {
			next.answers = { ...(next.answers ?? {}), [question.id]: value.trim() };
		}
		setIntake(next);
		setValue("");
		if (isLast) {
			onComplete({ ...answers, ...(next.answers ?? {}) }, next);
		} else {
			setIndex(index + 1);
		}
	};

	return (
		<div>
			{/* Live region covers only the changing prompt — not the input, so
			    keystrokes and focus don't trigger repeated announcements. */}
			<div aria-live="polite">
				<p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
					{t("clarifyingProgress", {
						current: index + 1,
						total: questions.length,
					})}
				</p>
				<h2 className="mt-2 text-xl font-semibold text-ink">
					{question.prompt[lang]}
				</h2>
				<p className="mt-1 text-sm text-ink-70">{t("clarifyingHint")}</p>
			</div>

			<div className="mt-5 flex flex-col gap-3">
				{question.kind === "amount" ? (
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<span
								aria-hidden
								className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-50"
							>
								₹
							</span>
							<Input
								autoFocus
								inputMode="numeric"
								value={value}
								onChange={(e) => setValue(e.target.value)}
								placeholder={question.placeholder[lang]}
								onKeyDown={(e) => e.key === "Enter" && save()}
								className="pl-8"
							/>
						</div>
						<VoiceInput
							language={lang}
							onTranscribed={(text) =>
								setValue((prev) =>
									prev.trim() ? `${prev.trim()} ${text}` : text,
								)
							}
						/>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<Input
							autoFocus
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder={question.placeholder[lang]}
							onKeyDown={(e) => e.key === "Enter" && save()}
							className="flex-1"
						/>
						<VoiceInput
							language={lang}
							onTranscribed={(text) =>
								setValue((prev) =>
									prev.trim() ? `${prev.trim()} ${text}` : text,
								)
							}
						/>
					</div>
				)}
				<div className="flex items-center gap-3">
					<Button onClick={save} disabled={!value.trim()}>
						{isLast ? t("submitIntake") : t("continue")}
						<ArrowRight className="h-4 w-4" aria-hidden />
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							if (isLast) {
								onComplete(answers, intake);
							} else {
								setIndex(index + 1);
							}
						}}
					>
						<SkipForward className="h-4 w-4" aria-hidden />
						{t("skip")}
					</Button>
				</div>
			</div>
		</div>
	);
}
