import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getClientIp, getRateLimitKey, getVisitorHash, isBot, isSameOrigin } from "@/lib/analytics/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  locale: z.enum(["es", "en"]),
  type: z.string().max(40),
  addons: z.array(z.string().max(40)).max(12),
  estimate: z.string().max(80),
  /** Honeypot: real users never fill this hidden field */
  website: z.string().max(0).optional(),
});

/** Stores an estimator submission as a lead before the visitor jumps to WhatsApp. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });

  const raw = await request.text();
  if (raw.length > 2_048) return new NextResponse(null, { status: 413 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return new NextResponse(null, { status: 204 });

  const parsed = schema.safeParse((() => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })());
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const supabase = createAdminClient();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const ip = getClientIp(request);
  // Max 5 quotes per IP per hour
  const { data: allowed } = await supabase.rpc("check_rate_limit", {
    p_key: getRateLimitKey("quote", ip),
    p_limit: 5,
    p_window_seconds: 3_600,
  });
  if (!allowed) return new NextResponse(null, { status: 429 });

  const { type, addons, estimate, locale } = parsed.data;
  const { error } = await supabase.from("leads").insert({
    source: "quote",
    locale,
    details: { type, addons, estimate },
    visitor_hash: getVisitorHash(ip, userAgent),
  });

  if (error) console.error("[quote] insert failed", error.message);
  return new NextResponse(null, { status: 204 });
}
