import { useTranslations } from "next-intl";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function ServicesCta() {
  const t = useTranslations("Services");

  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      <div className="glow pointer-events-none absolute -bottom-40 left-1/2 size-[50rem] -translate-x-1/2 opacity-60" aria-hidden="true" />
      <div className="container-page relative text-center">
        <SplitHeading text={t("ctaTitle")} className="mx-auto max-w-4xl text-5xl leading-[0.95] font-semibold md:text-8xl" />
        <p className="mt-6 text-lg text-fg-muted">{t("ctaSubtitle")}</p>
        <div className="mt-10 flex justify-center">
          <Button external href={buildWhatsAppUrl(t("ctaMessage"))} className="px-8 py-4 text-base">
            WhatsApp <ArrowIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
