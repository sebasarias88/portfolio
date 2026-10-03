"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import { EVENT_TYPES, type EventType } from "@/lib/analytics/shared";

const isEventType = (value: string | undefined): value is EventType =>
  !!value && (EVENT_TYPES as readonly string[]).includes(value);

/**
 * Cookie-less analytics: one pageview per route change, plus clicks on any
 * element marked with `data-track="<event>"` (optional `data-track-label`).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("pageview");
    if (/\/projects\/[^/]+$/.test(pathname)) {
      track("project_view", { slug: pathname.split("/").pop() ?? "" });
    }
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const type = el?.dataset.track;
      if (!el || !isEventType(type)) return;
      const label = el.dataset.trackLabel;
      track(type, label ? { label: label.slice(0, 200) } : undefined);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
