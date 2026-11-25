type VideoEmbedProps = {
  src: string;
  title: string;
};

export function VideoEmbed({ src, title }: VideoEmbedProps) {
  return (
    <div className="my-10 rounded-[24px] bg-[color:var(--color-surface)] p-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-[color:var(--color-ink)]">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
