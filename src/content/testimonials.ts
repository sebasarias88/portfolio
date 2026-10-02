import type { Testimonial } from "@/types/content";

/**
 * Client testimonials.
 * TODO(real-data): replace each placeholder with the client's real, approved words
 * and remove `placeholder: true`. Placeholders are hidden in production builds.
 */
export const testimonials: Testimonial[] = [
  {
    quote: {
      es: "Montó nuestro catálogo completo con todos los productos y fotos. Ahora los clientes ven todo desde el celular y nos escriben directo por WhatsApp.",
      en: "He built our full catalog with every product and photo. Customers now browse from their phones and message us straight on WhatsApp.",
    },
    author: "Cliente — Lila Store",
    role: { es: "Tienda de cosméticos", en: "Cosmetics store" },
    project: "lila-store",
    placeholder: true,
  },
  {
    quote: {
      es: "Entendió lo que queríamos mostrar de nuestros servicios de seguridad y el resultado quedó mejor de lo esperado.",
      en: "He understood how we wanted to present our security services, and the result exceeded our expectations.",
    },
    author: "Cliente — INNOVA Seguridad",
    role: { es: "Seguridad y sistemas", en: "Security systems" },
    project: "innova-seguridad",
    placeholder: true,
  },
  {
    quote: {
      es: "Antes hacíamos el cierre del día en papel. Ahora el conteo, la caja y los gastos están en un solo lugar.",
      en: "We used to close the day on paper. Now counts, cash and expenses live in one place.",
    },
    author: "Cliente — Cholao Oscar",
    role: { es: "Negocio de cholados", en: "Dessert shop" },
    project: "cholao-oscar",
    placeholder: true,
  },
];

/** Testimonials safe to render in the current environment. */
export function getVisibleTestimonials() {
  const isProduction = process.env.NODE_ENV === "production";
  return testimonials.filter((t) => !t.placeholder || !isProduction);
}
