"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const t = useTranslations("Locale");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    startTransition(() => {
      // @ts-expect-error -- params always match the current pathname
      router.replace({ pathname, params }, { locale: next, scroll: false });
    });
  };

  return (
    <div role="group" aria-label={t("switch")} className={cn("flex rounded-full border border-border p-1 text-xs font-medium", isPending && "opacity-60")}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          title={t(l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            l === locale ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
