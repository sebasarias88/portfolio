import { cn } from "@/lib/utils";
import { SplitHeading } from "./SplitHeading";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, className, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 md:mb-16", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      <p className="mb-4 font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <SplitHeading text={title} className="text-4xl leading-[1.05] font-semibold md:text-6xl" />
    </div>
  );
}
