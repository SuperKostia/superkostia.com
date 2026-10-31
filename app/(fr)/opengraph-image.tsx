import { ALT_PARTAGE, imagePartage } from "@/components/pages/ImagePartage";

export { size, contentType } from "@/components/pages/ImagePartage";
export const alt = ALT_PARTAGE.fr;

export default function Image() {
  return imagePartage("fr");
}
