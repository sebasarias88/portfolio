import { useLocale, useTranslations } from "next-intl";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Contact() {
  const t = useTranslations("Contact");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;

  const links = [
    { label: "LinkedIn", href: siteConfig.socials.linkedin },
    { label: "GitHub", href: siteConfig.socials.github },
    { label: t("whatsapp"), href: buildWhatsAppUrl(t("whatsappMessage")) },
  ];

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24 md:py-40">
      <div className="glow pointer-events-none absolute -bottom-40 left-1/2 size-[50rem] -translate-x-1/2 opacity-60" aria-hidden="true" />
      <div className="container-page relative">
        <p className="mb-4 font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("eyebrow")}</p>
        <SplitHeading text={t("title")} className="max-w-5xl text-5xl leading-[0.95] font-semibold md:text-8xl" />
        <p className="mt-6 max-w-xl text-lg text-fg-muted">{t("subtitle")}</p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Magnetic>
            <Button external href={`mailto:${siteConfig.email}`} className="px-8 py-4 text-base">
              {t("email")} <ArrowIcon />
            </Button>
          </Magnetic>
          <Button external href={siteConfig.resume[locale]} variant="secondary" download className="px-8 py-4 text-base">
            {tc("downloadCv")}
          </Button>
        </div>

        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-8">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-lg hover:text-accent">
                {l.label} <ArrowIcon />
              </a>
            </li>
          ))}
          <li className="ml-auto self-center font-mono text-sm text-fg-muted">{siteConfig.email}</li>
        </ul>
      </div>
    </section>
  );
}
