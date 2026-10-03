import type { EventType } from "./shared";

const REF_KEY = "sa-ref";

/** Remembers the ?ref= campaign tag (linkedin, cv, upwork…) for the session. */
export function captureRef() {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[a-z0-9_-]{1,60}$/i.test(ref)) sessionStorage.setItem(REF_KEY, ref.toLowerCase());
    return sessionStorage.getItem(REF_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function trackingDisabled() {
  return navigator.doNotTrack === "1" || process.env.NODE_ENV !== "production";
}

/** Fire-and-forget analytics event. Never throws, never blocks navigation. */
export function track(type: EventType, meta?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || trackingDisabled()) return;
  const locale = window.location.pathname.split("/")[1];
  const body = JSON.stringify({
    type,
    path: window.location.pathname,
    locale: locale === "es" || locale === "en" ? locale : undefined,
    referrer: document.referrer || undefined,
    ref: captureRef(),
    meta,
  });
  try {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
  } catch {
    /* ignore */
  }
}
