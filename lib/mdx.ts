import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import type {
  ContentEntry,
  EcritFrontmatter,
  HobbyFrontmatter,
  ProjetFrontmatter,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

import type { Lang } from "./i18n";

type Category = "projets" | "hobbies" | "ecrits";

const SUFFIXE_EN = /\.en\.mdx?$/;

/**
 * Le fichier français fait foi. En anglais, `slug.en.mdx` à côté remplace le
 * corps et les champs de frontmatter qu'il redéfinit (titre, résumé, tags…) ;
 * type, statut, date et liens restent ceux du fichier français.
 */
async function readAll<T>(category: Category, lang: Lang): Promise<Array<ContentEntry<T>>> {
  const dir = path.join(CONTENT_ROOT, category);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const mdxFiles = files.filter(
    (f) =>
      (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith(".") && !SUFFIXE_EN.test(f),
  );

  const entries = await Promise.all(
    mdxFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);
      if (lang === "en") {
        const fichierEn = filename.replace(/\.(mdx?)$/, ".en.$1");
        if (files.includes(fichierEn)) {
          const en = matter(await fs.readFile(path.join(dir, fichierEn), "utf8"));
          return {
            frontmatter: { ...data, ...en.data } as T,
            body: en.content,
            filename: fichierEn,
          } satisfies ContentEntry<T>;
        }
      }
      return {
        frontmatter: data as T,
        body: content,
        filename,
      } satisfies ContentEntry<T>;
    }),
  );

  return entries;
}

/** Clé de tri "YYYY-MM-DD" : `date` si fournie (mois, voire jour), sinon l'année seule. */
function projetSortKey(fm: ProjetFrontmatter): string {
  const raw = fm.date ?? String(fm.year ?? 0);
  const [y = "0", m = "01", d = "01"] = raw.split("-");
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export async function getProjets(lang: Lang = "fr") {
  const entries = await readAll<ProjetFrontmatter>("projets", lang);
  return entries.sort((a, b) =>
    projetSortKey(b.frontmatter).localeCompare(projetSortKey(a.frontmatter)),
  );
}

export async function getProjetBySlug(slug: string, lang: Lang = "fr") {
  const all = await getProjets(lang);
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}

/** Hobbies dont la page a sa propre route statique (hors du catch-all `[slug]`). */
export const ROUTES_DEDIEES = new Set(["photographie", "voyages"]);

export async function getHobbies(lang: Lang = "fr") {
  return readAll<HobbyFrontmatter>("hobbies", lang);
}

export async function getHobbyBySlug(slug: string, lang: Lang = "fr") {
  const all = await getHobbies(lang);
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}

export async function getEcrits(lang: Lang = "fr") {
  const entries = await readAll<EcritFrontmatter>("ecrits", lang);
  return entries.sort((a, b) => {
    const da = a.frontmatter.date ?? "";
    const db = b.frontmatter.date ?? "";
    return db.localeCompare(da);
  });
}

export async function getEcritBySlug(slug: string, lang: Lang = "fr") {
  const all = await getEcrits(lang);
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}
