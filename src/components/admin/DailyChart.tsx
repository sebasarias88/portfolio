"use client";

import { useState } from "react";

interface DailyChartProps {
  data: { day: string; pageviews: number; visitors: number }[];
}

const HEIGHT = 220;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function formatDay(day: string) {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Daily page views as thin bars, with a per-day hover tooltip. */
export function DailyChart({ data }: DailyChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.pageviews));
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = 100 / Math.max(1, data.length);
  const barW = Math.min(slot * 0.7, 6);
  const ticks = [0, Math.round(max / 2), max];
  const current = active !== null ? data.at(active) : undefined;

  return (
    <figure className="relative">
      <figcaption className="sr-only">Vistas de página por día</figcaption>
      <svg viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none" className="h-[220px] w-full overflow-visible" role="img" aria-label="Vistas de página por día">
        {ticks.map((t) => {
          const y = PAD_TOP + plotH - (t / max) * plotH;
          return <line key={t} x1="0" x2="100" y1={y} y2={y} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />;
        })}
        {data.map((d, i) => {
          const h = (d.pageviews / max) * plotH;
          const x = i * slot + (slot - barW) / 2;
          return (
            <g key={d.day} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}>
              {/* Hit target taller and wider than the mark */}
              <rect x={i * slot} y={PAD_TOP} width={slot} height={plotH} fill="transparent" />
              <rect
                x={x}
                y={PAD_TOP + plotH - h}
                width={barW}
                height={Math.max(h, d.pageviews > 0 ? 1 : 0)}
                rx="0.6"
                fill="var(--accent)"
                opacity={active === null || active === i ? 1 : 0.45}
              />
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-3 text-[11px] text-fg-muted tabular-nums">
        <span>{max}</span>
        <span>0</span>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-fg-muted">
        <span>{data[0] ? formatDay(data[0].day) : ""}</span>
        <span>{data.at(-1) ? formatDay(data.at(-1)!.day) : ""}</span>
      </div>
      {current && (
        <div
          className="pointer-events-none absolute top-0 rounded-xl border border-border bg-bg px-3 py-2 text-xs shadow-lg"
          style={{ left: `clamp(0px, calc(${(active! + 0.5) * slot}% - 70px), calc(100% - 140px))` }}
        >
          <p className="font-medium">{formatDay(current.day)}</p>
          <p className="text-fg-muted tabular-nums">{current.pageviews} vistas · {current.visitors} visitantes</p>
        </div>
      )}
    </figure>
  );
}
