import Image from "next/image";

type ScreenshotProps = {
  src: string;
  alt: string;
  caption?: string;
  aspect?: "video" | "wide" | "square";
};

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
    <figure className="my-10 -rotate-[0.5deg] border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[var(--shadow-hard)] transition-transform hover:rotate-0">
      <div
        className={`relative w-full overflow-hidden border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-fg)] ${ratio}`}
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
        <figcaption className="px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
