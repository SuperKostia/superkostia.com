import { EcritsIndex, metadataEcrits } from "@/components/pages/EcritsIndex";

export const metadata = metadataEcrits("en");

export default function Page() {
  return <EcritsIndex lang="en" />;
}
