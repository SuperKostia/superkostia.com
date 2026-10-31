import { HobbiesIndex, metadataHobbies } from "@/components/pages/HobbiesIndex";

export const metadata = metadataHobbies("en");

export default function Page() {
  return <HobbiesIndex lang="en" />;
}
