"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "Available" status with the live local time in Armenia (Colombia). */
export function AvailabilityBadge({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(timeFormatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={cn("inline-flex items-center gap-3 rounded-full border border-border bg-bg-elevated/60 px-4 py-2 text-xs backdrop-blur", className)}>
      <span className="relative flex size-2">
        {siteConfig.available && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={cn("relative inline-flex size-2 rounded-full", siteConfig.available ? "bg-emerald-400" : "bg-amber-400")} />
      </span>
      <span>{siteConfig.available ? t("available") : t("unavailable")}</span>
      {time && (
        <span className="border-l border-border pl-3 font-mono text-fg-muted" title={t("localTime")}>
          {time} COT
        </span>
      )}
    </div>
  );
}
