/**
 * Server-side OpenAI-compatible LLM client for the LegalAId model backend.
 * Connects to a llama.cpp / OpenAI-compatible server (no API key).
 *
 * Env (server-side only):
 *   AI_ENDPOINT  — base URL, e.g. http://100.86.95.34:8080
 *   AI_MODEL     — optional; auto-detected from /v1/models when unset.
 *   AI_ENABLE_THINKING — set to "1" to KEEP the model's chain-of-thought
 *     mode on. Default is OFF: reasoning models (e.g. Qwen3) otherwise spend
 *     their whole token budget on `reasoning_content` and return an empty
 *     `content`, which breaks our JSON parsing.
 */

const ENDPOINT = process.env.AI_ENDPOINT ?? "http://100.86.95.34:8080";
const MODEL_ENV = process.env.AI_MODEL;
const ENABLE_THINKING = process.env.AI_ENABLE_THINKING === "1";

let modelCache: string | null = null;

async function resolveModel(): Promise<string> {
  if (MODEL_ENV) return MODEL_ENV;
  if (modelCache) return modelCache;
  const res = await fetch(`${ENDPOINT}/v1/models`);
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

export async function chatCompletion(opts: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const model = await resolveModel();
  const res = await fetch(`${ENDPOINT}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.2,
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
  const res = await fetch(`${ENDPOINT}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.2,
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
  // Grammar guarantees valid JSON; if parsing still fails, propagate the error
  // (no fallback here — the route's contingency decides retries).
  return JSON.parse(extractJson(content));
}
