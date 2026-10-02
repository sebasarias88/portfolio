import { useTranslations } from "next-intl";
import { Monogram } from "@/components/ui/Monogram";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Monogram className="size-8" />
          <div className="text-sm">
            <p className="font-medium">{siteConfig.name}</p>
            <p className="text-fg-muted">{t("built")}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-6 text-sm text-fg-muted">
          <li><Link href="/" className="hover:text-fg">{nav("portfolio")}</Link></li>
          <li><Link href="/services" className="hover:text-fg">{nav("services")}</Link></li>
          <li><a href={siteConfig.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-fg">GitHub</a></li>
          <li><a href={siteConfig.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-fg">LinkedIn</a></li>
        </ul>
        <p className="text-xs text-fg-muted">© {year} {siteConfig.name}. {t("rights")}</p>
      </div>
    </footer>
  );
}
