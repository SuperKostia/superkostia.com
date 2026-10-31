import { Photographie, metadataPhotographie } from "@/components/pages/Photographie";

export const metadata = metadataPhotographie("fr");

export default function Page() {
  return <Photographie lang="fr" />;
}
