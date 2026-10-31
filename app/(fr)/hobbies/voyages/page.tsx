import { Voyages, metadataVoyages } from "@/components/pages/Voyages";

export const metadata = metadataVoyages("fr");

export default function Page() {
  return <Voyages lang="fr" />;
}
