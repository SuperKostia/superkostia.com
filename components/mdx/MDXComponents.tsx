import type { ComponentProps } from "react";
import NextLink from "next/link";
import type { MDXComponents } from "mdx/types";

function H1(props: ComponentProps<"h1">) {
  return (
    <h1
      className="mb-4 mt-14 text-4xl font-medium leading-[1] tracking-[-0.015em] sm:text-5xl"
      {...props}
    />
  );
}

function H2(props: ComponentProps<"h2">) {
  return (
    <h2
      className="mb-3 mt-14 text-3xl font-medium leading-[1.05] tracking-[-0.015em] sm:text-[2.25rem]"
      {...props}
    />
  );
}

function H3(props: ComponentProps<"h3">) {
  return (
    <h3
      className="mb-2 mt-10 text-xl font-medium leading-tight tracking-[-0.01em] sm:text-2xl"
      {...props}
    />
  );
}

function Paragraph(props: ComponentProps<"p">) {
  return <p className="my-5 leading-relaxed" {...props} />;
}

const CLASSE_LIEN =
  "underline decoration-1 underline-offset-[5px] decoration-[color:var(--color-muted)]/50 transition-colors hover:decoration-[color:var(--color-accent-strong)] hover:decoration-2";

function Anchor(props: ComponentProps<"a">) {
  const { href = "", children, ...rest } = props;
  const external = /^https?:\/\//.test(href);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={CLASSE_LIEN}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} className={CLASSE_LIEN} {...rest}>
      {children}
    </NextLink>
  );
}

function UnorderedList(props: ComponentProps<"ul">) {
  return (
    <ul
      className="my-5 space-y-2 pl-6 [&>li]:relative [&>li]:before:absolute [&>li]:before:-left-5 [&>li]:before:top-[0.62em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-[color:var(--color-accent-strong)] [&>li]:before:content-['']"
      {...props}
    />
  );
}

function OrderedList(props: ComponentProps<"ol">) {
  return (
    <ol
      className="my-5 list-decimal space-y-2 pl-6 marker:font-mono marker:text-[0.85em] marker:text-[color:var(--color-muted)]"
      {...props}
    />
  );
}

function Blockquote(props: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className="my-8 rounded-[20px] bg-[color:var(--color-surface)] px-6 py-5 text-lg leading-snug [&>p]:my-2"
      {...props}
    />
  );
}

function InlineCode(props: ComponentProps<"code">) {
  return (
    <code
      className="rounded-[6px] bg-[color:var(--color-surface-2)] px-1.5 py-0.5 font-mono text-[0.88em]"
      {...props}
    />
  );
}

function Pre(props: ComponentProps<"pre">) {
  return (
    <pre
      className="my-8 overflow-x-auto rounded-[20px] bg-[color:var(--color-ink)] p-5 font-mono text-sm leading-relaxed text-[color:var(--color-ink-fg)] [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  );
}

function Hr(props: ComponentProps<"hr">) {
  return (
    <hr
      className="my-12 h-[22px] border-0 bg-[radial-gradient(circle,var(--color-dot)_1.2px,transparent_1.6px)] bg-[length:22px_22px] bg-center"
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
