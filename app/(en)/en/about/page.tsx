import { APropos, metadataAPropos } from "@/components/pages/APropos";

export const metadata = metadataAPropos("en");

export default function Page() {
  return <APropos lang="en" />;
}
