import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const tc = useTranslations("Common");

  return (
    <section className="container-page flex min-h-[80svh] flex-col items-start justify-center pt-24">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-7xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-fg-muted">{t("description")}</p>
      <div className="mt-8">
        <Button href="/">{tc("backHome")}</Button>
      </div>
    </section>
  );
}
