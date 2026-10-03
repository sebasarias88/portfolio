import type { CountItem } from "./types";

interface BarListProps {
  title: string;
  items: CountItem[];
  emptyLabel?: string;
}

/** Ranked list with proportional bars (single hue, values in text ink). */
export function BarList({ title, items, emptyLabel = "Sin datos todavía" }: BarListProps) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-5">
      <h2 className="mb-4 text-sm font-medium text-fg-muted">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.label} className="relative flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-sm">
              <span className="absolute inset-y-0 left-0 rounded-lg bg-accent-soft" style={{ width: `${(item.count / max) * 100}%` }} aria-hidden="true" />
              <span className="relative truncate">{item.label}</span>
              <span className="relative tabular-nums text-fg-muted">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
