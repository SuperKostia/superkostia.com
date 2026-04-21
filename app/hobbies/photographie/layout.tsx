import type { ReactNode } from "react";
import { EB_Garamond } from "next/font/google";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

export default function PhotographieLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={`photo-surface ${garamond.variable}`}>{children}</div>;
}
