import type { Metadata } from "next";
import { ProjetDetail, metadataProjet, parametresProjets } from "@/components/pages/ProjetDetail";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = parametresProjets;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataProjet("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjetDetail lang="en" slug={slug} />;
}
