"use client";

import { usePathname } from "next/navigation";
import { langueDuChemin, type Lang } from "./i18n";

/** Langue de la page courante, côté client (déduite de l'adresse). */
export function useLang(): Lang {
  return langueDuChemin(usePathname() ?? "/");
}
