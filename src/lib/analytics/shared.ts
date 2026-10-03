/** Event types accepted by /api/track (must match the DB check constraint). */
export const EVENT_TYPES = [
  "pageview",
  "cv_download",
  "whatsapp_click",
  "email_click",
  "project_view",
  "outbound_click",
  "quote_sent",
  "chat_started",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
