import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/sections/services/Faq";
import { Packages } from "@/components/sections/services/Packages";
import { Process } from "@/components/sections/services/Process";
import { QuoteCalculator } from "@/components/sections/services/QuoteCalculator";
import { ServicesCta } from "@/components/sections/services/ServicesCta";
import { ServicesHero } from "@/components/sections/services/ServicesHero";
import { Testimonials } from "@/components/sections/shared/Testimonials";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: { absolute: t("servicesTitle") },
    description: t("servicesDescription"),
    alternates: { canonical: `/${locale}/services`, languages: { es: "/es/services", en: "/en/services" } },
  };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ServicesHero />
      <Packages />
      <QuoteCalculator />
      <Process />
      <Testimonials />
      <Faq />
      <ServicesCta />
    </>
  );
}
