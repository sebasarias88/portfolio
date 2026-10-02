import { cn } from "@/lib/utils";

interface MonogramProps {
  className?: string;
  /** Adds stroke-dash attributes so the preloader can "draw" it */
  drawable?: boolean;
}

/** "SA" monogram — placeholder mark until the final logo is designed. */
export function Monogram({ className, drawable = false }: MonogramProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={cn("size-8", className)}>
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        stroke="currentColor"
        strokeWidth="2.5"
        data-draw={drawable || undefined}
        pathLength={1}
      />
      <path
        d="M27 22c-1.6-2-4-3-6.6-3-3.7 0-6.4 2.1-6.4 5.3 0 7.4 13.6 4.5 13.6 12.2 0 3.4-3 5.5-7 5.5-3 0-5.6-1.2-7.2-3.4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        data-draw={drawable || undefined}
        pathLength={1}
      />
      <path
        d="M32 42 41 20l9 22M35.2 34.5h11.6"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        data-draw={drawable || undefined}
        pathLength={1}
      />
    </svg>
  );
}
