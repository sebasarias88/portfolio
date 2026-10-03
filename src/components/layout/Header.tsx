"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/ui/Monogram";
import { siteConfig } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Menu is open only for the path it was opened on, so navigating closes it
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(open) : value;
    setOpenPath(next ? pathname : null);
  };
  const isServices = pathname.startsWith("/services");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = isServices
    ? [
        { href: "/services#packages", label: t("packages") },
        { href: "/services#quote", label: t("quote") },
        { href: "/services#faq", label: t("faq") },
        { href: "/", label: t("portfolio") },
      ]
    : [
        { href: "/#work", label: t("work") },
        { href: "/#experience", label: t("experience") },
        { href: "/#about", label: t("about") },
        { href: "/services", label: t("services") },
      ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open ? "border-b border-border bg-bg/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/" className="flex items-center gap-3 font-medium" aria-label={siteConfig.name}>
          <Monogram className="size-9 text-fg" />
          <span className="hidden text-sm sm:inline">{siteConfig.name}</span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-fg-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <a
            href={siteConfig.resume[locale]}
            download
            data-track="cv_download"
            data-track-label="header"
            className="hidden rounded-full bg-fg px-4 py-2.5 text-xs font-medium text-bg transition-opacity hover:opacity-85 lg:inline-flex"
          >
            {tc("downloadCv")}
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-border md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span className={cn("absolute left-0 h-px w-4 bg-current transition-transform", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-px w-4 bg-current transition-transform", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!open} className="container-page pb-8 md:hidden">
        <ul className="flex flex-col gap-1 font-display text-3xl">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block py-2" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
