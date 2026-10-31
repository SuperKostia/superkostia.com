import type { Metadata } from "next";
import { EcritDetail, metadataEcrit, parametresEcrits } from "@/components/pages/EcritDetail";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = parametresEcrits;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataEcrit("fr", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <EcritDetail lang="fr" slug={slug} />;
}
