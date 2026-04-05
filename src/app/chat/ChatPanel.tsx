"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type UiMessage = { role: ChatRole; content: string };

export function ChatPanel() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "sending") {
      return;
    }

    const userMsg: UiMessage = { role: "user", content: text };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput("");
    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextThread.map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: { role: string; content: string };
      };

      if (!res.ok) {
        setStatus("error");
        setErrorText(payload.error ?? "Не удалось получить ответ");
        setMessages(messages);
        return;
      }

      if (
        payload.message?.role === "assistant" &&
        typeof payload.message.content === "string"
      ) {
        setMessages([
          ...nextThread,
          { role: "assistant", content: payload.message.content },
        ]);
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorText("Некорректный ответ сервера");
        setMessages(messages);
      }
    } catch {
      setStatus("error");
      setErrorText("Сеть недоступна");
      setMessages(messages);
    }

    textareaRef.current?.focus();
  }

  return (
    <div className="chat-panel">
      <div
        className="chat-panel__thread"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={status === "sending" ? true : undefined}
        aria-label="Диалог с нейросетью"
      >
        {messages.length === 0 && status !== "sending" ? (
          <p className="chat-panel__empty">
            Напишите сообщение — ответит модель нейросети.
          </p>
        ) : (
          <ul className="chat-panel__list">
            {messages.map((m, i) => (
              <li
                key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
                className={
                  m.role === "user"
                    ? "chat-panel__msg chat-panel__msg--user"
                    : "chat-panel__msg chat-panel__msg--assistant"
                }
              >
                <span className="chat-panel__msg-label">
                  {m.role === "user" ? "Вы" : "ИИ"}
                </span>
                <div className="chat-panel__msg-body">{m.content}</div>
              </li>
            ))}
            {status === "sending" ? (
              <li
                className="chat-panel__msg chat-panel__msg--assistant chat-panel__msg--thinking"
                aria-live="polite"
              >
                <span className="chat-panel__msg-label">ИИ</span>
                <div className="chat-panel__msg-body chat-panel__thinking">
                  думаю
                  <span className="chat-panel__ellipsis" aria-hidden="true">
                    <span className="chat-panel__ellipsis-dot">.</span>
                    <span className="chat-panel__ellipsis-dot">.</span>
                    <span className="chat-panel__ellipsis-dot">.</span>
                  </span>
                </div>
              </li>
            ) : null}
          </ul>
        )}
        <div ref={listEndRef} />
      </div>

      {status === "error" && errorText ? (
        <p className="chat-panel__error" role="alert">
          {errorText}
        </p>
      ) : null}

      <form className="chat-panel__form" onSubmit={onSubmit}>
        <label className="chat-panel__label" htmlFor="chat-panel-input">
          Сообщение
        </label>
        <textarea
          id="chat-panel-input"
          ref={textareaRef}
          className="chat-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите текст…"
          rows={3}
          disabled={status === "sending"}
          maxLength={8000}
        />
        <button
          className="chat-panel__submit"
          type="submit"
          disabled={status === "sending" || !input.trim()}
        >
          {status === "sending" ? "Отправка…" : "Отправить"}
        </button>
      </form>
    </div>
  );
}
