/**
 * Noms français + drapeaux des équipes de la Coupe du Monde 2026, depuis le
 * displayName anglais renvoyé par l'API ESPN. Partagé entre les composants qui
 * affichent des matchs (homepage, etc.). Le dashboard HTML statique garde sa
 * propre copie embarquée.
 */
export const TEAMS: Record<string, [string, string]> = {
  Mexico: ["Mexique", "🇲🇽"], "South Africa": ["Afrique du Sud", "🇿🇦"],
  "South Korea": ["Corée du Sud", "🇰🇷"], "Korea Republic": ["Corée du Sud", "🇰🇷"],
  Czechia: ["Tchéquie", "🇨🇿"], "Czech Republic": ["Tchéquie", "🇨🇿"],
  Canada: ["Canada", "🇨🇦"], "Bosnia-Herzegovina": ["Bosnie-Herzégovine", "🇧🇦"],
  "Bosnia and Herzegovina": ["Bosnie-Herzégovine", "🇧🇦"],
  "United States": ["États-Unis", "🇺🇸"], USA: ["États-Unis", "🇺🇸"],
  Paraguay: ["Paraguay", "🇵🇾"], Brazil: ["Brésil", "🇧🇷"], Morocco: ["Maroc", "🇲🇦"],
  Germany: ["Allemagne", "🇩🇪"], Curacao: ["Curaçao", "🇨🇼"], Netherlands: ["Pays-Bas", "🇳🇱"],
  Japan: ["Japon", "🇯🇵"], Qatar: ["Qatar", "🇶🇦"], Switzerland: ["Suisse", "🇨🇭"],
  Haiti: ["Haïti", "🇭🇹"], Scotland: ["Écosse", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"], Australia: ["Australie", "🇦🇺"],
  Turkiye: ["Turquie", "🇹🇷"], Turkey: ["Turquie", "🇹🇷"], "Ivory Coast": ["Côte d'Ivoire", "🇨🇮"],
  Ecuador: ["Équateur", "🇪🇨"], Sweden: ["Suède", "🇸🇪"], Tunisia: ["Tunisie", "🇹🇳"],
  Argentina: ["Argentine", "🇦🇷"], France: ["France", "🇫🇷"],
  England: ["Angleterre", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], Spain: ["Espagne", "🇪🇸"], Portugal: ["Portugal", "🇵🇹"],
  Belgium: ["Belgique", "🇧🇪"], Croatia: ["Croatie", "🇭🇷"], Uruguay: ["Uruguay", "🇺🇾"],
  Colombia: ["Colombie", "🇨🇴"], Senegal: ["Sénégal", "🇸🇳"], Ghana: ["Ghana", "🇬🇭"],
  Nigeria: ["Nigeria", "🇳🇬"], Egypt: ["Égypte", "🇪🇬"], Algeria: ["Algérie", "🇩🇿"],
  "Saudi Arabia": ["Arabie saoudite", "🇸🇦"], Iran: ["Iran", "🇮🇷"], Jordan: ["Jordanie", "🇯🇴"],
  Uzbekistan: ["Ouzbékistan", "🇺🇿"], Denmark: ["Danemark", "🇩🇰"], Norway: ["Norvège", "🇳🇴"],
  Austria: ["Autriche", "🇦🇹"], Italy: ["Italie", "🇮🇹"], Poland: ["Pologne", "🇵🇱"],
  Wales: ["Pays de Galles", "🏴󠁧󠁢󠁷󠁬󠁳󠁿"], "New Zealand": ["Nouvelle-Zélande", "🇳🇿"],
  "Cape Verde": ["Cap-Vert", "🇨🇻"], Panama: ["Panama", "🇵🇦"], "Costa Rica": ["Costa Rica", "🇨🇷"],
  Jamaica: ["Jamaïque", "🇯🇲"], Honduras: ["Honduras", "🇭🇳"], Peru: ["Pérou", "🇵🇪"],
  Chile: ["Chili", "🇨🇱"], Cameroon: ["Cameroun", "🇨🇲"], Mali: ["Mali", "🇲🇱"],
};

/** Nom français + drapeau pour une équipe ; repli sur le nom brut + ⚽ si inconnue. */
export function frTeam(name: string): [string, string] {
  return TEAMS[name] ?? [name, "⚽"];
}
