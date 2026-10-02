import type { Locale } from "@/i18n/routing";

export function formatCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Spanish visitors see COP, English visitors see USD. */
export function formatPrice(locale: Locale, cop: number, usd: number) {
  return locale === "es" ? formatCop(cop) : formatUsd(usd);
}
