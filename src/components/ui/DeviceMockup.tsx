"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DeviceMockupProps {
  video?: string;
  poster?: string;
  accent: string;
  label: string;
  className?: string;
}

/**
 * Browser-window mockup that plays a project screen recording.
 * Falls back to a branded gradient while real videos are pending.
 * Phase 3 replaces this with a 3D laptop/phone (React Three Fiber).
 */
export function DeviceMockup({ video, poster, accent, label, className }: DeviceMockupProps) {
  const [failed, setFailed] = useState(!video);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[0_40px_120px_-40px_rgb(0_0_0/0.5)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-fg/15" />
        <span className="size-2.5 rounded-full bg-fg/15" />
        <span className="size-2.5 rounded-full bg-fg/15" />
      </div>
      <div className="relative aspect-[16/10]">
        {!failed && video ? (
          <video
            className="absolute inset-0 size-full object-cover"
            src={video}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={label}
            onError={() => setFailed(true)}
            // Catch errors that happened before hydration attached onError
            ref={(el) => {
              if (el?.error) setFailed(true);
            }}
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: `radial-gradient(120% 90% at 30% 20%, ${accent}55, transparent 60%), radial-gradient(90% 80% at 80% 90%, ${accent}33, transparent 60%)` }}
          >
            <span className="font-display text-2xl font-semibold tracking-tight opacity-80 md:text-4xl">{label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
