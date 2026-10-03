import { z } from "zod";

export const HANDOFF_TOOL_NAME = "handoff_to_whatsapp";

export const HANDOFF_TOOL_DESCRIPTION =
  "Hand the visitor off to Sebastián on WhatsApp once you understand their project (business type and what they need), or when they ask to talk to him. The summary is sent as the first WhatsApp message, written in the visitor's language and in first person from the visitor.";

/** JSON Schema shared by every provider. */
export const HANDOFF_TOOL_PARAMETERS = {
  type: "object",
  properties: {
    name: { type: "string", description: "Visitor's name, if given" },
    business: { type: "string", description: "Type of business or company" },
    need: { type: "string", description: "What they want built" },
    budget: { type: "string", description: "Approximate budget, if given" },
    timeline: { type: "string", description: "Desired date or urgency, if given" },
    summary: {
      type: "string",
      description: "2–4 sentence message from the visitor to Sebastián summarizing the project, in the visitor's language",
    },
  },
  required: ["need", "summary"],
} as const;

/**
 * Models are sloppy with optional fields (null, numbers, "", extra keys) and
 * sometimes omit `need` or `summary`. Normalize instead of rejecting, so a
 * valid hand-off is never silently dropped.
 */
const optionalText = (max: number) =>
  z.preprocess((value) => {
    if (value === null || value === undefined) return undefined;
    const text = String(value).trim();
    return text ? text.slice(0, max) : undefined;
  }, z.string().optional());

export const handoffInputSchema = z
  .object({
    name: optionalText(120),
    business: optionalText(200),
    need: optionalText(600),
    budget: optionalText(120),
    timeline: optionalText(120),
    summary: optionalText(1200),
  })
  .transform((data) => {
    const need = data.need ?? data.summary ?? data.business ?? "";
    const summary =
      data.summary ??
      [data.business && `Negocio: ${data.business}`, need && `Necesito: ${need}`, data.budget && `Presupuesto: ${data.budget}`, data.timeline && `Fecha: ${data.timeline}`]
        .filter(Boolean)
        .join(". ");
    return { ...data, need, summary };
  })
  .refine((data) => data.need.length > 0 && data.summary.length > 0, "Empty hand-off");

export type HandoffInput = z.infer<typeof handoffInputSchema>;
