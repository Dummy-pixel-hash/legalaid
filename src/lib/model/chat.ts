/**
 * Server-side OpenAI-compatible LLM client for the LegalAId model backend.
 * Connects to a llama.cpp / OpenAI-compatible server.
 *
 * Env (server-side only):
 *   AI_ENDPOINT  — base URL override, e.g. https://fedora.tail016b3f.ts.net.
 *                  If AI_ENDPOINT_REGISTRY is set, the live endpoint is
 *                  resolved from there at cold start (and AI_ENDPOINT is the
 *                  fallback when the registry is unreachable).
 *   AI_ENDPOINT_REGISTRY — URL of a small public JSON {"endpoint": "..."} that
 *                  the model host updates when its public address changes
 *                  (funnel URL). Lets Vercel follow a moving endpoint without
 *                  redeploys.
 *   AI_API_KEY   — bearer token required by the model server (llama.cpp
 *                  --api-key-file). Sent as Authorization: Bearer.
 *   AI_MODEL     — optional; auto-detected from /v1/models when unset.
 *   AI_ENABLE_THINKING — set to "1" to KEEP the model's chain-of-thought
 *     mode on. Default is OFF: reasoning models (e.g. Qwen3) otherwise spend
 *     their whole token budget on `reasoning_content` and return an empty
 *     `content`, which breaks our JSON parsing.
 */

const ENDPOINT_FALLBACK = process.env.AI_ENDPOINT ?? "http://100.86.95.34:8080";
const ENDPOINT_REGISTRY = process.env.AI_ENDPOINT_REGISTRY;
const API_KEY = process.env.AI_API_KEY;
const MODEL_ENV = process.env.AI_MODEL;
const ENABLE_THINKING = process.env.AI_ENABLE_THINKING === "1";

let endpointCache: string | null = null;

/** Resolve the model base URL: registry (live, follows a moving endpoint) →
 * AI_ENDPOINT env → legacy tailnet default. Cached per process (cold start). */
async function resolveEndpoint(): Promise<string> {
	if (endpointCache) return endpointCache;
	if (ENDPOINT_REGISTRY) {
		try {
			const res = await fetch(ENDPOINT_REGISTRY, {
				signal: AbortSignal.timeout(10_000),
			});
			if (res.ok) {
				const body = (await res.json()) as { endpoint?: unknown };
				if (typeof body.endpoint === "string" && body.endpoint.trim()) {
					endpointCache = body.endpoint.trim();
					return endpointCache;
				}
			}
		} catch {
			// registry unreachable — fall back to env/default
		}
	}
	endpointCache = ENDPOINT_FALLBACK;
	return endpointCache;
}

function authHeaders(): Record<string, string> {
	return API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};
}

let modelCache: string | null = null;

async function resolveModel(): Promise<string> {
	if (MODEL_ENV) return MODEL_ENV;
	if (modelCache) return modelCache;
	const res = await fetch(`${await resolveEndpoint()}/v1/models`, {
		headers: authHeaders(),
	});
	if (!res.ok) throw new Error(`model list failed: ${res.status}`);
	const body = (await res.json()) as { data?: { id: string }[] };
	const first = body.data?.[0]?.id;
	if (!first) throw new Error("no model available at endpoint");
	modelCache = first;
	return first;
}

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

/**
 * Streaming chat completion: yields text deltas as they arrive (OpenAI-style
 * SSE from llama.cpp). Used by the assistant route for typewriter Q&A answers
 * — free-form natural language, so NO response_format constraint (unlike
 * chatCompletion, which is JSON-only).
 */
export async function* chatCompletionStream(opts: {
	messages: ChatMessage[];
	maxTokens?: number;
	temperature?: number;
	signal?: AbortSignal;
}): AsyncGenerator<string> {
	const model = await resolveModel();
	const res = await fetch(`${await resolveEndpoint()}/v1/chat/completions`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({
			model,
			messages: opts.messages,
			max_tokens: opts.maxTokens ?? 2048,
			temperature: opts.temperature ?? 0.3,
			stream: true,
			// Suppress repetition loops (the fine-tune occasionally degenerates).
			repeat_penalty: 1.1,
			...(ENABLE_THINKING
				? {}
				: { chat_template_kwargs: { enable_thinking: false } }),
		}),
		signal: opts.signal ?? AbortSignal.timeout(300_000),
	});
	if (!res.ok || !res.body) {
		throw new Error(`model call failed: ${res.status} ${await res.text()}`);
	}
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let sep = buffer.indexOf("\n\n");
			while (sep !== -1) {
				const raw = buffer.slice(0, sep);
				buffer = buffer.slice(sep + 2);
				sep = buffer.indexOf("\n\n");
				const line = raw.trim();
				if (!line.startsWith("data:")) continue;
				const payload = line.slice(5).trim();
				if (payload === "[DONE]") return;
				try {
					const evt = JSON.parse(payload) as {
						choices?: { delta?: { content?: string } }[];
					};
					const delta = evt.choices?.[0]?.delta?.content;
					if (delta) yield delta;
				} catch {
					// malformed frame — skip
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

/**
 * Pull the first valid JSON object out of model output. Reasoning models may
 * wrap JSON in markdown fences or preface it with prose, even with thinking
 * disabled; this extracts the JSON payload so callers can parse it cleanly.
 */
export function extractJson(raw: string): string {
	let s = raw.trim();
	const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
	if (fence) s = fence[1].trim();
	const start = s.indexOf("{");
	const end = s.lastIndexOf("}");
	if (start === -1 || end === -1 || end < start) {
		return s;
	}
	return s.slice(start, end + 1);
}

/**
 * llama.cpp's json_schema grammar permits raw control characters (newlines,
 * tabs) inside string literals, which strict JSON forbids — some models write
 * multi-line strings. Escape only control chars that sit INSIDE a string, so
 * the strict parser accepts the grammar-valid output. Only used as a fallback.
 */
export function escapeControlCharsInStrings(s: string): string {
	let out = "";
	let inStr = false;
	let esc = false;
	for (const ch of s) {
		if (inStr) {
			if (esc) {
				out += ch;
				esc = false;
				continue;
			}
			if (ch === "\\") {
				out += ch;
				esc = true;
				continue;
			}
			if (ch === '"') {
				out += ch;
				inStr = false;
				continue;
			}
			const code = ch.charCodeAt(0);
			if (code < 0x20) {
				out +=
					ch === "\n"
						? "\\n"
						: ch === "\r"
							? "\\r"
							: ch === "\t"
								? "\\t"
								: `\\u00${code.toString(16).padStart(2, "0")}`;
				continue;
			}
			out += ch;
		} else {
			if (ch === '"') inStr = true;
			out += ch;
		}
	}
	return out;
}

export async function chatCompletion(opts: {
	messages: ChatMessage[];
	maxTokens?: number;
	temperature?: number;
}): Promise<string> {
	const model = await resolveModel();
	const res = await fetch(`${await resolveEndpoint()}/v1/chat/completions`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({
			model,
			messages: opts.messages,
			max_tokens: opts.maxTokens ?? 4096,
			temperature: opts.temperature ?? 0.2,
			// The fine-tuned model degenerates into repetition loops that burn the
			// token budget mid-string; a mild penalty keeps generation on track.
			repeat_penalty: 1.1,
			response_format: { type: "json_object" },
			// Reasoning models burn their budget on chain-of-thought unless told not
			// to. llama.cpp's Qwen3 template honors this via chat_template_kwargs.
			...(ENABLE_THINKING
				? {}
				: { chat_template_kwargs: { enable_thinking: false } }),
		}),
		signal: AbortSignal.timeout(300_000),
	});
	if (!res.ok) {
		throw new Error(`model call failed: ${res.status} ${await res.text()}`);
	}
	const body = (await res.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	const content = body.choices?.[0]?.message?.content ?? "";
	if (!content) throw new Error("model returned empty content");
	return content;
}

/**
 * Grammar-constrained chat completion: the server enforces the JSON Schema,
 * so the response is valid JSON by construction. No retry loop here — the
 * caller decides retry policy (one attempt per section in the analyze route).
 */
export async function chatCompletionJson(opts: {
	messages: ChatMessage[];
	maxTokens?: number;
	temperature?: number;
	name: string;
	schema: object;
}): Promise<unknown> {
	const model = await resolveModel();
	const res = await fetch(`${await resolveEndpoint()}/v1/chat/completions`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({
			model,
			messages: opts.messages,
			max_tokens: opts.maxTokens ?? 4096,
			temperature: opts.temperature ?? 0.2,
			// Suppress repetition loops (the fine-tune occasionally degenerates).
			repeat_penalty: 1.1,
			response_format: {
				type: "json_schema",
				json_schema: { name: opts.name, schema: opts.schema, strict: true },
			},
			...(ENABLE_THINKING
				? {}
				: { chat_template_kwargs: { enable_thinking: false } }),
		}),
		signal: AbortSignal.timeout(300_000),
	});
	if (!res.ok) {
		throw new Error(`model call failed: ${res.status} ${await res.text()}`);
	}
	const body = (await res.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	const content = body.choices?.[0]?.message?.content ?? "";
	if (!content) throw new Error("model returned empty content");
	// Grammar guarantees valid JSON, but llama.cpp permits raw control chars in
	// strings; retry once with those escaped (see escapeControlCharsInStrings).
	const raw = extractJson(content);
	try {
		return JSON.parse(raw);
	} catch {
		return JSON.parse(escapeControlCharsInStrings(raw));
	}
}
