import { Voyages, metadataVoyages } from "@/components/pages/Voyages";

export const metadata = metadataVoyages("en");

export default function Page() {
  return <Voyages lang="en" />;
}
