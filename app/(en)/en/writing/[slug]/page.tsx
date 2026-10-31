import type { Metadata } from "next";
import { EcritDetail, metadataEcrit, parametresEcrits } from "@/components/pages/EcritDetail";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = parametresEcrits;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataEcrit("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <EcritDetail lang="en" slug={slug} />;
}
