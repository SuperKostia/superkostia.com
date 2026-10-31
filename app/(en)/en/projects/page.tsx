import { ProjetsIndex, metadataProjets } from "@/components/pages/ProjetsIndex";

export const metadata = metadataProjets("en");

export default function Page() {
  return <ProjetsIndex lang="en" />;
}
