// Makes the web copies of the mascot art: trims the transparent margin off assets/sankofa-source.webp, centers the
// bird on a square canvas and writes a small WebP for the demo (public/) and for the chamber site (../images/).
// Run it again after replacing the source art:  npm run image
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SOURCE = here("../assets/sankofa-source.webp");
const SIZE = 384; // 3x the largest size the mascot is shown at (128px), so it stays sharp on phones
const TARGETS = [here("../public/sankofa-mascot.webp"), here("../../images/sankofa-mascot.webp")];

const { data, info } = await sharp(SOURCE).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const square = await sharp(data)
  .resize({ width: SIZE, height: SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toBuffer();

for (const target of TARGETS) await sharp(square).toFile(target);
console.log(`trimmed to ${info.width}x${info.height}, wrote ${SIZE}x${SIZE} (${(square.length / 1024).toFixed(1)} KB):`);
for (const target of TARGETS) console.log("  " + target);
