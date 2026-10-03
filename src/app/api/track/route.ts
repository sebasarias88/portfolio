import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { EVENT_TYPES } from "@/lib/analytics/shared";
import {
  getClientIp,
  getGeo,
  getRateLimitKey,
  getReferrerHost,
  getVisitorHash,
  isBot,
  isSameOrigin,
  parseUserAgent,
} from "@/lib/analytics/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 2_048;

const schema = z.object({
  type: z.enum(EVENT_TYPES),
  path: z.string().startsWith("/").max(300),
  locale: z.enum(["es", "en"]).optional(),
  referrer: z.string().max(500).optional(),
  ref: z
    .string()
    .max(60)
    .regex(/^[a-z0-9_-]+$/i)
    .optional(),
  meta: z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean()])).optional(),
});

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return noContent();

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(JSON.parse(raw));
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return noContent(); // Analytics not configured (e.g. local dev)

  const ip = getClientIp(request);
  // 60 events per minute per IP is far above human behavior
  const { data: allowed } = await supabase.rpc("check_rate_limit", {
    p_key: getRateLimitKey("track", ip),
    p_limit: 60,
    p_window_seconds: 60,
  });
  if (!allowed) return new NextResponse(null, { status: 429 });

  const { country, city } = getGeo(request);
  const ua = parseUserAgent(userAgent);

  const { error } = await supabase.from("events").insert({
    type: body.type,
    path: body.path,
    locale: body.locale ?? null,
    referrer_host: getReferrerHost(body.referrer, request.headers.get("host")),
    ref: body.ref?.toLowerCase() ?? null,
    visitor_hash: getVisitorHash(ip, userAgent),
    country,
    city,
    device: ua.device,
    browser: ua.browser,
    os: ua.os,
    meta: body.meta ?? null,
  });

  if (error) console.error("[track] insert failed", error.message);
  return noContent();
}
