import type { Metadata } from "next";
import Link from "next/link";

import { ChatPanel } from "./ChatPanel";
import { SiteLayout } from "@/lib/layout";

/** Читаем OPENROUTER_MODEL на каждый запрос, а не на этапе сборки. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Чат",
  description: "Бесплатное общение с нейросетью для работы с текстом на neironka.tech.",
  keywords: [
    "джипити чат нейросеть на русском бесплатно",
    "нейросеть бесплатно",
    "gpt chat бесплатно нейросеть на русском",
    "чат с ИИ",
    "искусственный интеллект",
    "генерация текста",
    "бесплатно",
    "neironka.tech",
  ],
};

export default function ChatPage() {
  const openRouterModel = process.env.OPENROUTER_MODEL?.trim() ?? "";

  return (
    <SiteLayout>
      <div className="chat-page">
        <Link className="chat-page__back" href="/">
          ← На главную
        </Link>
        <h1 className="chat-page__title">Нейросеть для текста</h1>
        <p className="chat-page__lead">
          Диалог с нейросетью.
          <>
            Ответы генерирует модель{" "}
            <span className="chat-page__model-id">{openRouterModel ?? "не указана"}</span>.
          </>
        </p>
        <ChatPanel />
      </div>
    </SiteLayout>
  );
}
