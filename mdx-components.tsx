import type { MDXComponents } from "mdx/types";
import { sharedMDXComponents } from "@/components/mdx/MDXComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...sharedMDXComponents, ...components };
}
