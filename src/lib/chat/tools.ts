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

export const handoffInputSchema = z.object({
  name: z.string().max(120).optional(),
  business: z.string().max(200).optional(),
  need: z.string().min(1).max(600),
  budget: z.string().max(120).optional(),
  timeline: z.string().max(120).optional(),
  summary: z.string().min(1).max(1200),
});
