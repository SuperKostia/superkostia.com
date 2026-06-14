import { NextResponse } from "next/server";

import { sendTelegram, escapeHtml, buildRequestContext } from "@/lib/telegram";

type JoinBody = {
  prenom?: unknown;
  whatsapp?: unknown;
  honeypot?: unknown;
};

/** Demande d'ajout au flux de récaps Coupe du Monde (depuis le dashboard). Notifie Constantin sur Telegram. */
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

  const digits = whatsapp.replace(/[^0-9]/g, "");
  if (prenom.length < 2 || digits.length < 8) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const context = await buildRequestContext();

  const lines: string[] = [
    "📲 <b>Nouvelle demande pour le flux Coupe du Monde</b>",
    "",
    `<b>Prénom :</b> ${escapeHtml(prenom)}`,
    `<b>WhatsApp :</b> ${escapeHtml(whatsapp)}`,
  ];
  if (context.length > 0) {
    lines.push("", "<i>Contexte :</i>", ...context);
  }
  lines.push(
    "",
    "<i>Pour l'ajouter : numéro dans RECIPIENTS (serveur) + reseed, prénom dans RECIPIENTS_LABEL (dashboard).</i>",
  );

  const result = await sendTelegram(lines.join("\n"));
  return NextResponse.json(
    { ok: result.ok, reason: result.reason },
    { status: result.ok ? 200 : 502 },
  );
}
