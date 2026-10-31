import { HobbiesIndex, metadataHobbies } from "@/components/pages/HobbiesIndex";

export const metadata = metadataHobbies("fr");

export default function Page() {
  return <HobbiesIndex lang="fr" />;
}
