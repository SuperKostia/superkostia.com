import { Photographie, metadataPhotographie } from "@/components/pages/Photographie";

export const metadata = metadataPhotographie("en");

export default function Page() {
  return <Photographie lang="en" />;
}
