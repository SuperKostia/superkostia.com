import type { ReactNode } from "react";
import { RootShell, metadataRacine } from "@/components/layout/RootShell";

export const metadata = metadataRacine("fr");

export default function Layout({ children }: { children: ReactNode }) {
  return <RootShell lang="fr">{children}</RootShell>;
}
