"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2, Send } from "lucide-react";
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
		<div className={cn("flex min-h-0 flex-1 flex-col", className)}>
			{messages.length === 0 && streamingText.length === 0 ? (
				<div className="px-4 pt-4 sm:px-5">
					<p className="text-xs leading-relaxed text-ink-50">
						{t("assistantSubtitle")}
					</p>
				</div>
			) : (
				<div
					ref={listRef}
					aria-live="polite"
					className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
				>
					{live.map((m, i) => (
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
									onClick={() => onInput(label)}
									disabled={busy}
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
						onSend(input);
					}}
				>
					<label htmlFor="assistant-pill-input" className="sr-only">
						{t("assistantPlaceholder")}
					</label>
					<textarea
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
						className="min-h-10 flex-1 resize-none rounded-md border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-50 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20 disabled:opacity-50"
					/>
					{voice && (
						<VoiceInput
							language={language}
							onTranscribed={(text) =>
								onInput(input.trim() ? `${input.trim()} ${text}` : text)
							}
						/>
					)}
					<Button type="submit" size="sm" disabled={!input.trim() || busy}>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
						) : (
							<Send className="h-4 w-4" aria-hidden />
						)}
						{busy ? t("assistantWorking") : t("assistantSend")}
					</Button>
				</form>
				<p className="mt-2 text-[11px] leading-relaxed text-ink-50">
					{t("assistantDisclaimer")}
				</p>
			</div>
		</div>
	);
}
