import { z } from "zod";

export const MAX_MESSAGES = 16;
export const MAX_MESSAGE_CHARS = 800;

export const chatRequestSchema = z.object({
  locale: z.enum(["es", "en"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS * 3),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES)
    .refine((m) => m.at(-1)?.role === "user", "Last message must be from the user")
    .refine((m) => m.filter((x) => x.role === "user").every((x) => x.content.length <= MAX_MESSAGE_CHARS), "Message too long"),
  /** True once this conversation was already handed off to WhatsApp. */
  handedOff: z.boolean().optional(),
  /** Honeypot */
  website: z.string().max(0).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface HandoffData {
  name?: string;
  business?: string;
  need: string;
  budget?: string;
  timeline?: string;
  summary: string;
}

/** Lines streamed from /api/chat (NDJSON). */
export type ChatStreamChunk =
  | { type: "text"; value: string }
  | { type: "handoff"; data: HandoffData }
  | { type: "error"; code: "rate_limited" | "unavailable" | "failed" };
