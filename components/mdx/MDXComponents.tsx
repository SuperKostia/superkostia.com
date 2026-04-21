import type { ComponentProps } from "react";
import NextLink from "next/link";
import type { MDXComponents } from "mdx/types";

function H1(props: ComponentProps<"h1">) {
  return (
    <h1
      className="mt-12 font-[family-name:var(--font-space-grotesk)] text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl"
      {...props}
    />
  );
}

function H2(props: ComponentProps<"h2">) {
  return (
    <h2
      className="mt-10 font-[family-name:var(--font-space-grotesk)] text-3xl font-black uppercase leading-tight tracking-tight"
      {...props}
    />
  );
}

function H3(props: ComponentProps<"h3">) {
  return (
    <h3
      className="mt-8 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase leading-tight tracking-tight"
      {...props}
    />
  );
}

function Paragraph(props: ComponentProps<"p">) {
  return <p className="my-5 text-base leading-relaxed" {...props} />;
}

function Anchor(props: ComponentProps<"a">) {
  const { href = "", children, ...rest } = props;
  const external = /^https?:\/\//.test(href);
  const className =
    "underline decoration-2 underline-offset-4 decoration-[color:var(--color-border)] hover:decoration-[color:var(--color-accent)]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} className={className} {...rest}>
      {children}
    </NextLink>
  );
}

function UnorderedList(props: ComponentProps<"ul">) {
  return <ul className="my-5 list-disc space-y-1 pl-6" {...props} />;
}

function OrderedList(props: ComponentProps<"ol">) {
  return <ol className="my-5 list-decimal space-y-1 pl-6" {...props} />;
}

function Blockquote(props: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className="my-6 border-l-4 border-[color:var(--color-accent)] bg-[color:var(--color-bg)] px-5 py-3 font-[family-name:var(--font-space-grotesk)] text-lg italic"
      {...props}
    />
  );
}

function InlineCode(props: ComponentProps<"code">) {
  return (
    <code
      className="rounded-none border-2 border-[color:var(--color-border)] bg-[color:var(--color-accent)]/20 px-1.5 py-0.5 font-mono text-[0.95em]"
      {...props}
    />
  );
}

function Pre(props: ComponentProps<"pre">) {
  return (
    <pre
      className="my-6 overflow-x-auto border-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] p-4 font-mono text-sm text-[color:var(--color-bg)] shadow-[var(--shadow-hard-sm)]"
      {...props}
    />
  );
}

function Hr(props: ComponentProps<"hr">) {
  return (
    <hr
      className="my-10 border-0 border-t-2 border-[color:var(--color-border)]"
      {...props}
    />
  );
}

export const sharedMDXComponents: MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  a: Anchor,
  ul: UnorderedList,
  ol: OrderedList,
  blockquote: Blockquote,
  code: InlineCode,
  pre: Pre,
  hr: Hr,
};
