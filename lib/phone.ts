// Indicatifs téléphoniques par code pays ISO 3166-1 alpha-2 (les plus probables pour le flux + courants).
const CALLING_CODES: Record<string, string> = {
  FR: "33", MA: "212", BE: "32", CH: "41", ES: "34", PT: "351", IT: "39",
  DE: "49", GB: "44", IE: "353", NL: "31", LU: "352", US: "1", CA: "1",
  DZ: "213", TN: "216", SN: "221", CI: "225", CM: "237", ML: "223",
  AE: "971", QA: "974", SA: "966", EG: "20", GR: "30", RU: "7", UA: "380",
  TR: "90", BR: "55", AR: "54", MX: "52", PL: "48", RO: "40", AT: "43",
  SE: "46", NO: "47", DK: "45", FI: "358", JP: "81", CN: "86", IN: "91",
  AU: "61", NZ: "64", ZA: "27", NG: "234", GH: "233", SG: "65", LB: "961",
};

export type NormalizedPhone = {
  /** numéro sans + ni espaces, prêt pour le bridge (ex: 212627941615) */
  e164: string;
  /** true si on est confiant (indicatif présent ou déduit du pays) */
  confident: boolean;
};

/**
 * Normalise un numéro saisi (souvent sans indicatif international) en E.164 sans +.
 * Utilise le pays détecté (ISO alpha-2) pour les formats nationaux (commençant par 0).
 */
export function normalizePhone(raw: string, country?: string): NormalizedPhone {
  const cleaned = (raw || "").replace(/[^\d+]/g, "");
  const cc = country ? CALLING_CODES[country.toUpperCase()] : undefined;

  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "");
    return { e164: digits, confident: digits.length >= 8 };
  }
  if (cleaned.startsWith("00")) {
    const digits = cleaned.slice(2);
    return { e164: digits, confident: digits.length >= 8 };
  }
  if (cleaned.startsWith("0")) {
    // format national : on retire le 0 de tête et on préfixe l'indicatif du pays détecté
    const national = cleaned.replace(/^0+/, "");
    if (cc) return { e164: cc + national, confident: national.length >= 6 };
    return { e164: national, confident: false }; // pays inconnu, indicatif à vérifier
  }
  // ni 0 ni + : ambigu. Si on connaît le pays et que ça ressemble à un numéro national, on préfixe.
  if (cc && cleaned.length >= 8 && cleaned.length <= 10) {
    return { e164: cc + cleaned, confident: false };
  }
  return { e164: cleaned, confident: cleaned.length >= 10 };
}

/** Emoji drapeau à partir d'un code pays ISO alpha-2 (générique, marche pour tous les pays). */
export function countryFlag(iso?: string): string {
  if (!iso || iso.length !== 2 || !/^[A-Za-z]{2}$/.test(iso)) return "";
  const base = 0x1f1e6;
  const up = iso.toUpperCase();
  return String.fromCodePoint(
    base + (up.charCodeAt(0) - 65),
    base + (up.charCodeAt(1) - 65),
  );
}
