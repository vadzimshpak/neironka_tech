import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/site";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const MAX_MESSAGES = 40;
const MAX_CONTENT_LENGTH = 12000;

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = { role: ChatRole; content: string };

function isValidMessages(raw: unknown): raw is ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return false;
  }
  if (raw.length > MAX_MESSAGES) {
    return false;
  }
  for (const item of raw) {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const m = item as Record<string, unknown>;
    if (m.role !== "user" && m.role !== "assistant") {
      return false;
    }
    if (typeof m.content !== "string" || m.content.length > MAX_CONTENT_LENGTH) {
      return false;
    }
  }
  return true;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();

  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "Чат не настроен (OPENROUTER_API_KEY / OPENROUTER_MODEL)" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const messagesUnknown =
    typeof body === "object" && body !== null && "messages" in body
      ? (body as { messages: unknown }).messages
      : null;

  if (!isValidMessages(messagesUnknown)) {
    return NextResponse.json(
      { error: "Некорректная история сообщений" },
      { status: 400 }
    );
  }

  const system: ChatMessage = {
    role: "system",
    content:
      "Ты дружелюбный ассистент на сайте neironka.tech. Отвечай по-русски, по делу и без лишней воды, если пользователь не просит иначе.",
  };

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": getSiteUrl(),
      "X-Title": "neironka.tech",
    },
    body: JSON.stringify({
      model,
      messages: [system, ...messagesUnknown],
    }),
  });

  const rawText = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(rawText) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Некорректный ответ провайдера" },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const errMsg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: { message?: string } }).error?.message === "string"
        ? (data as { error: { message: string } }).error.message
        : "Ошибка OpenRouter";
    return NextResponse.json({ error: errMsg }, { status: 502 });
  }

  const choices = (data as { choices?: unknown }).choices;
  const first =
    Array.isArray(choices) && choices[0] && typeof choices[0] === "object"
      ? (choices[0] as { message?: { content?: unknown; role?: string } })
          .message
      : undefined;

  const content =
    first && typeof first.content === "string" ? first.content : null;

  if (content === null || content.length === 0) {
    return NextResponse.json({ error: "Пустой ответ модели" }, { status: 502 });
  }

  return NextResponse.json({
    message: { role: "assistant" as const, content },
  });
}
