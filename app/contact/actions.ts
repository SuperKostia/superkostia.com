"use server";

import { sendTelegram, escapeHtml, buildRequestContext } from "@/lib/telegram";

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

  const context = await buildRequestContext();

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

  return sendTelegram(lines.join("\n"));
}
