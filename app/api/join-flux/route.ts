import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { sendTelegram, escapeHtml, buildRequestContext } from "@/lib/telegram";
import { normalizePhone, countryFlag } from "@/lib/phone";

type JoinBody = {
  prenom?: unknown;
  whatsapp?: unknown;
  honeypot?: unknown;
};

/** Demande d'ajout au flux des récaps Coupe du Monde. Notifie Constantin sur Telegram avec boutons d'action. */
export async function POST(req: Request) {
  let body: JoinBody;
  try {
    body = (await req.json()) as JoinBody;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const prenom = typeof body.prenom === "string" ? body.prenom.trim() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const honeypot = typeof body.honeypot === "string" ? body.honeypot : "";

  // Pot de miel : un bot le remplit, on fait semblant d'accepter sans rien envoyer.
  if (honeypot) return NextResponse.json({ ok: true });

  const h = await headers();
  const country = (h.get("x-vercel-ip-country") || "").toUpperCase();
  const norm = normalizePhone(whatsapp, country);
  const flag = countryFlag(country);

  if (prenom.length < 2 || norm.e164.length < 8) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const context = await buildRequestContext();

  const lines: string[] = [
    "📲 <b>Nouvelle demande pour le flux Coupe du Monde</b>",
    "",
    `<b>Prénom :</b> ${escapeHtml(prenom)}`,
    `<b>Numéro saisi :</b> ${escapeHtml(whatsapp)}`,
    `<b>➕ À ajouter :</b> <code>${escapeHtml(norm.e164)}</code> ${flag}${norm.confident ? "" : "  ⚠️ <i>indicatif déduit, à vérifier</i>"}`,
  ];
  if (context.length > 0) {
    lines.push("", "<i>Contexte :</i>", ...context);
  }
  lines.push(
    "",
    "<i>✅ pour ajouter et envoyer le welcome, ou réponds à ce message avec le bon numéro (+ une note) pour corriger.</i>",
  );

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "✅ Ajouter au flux", callback_data: `approve:${norm.e164}:${country}` },
        { text: "✖️ Ignorer", callback_data: "reject" },
      ],
    ],
  };

  const result = await sendTelegram(lines.join("\n"), replyMarkup);
  return NextResponse.json(
    { ok: result.ok, reason: result.reason },
    { status: result.ok ? 200 : 502 },
  );
}
