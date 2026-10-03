import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  previous: number;
}

/** Headline number with change vs. the previous period of equal length. */
export function KpiCard({ label, value, previous }: KpiCardProps) {
  const delta = previous === 0 ? (value > 0 ? 100 : 0) : Math.round(((value - previous) / previous) * 100);
  const up = delta >= 0;

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums">{value.toLocaleString("es-CO")}</p>
      <p className={cn("mt-1 text-xs tabular-nums", up ? "text-emerald-400" : "text-rose-400")}>
        <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(delta)}% <span className="text-fg-muted">vs. periodo anterior</span>
      </p>
    </div>
  );
}
