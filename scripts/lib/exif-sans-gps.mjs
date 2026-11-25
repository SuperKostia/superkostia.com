/**
 * Retire la position GPS d'un JPEG sans réencoder l'image.
 *
 * Les photos publiées gardaient la position exacte de la prise de vue dans
 * leur EXIF (lisible par n'importe qui). On efface le bloc GPS : chaque
 * valeur est mise à zéro et le bloc est déclaré vide. Les pixels et le reste
 * de l'EXIF (appareil, focale, date) ne bougent pas.
 *
 * La carte des voyages n'utilise qu'une position arrondie à 0,1° (≈ 10 km),
 * rangée dans lib/data/photos-lieux.json.
 */

const TAILLE_TYPE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8, 11: 4, 12: 8 };

/** @param {Buffer} jpeg  @returns {{ buffer: Buffer, modifie: boolean }} */
export function retirerGps(jpeg) {
  const buf = Buffer.from(jpeg);
  if (buf.readUInt16BE(0) !== 0xffd8) return { buffer: buf, modifie: false };

  let pos = 2;
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff) break;
    const marqueur = buf[pos + 1];
    if (marqueur === 0xda || marqueur === 0xd9) break; // début des données image
    const longueur = buf.readUInt16BE(pos + 2);
    const debut = pos + 4;
    if (marqueur === 0xe1 && buf.toString("latin1", debut, debut + 6) === "Exif\0\0") {
      const modifie = effacerBlocGps(buf, debut + 6, pos + 2 + longueur);
      return { buffer: buf, modifie };
    }
    pos += 2 + longueur;
  }
  return { buffer: buf, modifie: false };
}

function effacerBlocGps(buf, tiff, fin) {
  const ii = buf.toString("latin1", tiff, tiff + 2) === "II";
  const u16 = (o) => (ii ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (ii ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ecrire16 = (o, v) => (ii ? buf.writeUInt16LE(v, o) : buf.writeUInt16BE(v, o));

  const ifd0 = tiff + u32(tiff + 4);
  const n0 = u16(ifd0);
  let gps = -1;
  for (let i = 0; i < n0; i++) {
    const e = ifd0 + 2 + i * 12;
    if (u16(e) === 0x8825) gps = tiff + u32(e + 8);
  }
  if (gps < 0 || gps >= fin) return false;

  const n = u16(gps);
  for (let i = 0; i < n; i++) {
    const e = gps + 2 + i * 12;
    const taille = (TAILLE_TYPE[u16(e + 2)] ?? 1) * u32(e + 4);
    if (taille > 4) {
      const donnees = tiff + u32(e + 8);
      if (donnees + taille <= fin) buf.fill(0, donnees, donnees + taille);
    }
    buf.fill(0, e, e + 12);
  }
  ecrire16(gps, 0);
  return n > 0;
}
