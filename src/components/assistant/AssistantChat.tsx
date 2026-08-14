"use client";

import { useEffect, useMemo, useRef } from "react";
import { FlaskConical, Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/shared/VoiceInput";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { ChatTurn } from "./useAssistantChat";

interface AssistantChatProps {
	chips?: string[];
	messages: ChatTurn[];
	streamingText: string;
	busy: boolean;
	error: boolean;
	input: string;
	onInput: (v: string) => void;
	onSend: (q: string) => void;
	/** Show the voice-input mic in the composer. */
	voice?: boolean;
	/** ISO-639-1 hint for voice transcription (the active UI language). */
	language?: "en" | "hi";
	className?: string;
}

/**
 * The chat surface: transcript, suggestion chips, and a composer with an
 * optional voice-input mic. Presentational — state/streaming live in the
 * useAssistantChat hook, so the same surface works in the floating pill.
 */
export function AssistantChat({
	chips,
	messages,
	streamingText,
	busy,
	error,
	input,
	onInput,
	onSend,
	voice,
	language,
	className,
}: AssistantChatProps) {
	const { t } = useI18n();
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	// Grow the composer with the draft (capped), so long questions stay
	// readable instead of scrolling inside a one-line box.
	useEffect(() => {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
	}, [input]);

	// Show the streaming answer as a live bubble; keep the newest message visible.
	const live = useMemo<ChatTurn[]>(
		() =>
			streamingText.length > 0
				? [...messages, { role: "assistant", content: streamingText }]
				: messages,
		[messages, streamingText],
	);

	useEffect(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [live, streamingText]);

	return (
		<div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
			{messages.length === 0 && streamingText.length === 0 ? (
				<div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
					<MessageCircleQuestion
						className="h-6 w-6 text-accent-strong"
						aria-hidden
					/>
					<p className="max-w-[34ch] text-xs leading-relaxed text-ink-50">
						{t("assistantSubtitle")}
					</p>
				</div>
			) : (
				<div
					ref={listRef}
					aria-live="polite"
					className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
				>
					{live.map((m, i) => {
						const streaming =
							m.role === "assistant" &&
							i === live.length - 1 &&
							streamingText.length > 0;
						const { body, note } = splitDemoNote(m.content);
						return (
							<div
								key={i}
								className={cn(
									"flex min-w-0",
									m.role === "user" ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[85%] min-w-0 rounded-md px-3 py-2 text-sm leading-relaxed",
										m.role === "user"
											? "bg-ink text-background"
											: "border border-line bg-surface-muted text-ink",
									)}
								>
									<RichText text={body} />
									{streaming && (
										<span
											aria-hidden
											className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-accent-strong align-middle"
										/>
									)}
									{note && (
										<p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-50">
											<FlaskConical
												className="mt-px h-3 w-3 shrink-0 text-accent-strong"
												aria-hidden
											/>
											<span className="min-w-0">{note}</span>
										</p>
									)}
								</div>
							</div>
						);
					})}
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
									onClick={() => onInput(label)}
									disabled={busy}
									className="rounded-md border border-line bg-background px-3 py-1.5 text-xs font-medium text-ink-70 transition-colors hover:border-ink-30 hover:bg-surface-muted hover:text-ink disabled:opacity-50"
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
						onSend(input);
					}}
				>
					<label htmlFor="assistant-pill-input" className="sr-only">
						{t("assistantPlaceholder")}
					</label>
					<textarea
						ref={inputRef}
						id="assistant-pill-input"
						value={input}
						onChange={(e) => onInput(e.target.value)}
						placeholder={t("assistantPlaceholder")}
						rows={1}
						disabled={busy}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSend(input);
							}
						}}
						className="max-h-40 min-h-10 min-w-0 flex-1 resize-none overflow-y-auto rounded-md border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-50 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20 disabled:opacity-50"
					/>
					{voice && (
						<VoiceInput
							iconOnly
							className="shrink-0"
							language={language}
							onTranscribed={(text) =>
								onInput(input.trim() ? `${input.trim()} ${text}` : text)
							}
						/>
					)}
					<Button
						type="submit"
						size="icon-sm"
						className="h-10 w-10 shrink-0"
						disabled={!input.trim() || busy}
						aria-label={busy ? t("assistantWorking") : t("assistantSendLabel")}
					>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
						) : (
							<Send className="h-4 w-4" aria-hidden />
						)}
					</Button>
				</form>
				<p className="mt-2 text-[11px] leading-relaxed text-ink-50">
					{t("assistantDisclaimer")}
				</p>
			</div>
		</div>
	);
}

/**
 * The demo-provider contract: answers end with a bracketed "[Demo …]" note.
 * Render it as a distinct caption (with the flask mark) instead of burying it
 * in the answer body — real model answers simply won't have the suffix.
 */
function splitDemoNote(content: string): { body: string; note: string | null } {
	const m = content.match(/^([\s\S]*?)\s*(\[[^\]]+\])\s*$/);
	if (m && m[1].trim() && m[2]) {
		return { body: m[1].trim(), note: m[2] };
	}
	return { body: content, note: null };
}

/** Minimal inline formatting: **bold** — nothing heavier than the desk needs. */
function renderInline(text: string, keyPrefix: string) {
	return text.split(/(\*\*[^*\n]+\*\*)/g).map((part, i) =>
		part.startsWith("**") && part.endsWith("**") ? (
			<strong key={`${keyPrefix}-${i}`} className="font-semibold">
				{part.slice(2, -2)}
			</strong>
		) : (
			<span key={`${keyPrefix}-${i}`}>{part}</span>
		),
	);
}

/**
 * Light answer formatting: paragraphs on blank lines; lines that all start
 * with "-", "•", or "1." render as a list with brass markers. Preserves the
 * model's structure without a markdown dependency.
 */
function RichText({ text }: { text: string }) {
	const paragraphs = text.split(/\n{2,}/);
	return (
		<div className="space-y-2 break-words">
			{paragraphs.map((p, i) => {
				const lines = p.split("\n");
				const isList =
					lines.length > 1 &&
					lines.every((l) => /^\s*(?:[-•]|\d+[.)])\s+/.test(l));
				if (isList) {
					return (
						<ul key={i} className="space-y-1">
							{lines.map((l, j) => {
								const m = l.trim().match(/^(\s*(?:[-•]|\d+[.)]))\s+(.*)$/);
								const marker = m?.[1].trim();
								const bullet =
									marker === "-" || marker === "•" ? "•" : marker ?? "";
								return (
									<li key={j} className="flex gap-1.5">
										<span
											className="w-4 shrink-0 text-left text-accent-strong"
											aria-hidden
										>
											{bullet}
										</span>
										<span className="min-w-0">
											{renderInline(m ? m[2] : l, `l${i}-${j}`)}
										</span>
									</li>
								);
							})}
						</ul>
					);
				}
				return (
					<p key={i} className="whitespace-pre-wrap">
						{renderInline(p, `p${i}`)}
					</p>
				);
			})}
		</div>
	);
}
