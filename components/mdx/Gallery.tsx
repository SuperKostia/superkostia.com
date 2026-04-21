import Image from "next/image";

type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

type GalleryProps = {
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
};

export function Gallery({ images = [], columns = 3 }: GalleryProps) {
  if (images.length === 0) return null;
  const gridClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`my-10 grid grid-cols-1 gap-4 ${gridClass}`}>
      {images.map((img) => (
        <figure
          key={img.src}
          className="flex flex-col gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-2 shadow-[var(--shadow-hard-sm)]"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
          {img.caption ? (
            <figcaption className="px-1 font-mono text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
              {img.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
