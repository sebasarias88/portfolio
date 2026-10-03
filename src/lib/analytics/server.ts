import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

const BOT_PATTERN =
  /bot|crawler|spider|crawling|headless|lighthouse|pagespeed|preview|facebookexternalhit|slurp|bingpreview|whatsapp|telegram|discord|curl|wget|python|axios|node-fetch|go-http/i;

export function isBot(userAgent: string) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** Client IP as reported by the platform proxy (Vercel sets x-forwarded-for). */
export function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "0.0.0.0";
}

/**
 * Anonymous, cookie-less visitor id. The salt rotates daily, so the same person
 * can't be followed across days and the raw IP is never stored.
 */
export function getVisitorHash(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}:${day}:${ip}:${userAgent}`).digest("hex");
}

/** Stable per-IP key for rate limiting (not stored with events). */
export function getRateLimitKey(scope: string, ip: string) {
  const salt = process.env.ANALYTICS_SALT ?? "dev-salt";
  return `${scope}:${createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)}`;
}

export function getGeo(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country")?.slice(0, 2) || null;
  const rawCity = request.headers.get("x-vercel-ip-city");
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity).slice(0, 100);
    } catch {
      city = null;
    }
  }
  return { country, city };
}

export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /firefox|fxios/i.test(ua)
        ? "Firefox"
        : /chrome|crios/i.test(ua)
          ? "Chrome"
          : /safari/i.test(ua)
            ? "Safari"
            : "Other";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /mac os/i.test(ua)
        ? "macOS"
        : /android/i.test(ua)
          ? "Android"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os } as const;
}

/** Keeps only the host of an external referrer; drops self-referrals. */
export function getReferrerHost(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0]) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

/** Rejects cross-site POSTs (basic CSRF / abuse guard for public endpoints). */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
