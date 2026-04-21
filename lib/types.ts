export type ProjetType = "pro" | "perso" | "experimental";
export type ProjetStatus = "en-cours" | "publie" | "archive" | "abandonne";

export type FrontmatterBase = {
  title: string;
  slug: string;
  summary: string;
  year: number;
  tags: string[];
  cover?: string;
  accent?: string;
};

export type ProjetFrontmatter = FrontmatterBase & {
  type: ProjetType;
  status: ProjetStatus;
  stack?: string[];
  links?: Array<{ label: string; url: string }>;
  featured?: boolean;
};

export type HobbyFrontmatter = FrontmatterBase & {
  sousTitre?: string;
};

export type EcritFrontmatter = FrontmatterBase & {
  date: string;
  tempsLecture?: string;
};

export type ContentEntry<T> = {
  frontmatter: T;
  body: string;
  filename: string;
};
