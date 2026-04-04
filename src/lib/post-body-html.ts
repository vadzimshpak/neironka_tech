import DOMPurify from "isomorphic-dompurify";

/**
 * Старый текст без тегов превращаем в HTML для редактора.
 * Уже HTML (сохранённый TipTap) возвращаем как есть.
 */
export function bodyToEditorHtml(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) {
    return "<p></p>";
  }
  if (t.startsWith("<")) {
    return raw;
  }
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const parts = t
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return "<p></p>";
  }
  return parts.map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
}

/** HTML для публикации: санитизация (контент из админки). */
export function sanitizePostBodyHtml(body: string): string {
  const t = (body ?? "").trim();
  if (!t) {
    return "";
  }
  const html = t.startsWith("<") ? body : bodyToEditorHtml(body);
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
