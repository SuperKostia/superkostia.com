import { APropos, metadataAPropos } from "@/components/pages/APropos";

export const metadata = metadataAPropos("fr");

export default function Page() {
  return <APropos lang="fr" />;
}
