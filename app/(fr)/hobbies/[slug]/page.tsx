import type { Metadata } from "next";
import { HobbyDetail, metadataHobby, parametresHobbies } from "@/components/pages/HobbyDetail";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = parametresHobbies;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataHobby("fr", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <HobbyDetail lang="fr" slug={slug} />;
}
