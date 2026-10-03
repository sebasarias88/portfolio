import type { NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp, getRateLimitKey, getVisitorHash, isBot, isSameOrigin } from "@/lib/analytics/server";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { getChatProvider } from "@/lib/chat/providers";
import { chatRequestSchema, type ChatStreamChunk } from "@/lib/chat/schema";
import { handoffInputSchema, type HandoffInput } from "@/lib/chat/tools";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 30;

const MAX_BODY_BYTES = 16_384;

/** Abuse and cost guards (per IP and global per day). */
const LIMITS = {
  perIpHour: 20,
  perIpDay: 60,
  globalDay: 300,
};

const HANDOFF_TEXT = {
  es: "¡Perfecto! Ya tengo lo necesario. Toca el botón para seguir con Sebastián por WhatsApp.",
  en: "Perfect, I have what I need. Tap the button to continue with Sebastián on WhatsApp.",
} as const;

/** Used when the model says nothing after the visitor was already handed off. */
const AFTER_HANDOFF_TEXT = {
  es: "¡Con gusto! Sebastián te responderá pronto por WhatsApp; el botón de arriba sigue disponible.",
  en: "You're welcome! Sebastián will reply soon on WhatsApp; the button above is still there.",
} as const;

/** Builds a hand-off from the visitor's own messages when the model gives us nothing usable. */
function fallbackHandoff(messages: { role: "user" | "assistant"; content: string }[], locale: "es" | "en"): HandoffInput {
  const fromVisitor = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content.trim())
    .join(" · ")
    .slice(0, 1000);
  const intro = locale === "es" ? "Hola Sebastián, vengo del chat de tu portafolio" : "Hi Sebastián, I'm coming from your portfolio chat";
  return { need: fromVisitor || intro, summary: fromVisitor ? `${intro}: ${fromVisitor}` : `${intro}.` };
}

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
      let streamedText = "";
      try {
        const handedOff = body.handedOff === true;
        const { handoffInput } = await provider.stream({
          system: buildSystemPrompt({ handedOff }),
          messages: body.messages,
          signal: request.signal,
          allowHandoff: !handedOff,
          onText: (delta) => {
            streamedText += delta;
            controller.enqueue(line({ type: "text", value: delta }));
          },
        });

        // Already handed off: just talk, never create a second lead or card
        if (handedOff) {
          if (!streamedText.trim()) controller.enqueue(line({ type: "text", value: AFTER_HANDOFF_TEXT[body.locale] }));
          return;
        }

        const wantsHandoff = handoffInput !== undefined;
        const parsed = handoffInputSchema.safeParse(handoffInput ?? {});
        if (wantsHandoff && !parsed.success) {
          console.error("[chat] hand-off input normalized with fallback", JSON.stringify(handoffInput).slice(0, 300));
        }

        // Never leave the visitor in silence: a hand-off without usable fields, or an
        // empty answer, falls back to a summary built from what the visitor wrote.
        const data =
          parsed.success && wantsHandoff
            ? parsed.data
            : wantsHandoff || !streamedText.trim()
              ? fallbackHandoff(body.messages, body.locale)
              : null;

        if (data) {
          if (!streamedText.trim()) {
            controller.enqueue(line({ type: "text", value: HANDOFF_TEXT[body.locale] }));
          }
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
