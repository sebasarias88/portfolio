import { siteConfig } from "@/config/site";

/** Builds a wa.me link with a pre-filled, URL-encoded message. */
export function buildWhatsAppUrl(message: string, phone: string = siteConfig.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
