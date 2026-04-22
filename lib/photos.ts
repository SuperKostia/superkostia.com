import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";

const PHOTO_ROOT = path.join(
  process.cwd(),
  "public",
  "images",
  "photographie",
);

export type PhotoExif = {
  camera?: string;
  lens?: string;
  focal?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  takenAt?: string;
};

export type Photo = {
  src: string;
  alt: string;
  filename: string;
  seriesSlug: string;
  tags: string[];
  width: number;
  height: number;
  blurDataURL: string;
  exif?: PhotoExif;
};

export type Series = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
  order?: number;
  photos: Photo[];
};

type PhotoMeta = {
  alt?: string;
  tags?: string[];
};

type SeriesMeta = {
  title?: string;
  date?: string;
  description?: string;
  order?: number;
  photos?: Record<string, PhotoMeta>;
};

function humanize(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function readSeriesMeta(dir: string): Promise<SeriesMeta> {
  try {
    const raw = await fs.readFile(path.join(dir, "_series.json"), "utf8");
    return JSON.parse(raw) as SeriesMeta;
  } catch {
    return {};
  }
}

async function generateBlurAndDims(
  absPath: string,
): Promise<{ blurDataURL: string; width: number; height: number }> {
  try {
    const meta = await sharp(absPath).metadata();
    const width = meta.width ?? 1600;
    const height = meta.height ?? 1200;
    const buffer = await sharp(absPath)
      .resize(12, 12, { fit: "inside" })
      .jpeg({ quality: 45 })
      .toBuffer();
    return {
      blurDataURL: `data:image/jpeg;base64,${buffer.toString("base64")}`,
      width,
      height,
    };
  } catch {
    return { blurDataURL: "", width: 1600, height: 1200 };
  }
}

async function readExif(absPath: string): Promise<PhotoExif | undefined> {
  try {
    const data = await exifr.parse(absPath, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
      ],
    });
    if (!data) return undefined;

    const focal = data.FocalLength
      ? `${Math.round(data.FocalLength)} mm`
      : undefined;
    const aperture = data.FNumber ? `f/${data.FNumber}` : undefined;
    const shutter =
      typeof data.ExposureTime === "number"
        ? data.ExposureTime < 1
          ? `1/${Math.round(1 / data.ExposureTime)}`
          : `${data.ExposureTime}s`
        : undefined;
    const camera = [data.Make, data.Model].filter(Boolean).join(" ").trim();

    return {
      camera: camera || undefined,
      lens: data.LensModel ?? undefined,
      focal,
      aperture,
      shutter,
      iso: typeof data.ISO === "number" ? data.ISO : undefined,
      takenAt:
        data.DateTimeOriginal instanceof Date
          ? data.DateTimeOriginal.toISOString()
          : undefined,
    };
  } catch {
    return undefined;
  }
}

async function readSeries(slug: string): Promise<Series> {
  const dir = path.join(PHOTO_ROOT, slug);
  const meta = await readSeriesMeta(dir);

  const files = await fs.readdir(dir);
  const images = files
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !f.startsWith(".") && !f.startsWith("_"))
    .sort();

  const photos: Photo[] = await Promise.all(
    images.map(async (filename) => {
      const absPath = path.join(dir, filename);
      const [exif, dims] = await Promise.all([
        readExif(absPath),
        generateBlurAndDims(absPath),
      ]);
      const photoMeta = meta.photos?.[filename];
      const nameNoExt = filename.replace(/\.[^.]+$/, "");
      return {
        src: `/images/photographie/${slug}/${filename}`,
        alt: photoMeta?.alt ?? humanize(nameNoExt),
        filename,
        seriesSlug: slug,
        tags: photoMeta?.tags ?? [],
        width: dims.width,
        height: dims.height,
        blurDataURL: dims.blurDataURL,
        exif,
      };
    }),
  );

  return {
    slug,
    title: meta.title ?? humanize(slug),
    date: meta.date,
    description: meta.description,
    order: meta.order,
    photos,
  };
}

export async function getAllSeries(): Promise<Series[]> {
  let dirs: string[] = [];
  try {
    const entries = await fs.readdir(PHOTO_ROOT, { withFileTypes: true });
    dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }

  const series = await Promise.all(dirs.map(readSeries));
  return series
    .filter((s) => s.photos.length > 0)
    .sort((a, b) => {
      const orderDiff = (a.order ?? 999) - (b.order ?? 999);
      if (orderDiff !== 0) return orderDiff;
      const da = a.date ?? "";
      const db = b.date ?? "";
      if (da || db) return db.localeCompare(da);
      return a.slug.localeCompare(b.slug);
    });
}

export async function getAllPhotosFlat(): Promise<Photo[]> {
  const series = await getAllSeries();
  return series.flatMap((s) => s.photos);
}
