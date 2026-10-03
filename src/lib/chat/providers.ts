import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { HANDOFF_TOOL_DESCRIPTION, HANDOFF_TOOL_NAME, HANDOFF_TOOL_PARAMETERS } from "./tools";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface StreamOptions {
  system: string;
  messages: ChatTurn[];
  signal: AbortSignal;
  /** When false the hand-off tool is not offered (conversation already handed off). */
  allowHandoff: boolean;
  onText: (delta: string) => void;
}

/** Raw tool input returned by the model (validated by the caller). */
export interface StreamResult {
  handoffInput?: unknown;
  /** True when the model produced neither text nor a tool call. */
  empty?: boolean;
}

export interface ChatProvider {
  name: "groq" | "anthropic";
  stream: (options: StreamOptions) => Promise<StreamResult>;
}

const MAX_TOKENS = 600;

/* ---------------- Anthropic (Claude) ---------------- */

function anthropicProvider(apiKey: string): ChatProvider {
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";

  return {
    name: "anthropic",
    async stream({ system, messages, signal, allowHandoff, onText }) {
      const stream = client.messages.stream(
        {
          model,
          max_tokens: MAX_TOKENS,
          temperature: 0.4,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          ...(allowHandoff
            ? {
                tools: [
                  {
                    name: HANDOFF_TOOL_NAME,
                    description: HANDOFF_TOOL_DESCRIPTION,
                    input_schema: HANDOFF_TOOL_PARAMETERS as unknown as Anthropic.Tool.InputSchema,
                  },
                ],
              }
            : {}),
          messages,
        },
        { signal },
      );
      stream.on("text", onText);
      const final = await stream.finalMessage();
      const tool = final.content.find((b) => b.type === "tool_use" && b.name === HANDOFF_TOOL_NAME);
      return { handoffInput: tool && tool.type === "tool_use" ? tool.input : undefined };
    },
  };
}

/* ---------------- Groq (OpenAI-compatible, free tier) ---------------- */

interface GroqDelta {
  content?: string | null;
  tool_calls?: { index: number; function?: { name?: string; arguments?: string } }[];
}

function groqProvider(apiKey: string): ChatProvider {
  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

  return {
    name: "groq",
    async stream({ system, messages, signal, allowHandoff, onText }) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: 0.4,
          max_completion_tokens: MAX_TOKENS,
          // gpt-oss is a reasoning model: keep reasoning short and out of the output
          ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low", include_reasoning: false } : {}),
          messages: [{ role: "system", content: system }, ...messages],
          ...(allowHandoff
            ? {
                tools: [
                  {
                    type: "function",
                    function: { name: HANDOFF_TOOL_NAME, description: HANDOFF_TOOL_DESCRIPTION, parameters: HANDOFF_TOOL_PARAMETERS },
                  },
                ],
                tool_choice: "auto",
              }
            : {}),
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Groq request failed with status ${res.status}: ${detail.slice(0, 500)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let toolName = "";
      let toolArgs = "";
      let gotText = false;
      let streamError = "";
      let finishReason = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const data = event.startsWith("data:") ? event.slice(5).trim() : "";
          if (!data || data === "[DONE]") continue;
          let delta: GroqDelta | undefined;
          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: GroqDelta; finish_reason?: string | null }[];
              error?: { message?: string; code?: string };
            };
            // Groq reports mid-stream failures (e.g. tool_use_failed) as an error event
            if (parsed.error) {
              streamError = `${parsed.error.code ?? "error"}: ${parsed.error.message ?? ""}`.slice(0, 300);
              continue;
            }
            const choice = parsed.choices?.[0];
            if (choice?.finish_reason) finishReason = choice.finish_reason;
            delta = choice?.delta;
          } catch {
            continue;
          }
          if (!delta) continue;
          if (delta.content) {
            gotText = true;
            onText(delta.content);
          }
          for (const call of delta.tool_calls ?? []) {
            if (call.function?.name) toolName = call.function.name;
            if (call.function?.arguments) toolArgs += call.function.arguments;
          }
        }
      }

      if (!gotText && !toolName) {
        console.error("[chat] groq returned an empty answer", { finishReason, streamError });
      }
      if (!allowHandoff || toolName !== HANDOFF_TOOL_NAME) return { empty: !gotText };
      try {
        return { handoffInput: JSON.parse(toolArgs || "{}") };
      } catch {
        // Malformed arguments still mean "hand off": let the route build a fallback
        console.error("[chat] groq returned unparseable tool arguments", toolArgs.slice(0, 300));
        return { handoffInput: {} };
      }
    },
  };
}

/**
 * Picks the provider from env: AI_PROVIDER=groq|anthropic.
 * Defaults to Groq (free tier) when its key exists, otherwise Anthropic.
 */
export function getChatProvider(): ChatProvider | null {
  const preferred = process.env.AI_PROVIDER;
  const groqKey = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (preferred === "anthropic" && anthropicKey) return anthropicProvider(anthropicKey);
  if (preferred === "groq" && groqKey) return groqProvider(groqKey);
  if (groqKey) return groqProvider(groqKey);
  if (anthropicKey) return anthropicProvider(anthropicKey);
  return null;
}
