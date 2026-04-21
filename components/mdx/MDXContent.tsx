import { MDXRemote } from "next-mdx-remote/rsc";
import { sharedMDXComponents } from "./MDXComponents";
import { Stack } from "./Stack";
import { Links } from "./Links";
import { Quote } from "./Quote";
import { Gallery } from "./Gallery";
import { VideoEmbed } from "./VideoEmbed";
import { Press, PressItem } from "./Press";
import { Screenshot } from "./Screenshot";

const CUSTOM_COMPONENTS = {
  Stack,
  Links,
  Quote,
  Gallery,
  VideoEmbed,
  Press,
  PressItem,
  Screenshot,
};

type MDXContentProps = {
  source: string;
};

export function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose-brut max-w-[65ch]">
      <MDXRemote
        source={source}
        components={{
          ...sharedMDXComponents,
          ...CUSTOM_COMPONENTS,
        }}
      />
    </div>
  );
}
