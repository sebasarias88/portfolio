import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp, getRateLimitKey, getVisitorHash, isBot, isSameOrigin } from "@/lib/analytics/server";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { getChatProvider } from "@/lib/chat/providers";
import { chatRequestSchema, type ChatStreamChunk } from "@/lib/chat/schema";
import { handoffInputSchema } from "@/lib/chat/tools";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 30;

const MAX_BODY_BYTES = 16_384;

/** Abuse and cost guards (per IP and global per day). */
const LIMITS = {
  perIpHour: 20,
  perIpDay: 60,
  globalDay: 300,
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

  const provider = getChatProvider();
  const supabase = createAdminClient();
  if (!provider || !supabase) return errorResponse("unavailable", 503);

  const ip = getClientIp(request);
  const checks = await Promise.all([
    supabase.rpc("check_rate_limit", { p_key: getRateLimitKey("chat-h", ip), p_limit: LIMITS.perIpHour, p_window_seconds: 3_600 }),
    supabase.rpc("check_rate_limit", { p_key: getRateLimitKey("chat-d", ip), p_limit: LIMITS.perIpDay, p_window_seconds: 86_400 }),
    supabase.rpc("check_rate_limit", { p_key: "chat:global", p_limit: LIMITS.globalDay, p_window_seconds: 86_400 }),
  ]);
  if (checks.some(({ data }) => data !== true)) return errorResponse("rate_limited", 429);

  const visitorHash = getVisitorHash(ip, userAgent);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const { handoffInput } = await provider.stream({
          system: buildSystemPrompt(),
          messages: body.messages,
          signal: request.signal,
          onText: (delta) => controller.enqueue(line({ type: "text", value: delta })),
        });

        const parsed = handoffInputSchema.safeParse(handoffInput);
        if (handoffInput !== undefined && parsed.success) {
          const data = parsed.data;
          const { error } = await supabase.from("leads").insert({
            source: "chat",
            locale: body.locale,
            name: data.name ?? null,
            message: data.summary,
            details: { business: data.business, need: data.need, budget: data.budget, timeline: data.timeline, provider: provider.name },
            visitor_hash: visitorHash,
          });
          if (error) console.error("[chat] lead insert failed", error.message);
          controller.enqueue(line({ type: "handoff", data }));
        }
      } catch (error) {
        if (!request.signal.aborted) {
          console.error(`[chat] ${provider.name} call failed`, error instanceof Error ? error.message : error);
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
