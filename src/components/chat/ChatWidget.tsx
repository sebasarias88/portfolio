"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Monogram } from "@/components/ui/Monogram";
import type { Locale } from "@/i18n/routing";
import { track } from "@/lib/analytics/client";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES, type ChatStreamChunk, type HandoffData } from "@/lib/chat/schema";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "streaming" | "error";

/** Floating AI assistant: answers about Sebastián and hands clients off to WhatsApp. */
export function ChatWidget() {
  const t = useTranslations("Chat");
  const locale = useLocale() as Locale;
  const suggestions = (useMessages().Chat as { suggestions: string[] }).suggestions;
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<HandoffData | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  const limitReached = messages.length >= MAX_MESSAGES - 1;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, handoff, error]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || status === "streaming" || content.length > MAX_MESSAGE_CHARS || limitReached) return;

    if (!startedRef.current) {
      startedRef.current = true;
      track("chat_started");
    }

    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStatus("streaming");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, messages: history, handedOff: handoff !== null }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const code = res.status === 429 ? "errorRateLimited" : res.status === 503 ? "errorUnavailable" : "errorFailed";
        throw new Error(code);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          if (!raw.trim()) continue;
          const chunk = JSON.parse(raw) as ChatStreamChunk;
          if (chunk.type !== "error") received = true;
          if (chunk.type === "text") {
            setMessages((prev) => {
              const next = [...prev];
              const last = next.at(-1);
              if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + chunk.value };
              return next;
            });
          } else if (chunk.type === "handoff") {
            setHandoff(chunk.data);
          } else if (chunk.type === "error") {
            throw new Error("errorFailed");
          }
        }
      }

      // A stream that ended without any answer is an error, never silence
      if (!received) throw new Error("errorFailed");

      // Drop an empty assistant bubble (e.g. the model only called the handoff tool)
      setMessages((prev) => (prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content ? prev.slice(0, -1) : prev));
      setStatus("idle");
    } catch (err) {
      if (controller.signal.aborted) return;
      const key = err instanceof Error && ["errorRateLimited", "errorUnavailable", "errorFailed"].includes(err.message) ? err.message : "errorFailed";
      setMessages((prev) => (prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content ? prev.slice(0, -1) : prev));
      setError(t(key as "errorFailed"));
      setStatus("error");
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const whatsappHref = buildWhatsAppUrl(handoff?.summary ?? t("whatsappFallbackMessage"));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "fixed right-4 bottom-4 z-[70] flex items-center gap-2 rounded-full border border-border bg-bg-elevated/80 py-2 pr-4 pl-2 text-sm font-medium shadow-[0_10px_40px_-10px_var(--accent-glow)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 md:right-6 md:bottom-6",
          open && "max-md:hidden",
        )}
      >
        <span className="relative grid size-8 place-items-center rounded-full bg-accent text-accent-fg">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z" strokeLinejoin="round" />
          </svg>
        </span>
        {open ? t("close") : t("open")}
      </button>

      <section
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-label={t("title")}
        hidden={!open}
        className="fixed inset-0 z-[75] flex flex-col overflow-hidden border-border bg-bg-elevated backdrop-blur-2xl md:bg-bg-elevated/95 md:inset-auto md:right-6 md:bottom-24 md:h-[600px] md:max-h-[calc(100dvh-8rem)] md:w-[400px] md:rounded-3xl md:border md:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]"
      >
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Monogram className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("title")}</p>
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              {t("subtitle")}
            </p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid size-9 place-items-center rounded-full hover:bg-fg/5">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div ref={listRef} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-5" aria-live="polite">
          <Bubble role="assistant">{t("greeting")}</Bubble>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-border px-3 py-1.5 text-left text-xs transition-colors hover:border-accent hover:text-accent">
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.content || <TypingDots />}
            </Bubble>
          ))}

          {handoff && (
            <div className="rounded-2xl border border-accent/40 bg-accent-soft p-4">
              <p className="text-sm font-semibold">{t("handoffTitle")}</p>
              <p className="mt-1 text-xs text-fg-muted">{t("handoffText")}</p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp_click"
                data-track-label="chat-handoff"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
              >
                {t("handoffCta")}
              </a>
            </div>
          )}

          {(error || limitReached) && (
            <div role="alert" className="rounded-2xl border border-border p-4 text-sm">
              <p>{error ?? t("limitReached")}</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" data-track-label="chat-fallback" className="mt-2 inline-block text-accent underline underline-offset-4">
                {t("whatsappFallback")}
              </a>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg px-3 py-2 focus-within:border-accent">
            <label htmlFor={`${panelId}-input`} className="sr-only">
              {t("placeholder")}
            </label>
            <textarea
              id={`${panelId}-input`}
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_MESSAGE_CHARS}
              disabled={limitReached}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={t("placeholder")}
              className="max-h-32 min-h-6 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-fg-muted focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || status === "streaming" || limitReached}
              aria-label={t("send")}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-opacity disabled:opacity-40"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-fg-muted">{t("disclaimer")}</p>
        </form>
      </section>
    </>
  );
}

function Bubble({ role, children }: { role: Message["role"]; children: ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          role === "user" ? "rounded-br-md bg-accent text-accent-fg" : "rounded-bl-md bg-fg/5",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="…">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-fg-muted" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </span>
  );
}
