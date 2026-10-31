import { EcritsIndex, metadataEcrits } from "@/components/pages/EcritsIndex";

export const metadata = metadataEcrits("fr");

export default function Page() {
  return <EcritsIndex lang="fr" />;
}
