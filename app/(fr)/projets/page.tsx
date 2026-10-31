import { ProjetsIndex, metadataProjets } from "@/components/pages/ProjetsIndex";

export const metadata = metadataProjets("fr");

export default function Page() {
  return <ProjetsIndex lang="fr" />;
}
