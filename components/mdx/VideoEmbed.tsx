type VideoEmbedProps = {
  src: string;
  title: string;
};

export function VideoEmbed({ src, title }: VideoEmbedProps) {
  return (
    <div className="my-10 border-2 border-[color:var(--color-border)] shadow-[var(--shadow-hard)]">
      <div className="relative aspect-video w-full">
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
