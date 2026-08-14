"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { getProvider } from "@/lib/providers";
import {
	buildAssistantContext,
	type AssistantPage,
} from "@/lib/assistant-context";
import type { AssistantMessage } from "@/lib/providers/legal-analysis";
import type { DocumentData } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface CaseAssistantProps {
	caseId: string;
	page: AssistantPage;
	/** Translated suggestion chips shown above the input. */
	chips?: string[];
	/** Override the heading (e.g. the document page's own title). */
	heading?: string;
	/** Current document draft — included in the case context for the document page. */
	document?: DocumentData;
	className?: string;
}

/** Only the latest turns are replayed to the model per question. */
const MAX_HISTORY = 8;

/**
 * The case-aware Q&A assistant. Grounded in the user's own case (intake +
 * structured analysis + evidence state + current draft), streamed via the
 * provider seam (mock for demos, /api/assistant for the real backend).
 */
export function CaseAssistant({
	caseId,
	page,
	chips,
	heading,
	document,
	className,
}: CaseAssistantProps) {
	const { t, lang } = useI18n();
	const { record, analysis } = useCase(caseId, lang);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [streaming, setStreaming] = useState(false);
	const [error, setError] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const draftRef = useRef("");

	// Language switch → the transcript was answered in the old language; start
	// fresh rather than mixing scripts. Reset during render (not in an effect)
	// per React's "adjusting state when props change" pattern.
	const [prevLang, setPrevLang] = useState(lang);
	if (prevLang !== lang) {
		setPrevLang(lang);
		setMessages([]);
		setError(false);
	}

	const scrollBottom = useCallback(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, []);

	useEffect(() => {
		scrollBottom();
	}, [messages, scrollBottom]);

	const ask = useCallback(
		async (raw: string) => {
			const q = raw.trim();
			if (!q || streaming || !record || !analysis) return;
			setError(false);
			const history: AssistantMessage[] = messages
				.slice(-MAX_HISTORY)
				.map((m) => ({ role: m.role, content: m.content }));
			setMessages((prev) => [...prev, { role: "user", content: q }]);
			setInput("");
			setStreaming(true);
			draftRef.current = "";
			try {
				const answer = await getProvider().askAssistant(
					{
						context: buildAssistantContext(record, analysis, lang, document),
						question: q,
						history,
						lang,
						page,
					},
					(delta) => {
						draftRef.current += delta;
						setMessages((prev) => {
							const copy = [...prev];
							const last = copy[copy.length - 1];
							if (last?.role === "assistant") {
								copy[copy.length - 1] = {
									role: "assistant",
									content: draftRef.current,
								};
							} else {
								copy.push({ role: "assistant", content: draftRef.current });
							}
							return copy;
						});
					},
				);
				// Final state is authoritative (covers providers that never streamed).
				setMessages((prev) => {
					const copy = [...prev];
					const last = copy[copy.length - 1];
					if (last?.role === "assistant") {
						copy[copy.length - 1] = { role: "assistant", content: answer };
					} else {
						copy.push({ role: "assistant", content: answer });
					}
					return copy;
				});
			} catch {
				setError(true);
				// Drop an empty assistant placeholder, keep the user's question.
				setMessages((prev) => {
					const copy = [...prev];
					const last = copy[copy.length - 1];
					if (last?.role === "assistant" && !last.content.trim()) copy.pop();
					return copy;
				});
			} finally {
				setStreaming(false);
			}
		},
		[messages, streaming, record, analysis, lang, page, document],
	);

	if (!record || !analysis) return null;

	return (
		<section
			className={cn(
				"overflow-hidden rounded-lg border border-line bg-surface",
				className,
			)}
			aria-label={heading ?? t("assistantHeading")}
		>
			<div className="border-b border-line px-4 py-3 sm:px-5">
				<div className="flex items-center gap-2">
					<MessageCircleQuestion
						className="h-4 w-4 shrink-0 text-accent-strong"
						aria-hidden
					/>
					<h2 className="text-sm font-semibold text-ink">
						{heading ?? t("assistantHeading")}
					</h2>
				</div>
				<p className="mt-1 text-xs leading-relaxed text-ink-50">
					{t("assistantSubtitle")}
				</p>
			</div>

			{messages.length > 0 && (
				<div
					ref={listRef}
					aria-live="polite"
					className="max-h-72 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
				>
					{messages.map((m, i) => (
						<div
							key={i}
							className={cn(
								"flex",
								m.role === "user" ? "justify-end" : "justify-start",
							)}
						>
							<div
								className={cn(
									"max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed",
									m.role === "user"
										? "bg-ink text-background"
										: "border border-line bg-surface-muted text-ink",
								)}
							>
								{m.content}
							</div>
						</div>
					))}
				</div>
			)}

			{error && (
				<div className="px-4 pt-3 sm:px-5">
					<p className="text-xs font-medium text-status-danger" role="alert">
						{t("assistantError")}
					</p>
				</div>
			)}

			<div className="border-t border-line px-4 py-3 sm:px-5">
				{chips && chips.length > 0 && (
					<ul className="mb-3 flex flex-wrap gap-2">
						{chips.map((label) => (
							<li key={label}>
								<button
									type="button"
									onClick={() => setInput(label)}
									disabled={streaming}
									className="rounded-md border border-line bg-background px-3 py-1.5 text-xs font-medium text-ink-70 transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
								>
									{label}
								</button>
							</li>
						))}
					</ul>
				)}
				<form
					className="flex items-end gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						void ask(input);
					}}
				>
					<label htmlFor={`assistant-input-${page}`} className="sr-only">
						{t("assistantPlaceholder")}
					</label>
					<textarea
						id={`assistant-input-${page}`}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={t("assistantPlaceholder")}
						rows={1}
						disabled={streaming}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								void ask(input);
							}
						}}
						className="min-h-10 flex-1 resize-none rounded-md border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-50 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20 disabled:opacity-50"
					/>
					<Button type="submit" size="sm" disabled={!input.trim() || streaming}>
						{streaming ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
						) : (
							<Send className="h-4 w-4" aria-hidden />
						)}
						{streaming ? t("assistantWorking") : t("assistantSend")}
					</Button>
				</form>
				<p className="mt-2 text-[11px] leading-relaxed text-ink-50">
					{t("assistantDisclaimer")}
				</p>
			</div>
		</section>
	);
}
