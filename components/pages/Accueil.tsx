import { Hero } from "@/components/home/Hero";
import { ProjetsLogos } from "@/components/home/ProjetsLogos";
import { AdlerNotification } from "@/components/home/AdlerNotification";
import { AdlerSeance } from "@/components/home/AdlerSeance";
import { Chiffres } from "@/components/home/Chiffres";
import { Portes } from "@/components/home/Portes";
import { Appel } from "@/components/home/Appel";
import type { Lang } from "@/lib/i18n";

export function Accueil({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col">
      <Hero lang={lang} />
      <ProjetsLogos lang={lang} />
      <AdlerSeance />
      <Chiffres lang={lang} />
      <Portes lang={lang} />
      <Appel lang={lang} />
      <AdlerNotification />
    </div>
  );
}
