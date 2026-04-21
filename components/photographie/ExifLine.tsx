import type { PhotoExif } from "@/lib/photos";

type ExifLineProps = {
  exif?: PhotoExif;
  tags?: string[];
};

export function ExifLine({ exif, tags = [] }: ExifLineProps) {
  const parts = exif
    ? [
        exif.focal,
        exif.aperture,
        exif.shutter,
        exif.iso ? `ISO ${exif.iso}` : undefined,
      ].filter(Boolean)
    : [];
  const hasAny = parts.length > 0 || exif?.camera || tags.length > 0;
  if (!hasAny) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--photo-fg-muted)]">
      {parts.length > 0 ? <span>{parts.join(" · ")}</span> : null}
      {exif?.camera ? <span>· {exif.camera}</span> : null}
      {tags.length > 0 ? <span>· {tags.join(" · ")}</span> : null}
    </div>
  );
}
