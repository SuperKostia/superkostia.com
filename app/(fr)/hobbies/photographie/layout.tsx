import type { ReactNode } from "react";
import { PhotographieLayout } from "@/components/pages/PhotographieLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <PhotographieLayout>{children}</PhotographieLayout>;
}
