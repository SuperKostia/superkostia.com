"use server";

type NotifyInput = {
  name: string;
  motif: string;
  honeypot: string;
};

export type NotifyResult = {
  ok: boolean;
  reason?: "invalid" | "not_configured" | "network" | "bot_reject";
};

export async function notifyTelegram(
  input: NotifyInput,
): Promise<NotifyResult> {
  if (input.honeypot) return { ok: true };
  if (input.name.trim().length < 2 || input.motif.trim().length < 5) {
    return { ok: false, reason: "invalid" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[contact] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant");
    return { ok: false, reason: "not_configured" };
  }

  const text = [
    "🔓 <b>Nouveau déverrouillage sur superkostia.com</b>",
    "",
    `<b>De :</b> ${escapeHtml(input.name.trim())}`,
    "",
    `<b>Pourquoi :</b>`,
    escapeHtml(input.motif.trim()),
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[contact] Telegram API error", res.status, body);
      return { ok: false, reason: "bot_reject" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] Telegram fetch error", err);
    return { ok: false, reason: "network" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
