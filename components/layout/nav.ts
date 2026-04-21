export type NavItem = {
  label: string;
  href: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Projets", href: "/projets" },
  { label: "Hobbies", href: "/hobbies" },
  { label: "Laboratoire", href: "/laboratoire" },
  { label: "Écrits", href: "/ecrits" },
  { label: "À propos", href: "/a-propos" },
];

export const FOOTER_NAV: NavItem[] = [
  { label: "Contact", href: "/contact" },
  { label: "Colophon", href: "/colophon" },
];
