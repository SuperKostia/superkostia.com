"use server";

import { headers } from "next/headers";

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

  const context = await buildContext();

  const lines: string[] = [
    "🔓 <b>Nouveau déverrouillage sur superkostia.com</b>",
    "",
    `<b>De :</b> ${escapeHtml(input.name.trim())}`,
    "",
    `<b>Pourquoi :</b>`,
    escapeHtml(input.motif.trim()),
  ];

  if (context.length > 0) {
    lines.push("", "<i>Contexte :</i>", ...context);
  }

  const text = lines.join("\n");

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

async function buildContext(): Promise<string[]> {
  const h = await headers();
  const lines: string[] = [];

  const rawCity = h.get("x-vercel-ip-city") ?? "";
  const country = h.get("x-vercel-ip-country") ?? "";
  const region = h.get("x-vercel-ip-country-region") ?? "";
  const tz = h.get("x-vercel-ip-timezone") ?? "";
  const ua = h.get("user-agent") ?? "";
  const acceptLang = h.get("accept-language") ?? "";
  const referer = h.get("referer") ?? "";

  let city = "";
  try {
    city = rawCity ? decodeURIComponent(rawCity) : "";
  } catch {
    city = rawCity;
  }

  const locationParts = [city, region, country].filter(Boolean);
  if (locationParts.length > 0) {
    lines.push(`📍 ${escapeHtml(locationParts.join(", "))}`);
  }
  if (tz) {
    const time = formatLocalTime(tz);
    lines.push(
      `🕐 ${escapeHtml(tz)}${time ? ` · <i>chez eux : ${escapeHtml(time)}</i>` : ""}`,
    );
  }
  if (ua) {
    const ctx = parseBrowserOS(ua);
    if (ctx) lines.push(`🌐 ${escapeHtml(ctx)}`);
  }
  if (acceptLang) {
    const primary = acceptLang.split(",")[0]?.trim();
    if (primary) lines.push(`🗣 ${escapeHtml(primary)}`);
  }
  if (referer) {
    lines.push(`↪ <i>depuis</i> ${escapeHtml(referer)}`);
  }

  return lines;
}

function formatLocalTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).format(new Date());
  } catch {
    return "";
  }
}

function parseBrowserOS(ua: string): string {
  let browser = "";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  let os = "";
  if (/iphone/i.test(ua)) os = "iPhone";
  else if (/ipad/i.test(ua)) os = "iPad";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/linux/i.test(ua)) os = "Linux";

  if (browser && os) return `${browser} sur ${os}`;
  if (browser) return browser;
  if (os) return os;
  return "";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
