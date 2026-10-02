import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-[transform,background-color,color,box-shadow] duration-300 ease-out-expo active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[0_0_0_0_var(--accent-glow)] hover:shadow-[0_8px_40px_-8px_var(--accent-glow)]",
  secondary: "border border-border bg-bg-elevated/60 text-fg backdrop-blur hover:border-accent/60",
  ghost: "text-fg hover:text-accent",
};

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type InternalProps = CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">;
type ExternalProps = CommonProps & Omit<ComponentProps<"a">, "className" | "children"> & { external: true };

/** Link styled as a button. Use `external` for off-site or file links. */
export function Button(props: InternalProps | ExternalProps) {
  const { variant = "primary", className, children } = props;
  const classes = cn(base, variants[variant], className);
  const content = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

  if ("external" in props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { external, variant: _v, className: _c, children: _ch, ...rest } = props;
    return (
      <a className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, className: _c, children: _ch, ...rest } = props;
  return (
    <Link className={classes} {...rest}>
      {content}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", className)}
    >
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
