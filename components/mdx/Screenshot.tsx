import Image from "next/image";

type ScreenshotProps = {
  src: string;
  alt: string;
  caption?: string;
  aspect?: "video" | "wide" | "square";
};

/** Capture dans un cadre de fenêtre arrondi (barre à pastilles). */
export function Screenshot({
  src,
  alt,
  caption,
  aspect = "wide",
}: ScreenshotProps) {
  const ratio =
    aspect === "square"
      ? "aspect-square"
      : aspect === "video"
        ? "aspect-video"
        : "aspect-[16/10]";
  return (
    <figure className="my-10 rounded-[24px] bg-[color:var(--color-surface)] p-2 sm:p-2.5">
      <div aria-hidden className="flex gap-1.5 px-2 pb-2 pt-1">
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-accent-strong)]" />
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-line)]" />
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-line)]" />
      </div>
      <div
        className={`relative w-full overflow-hidden rounded-[16px] bg-[color:var(--color-surface-2)] ${ratio}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover object-top"
        />
      </div>
      {caption ? (
        <figcaption className="px-2 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.04em] text-[color:var(--color-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
