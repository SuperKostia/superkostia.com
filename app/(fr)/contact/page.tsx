import { Contact, metadataContact } from "@/components/pages/Contact";

export const metadata = metadataContact("fr");

export default function Page() {
  return <Contact lang="fr" />;
}
