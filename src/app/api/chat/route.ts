import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp, getRateLimitKey, getVisitorHash, isBot, isSameOrigin } from "@/lib/analytics/server";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { chatRequestSchema, type ChatStreamChunk } from "@/lib/chat/schema";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 30;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const MAX_BODY_BYTES = 16_384;

/** Abuse and cost guards (per IP and global per day). */
const LIMITS = {
  perIpHour: 20,
  perIpDay: 60,
  globalDay: 300,
};

const handoffInput = z.object({
  name: z.string().max(120).optional(),
  business: z.string().max(200).optional(),
  need: z.string().min(1).max(600),
  budget: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  summary: z.string().min(1).max(1200),
});

const handoffTool: Anthropic.Tool = {
  name: "handoff_to_whatsapp",
  description:
    "Hand the visitor off to Sebastián on WhatsApp once you understand their project (business type and what they need), or when they ask to talk to him. The summary is sent as the first WhatsApp message, written in the visitor's language and in first person from the visitor.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Visitor's name, if given" },
      business: { type: "string", description: "Type of business or company" },
      need: { type: "string", description: "What they want built" },
      budget: { type: "string", description: "Approximate budget, if given" },
      timeline: { type: "string", description: "Desired date or urgency, if given" },
      summary: {
        type: "string",
        description: "2–4 sentence message from the visitor to Sebastián summarizing the project, in the visitor's language",
      },
    },
    required: ["need", "summary"],
  },
};

const encoder = new TextEncoder();
const line = (chunk: ChatStreamChunk) => encoder.encode(`${JSON.stringify(chunk)}\n`);
const errorResponse = (code: Extract<ChatStreamChunk, { type: "error" }>["code"], status: number) =>
  new Response(JSON.stringify({ type: "error", code }), { status, headers: { "content-type": "application/json" } });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return new Response(null, { status: 403 });

  let body: z.infer<typeof chatRequestSchema>;
  try {
    body = chatRequestSchema.parse(JSON.parse(raw));
  } catch {
    return new Response(null, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const supabase = createAdminClient();
  if (!apiKey || !supabase) return errorResponse("unavailable", 503);

  const ip = getClientIp(request);
  const checks = await Promise.all([
    supabase.rpc("check_rate_limit", { p_key: getRateLimitKey("chat-h", ip), p_limit: LIMITS.perIpHour, p_window_seconds: 3_600 }),
    supabase.rpc("check_rate_limit", { p_key: getRateLimitKey("chat-d", ip), p_limit: LIMITS.perIpDay, p_window_seconds: 86_400 }),
    supabase.rpc("check_rate_limit", { p_key: "chat:global", p_limit: LIMITS.globalDay, p_window_seconds: 86_400 }),
  ]);
  if (checks.some(({ data }) => data !== true)) return errorResponse("rate_limited", 429);

  const anthropic = new Anthropic({ apiKey });
  const visitorHash = getVisitorHash(ip, userAgent);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const messageStream = anthropic.messages.stream(
        {
          model: MODEL,
          max_tokens: 600,
          temperature: 0.4,
          system: [{ type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } }],
          tools: [handoffTool],
          messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        },
        { signal: request.signal },
      );

      messageStream.on("text", (delta) => controller.enqueue(line({ type: "text", value: delta })));

      try {
        const final = await messageStream.finalMessage();
        const toolUse = final.content.find((block) => block.type === "tool_use" && block.name === handoffTool.name);

        if (toolUse && toolUse.type === "tool_use") {
          const parsed = handoffInput.safeParse(toolUse.input);
          if (parsed.success) {
            const data = parsed.data;
            const { error } = await supabase.from("leads").insert({
              source: "chat",
              locale: body.locale,
              name: data.name ?? null,
              message: data.summary,
              details: { business: data.business, need: data.need, budget: data.budget, timeline: data.timeline },
              visitor_hash: visitorHash,
            });
            if (error) console.error("[chat] lead insert failed", error.message);
            controller.enqueue(line({ type: "handoff", data }));
          }
        }
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("[chat] model call failed", error instanceof Error ? error.message : error);
          controller.enqueue(line({ type: "error", code: "failed" }));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
