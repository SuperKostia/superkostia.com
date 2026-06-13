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

type Category = "projets" | "hobbies" | "ecrits";

async function readAll<T>(category: Category): Promise<Array<ContentEntry<T>>> {
  const dir = path.join(CONTENT_ROOT, category);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const mdxFiles = files.filter(
    (f) => (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("."),
  );

  const entries = await Promise.all(
    mdxFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);
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

export async function getProjets() {
  const entries = await readAll<ProjetFrontmatter>("projets");
  return entries.sort((a, b) =>
    projetSortKey(b.frontmatter).localeCompare(projetSortKey(a.frontmatter)),
  );
}

export async function getProjetBySlug(slug: string) {
  const all = await getProjets();
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}

export async function getHobbies() {
  return readAll<HobbyFrontmatter>("hobbies");
}

export async function getHobbyBySlug(slug: string) {
  const all = await getHobbies();
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}

export async function getEcrits() {
  const entries = await readAll<EcritFrontmatter>("ecrits");
  return entries.sort((a, b) => {
    const da = a.frontmatter.date ?? "";
    const db = b.frontmatter.date ?? "";
    return db.localeCompare(da);
  });
}

export async function getEcritBySlug(slug: string) {
  const all = await getEcrits();
  return all.find((e) => e.frontmatter.slug === slug) ?? null;
}
