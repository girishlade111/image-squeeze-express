import sharp from 'sharp';
import { readFile, writeFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = resolve(root, 'src/assets/profile.png');
const outWebp = resolve(root, 'src/assets/profile.webp');
const outAvif = resolve(root, 'src/assets/profile.avif');

const original = (await stat(src)).size;
console.log(`Original PNG: ${(original / 1024 / 1024).toFixed(2)} MB`);

const img = sharp(await readFile(src));
const meta = await img.metadata();
console.log(`Source dimensions: ${meta.width} x ${meta.height}`);

const webp = await img
  .resize(640, 960, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80, effort: 6 })
  .toBuffer();
await writeFile(outWebp, webp);
console.log(`WebP 640w: ${(webp.length / 1024).toFixed(1)} KB (${((1 - webp.length / original) * 100).toFixed(1)}% smaller)`);

const avif = await img
  .resize(640, 960, { fit: 'inside', withoutEnlargement: true })
  .avif({ quality: 55, effort: 6 })
  .toBuffer();
await writeFile(outAvif, avif);
console.log(`AVIF 640w: ${(avif.length / 1024).toFixed(1)} KB (${((1 - avif.length / original) * 100).toFixed(1)}% smaller)`);

const webpLg = await sharp(await readFile(src))
  .resize(960, 1440, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toBuffer();
await writeFile(resolve(root, 'src/assets/profile@2x.webp'), webpLg);
console.log(`WebP 960w: ${(webpLg.length / 1024).toFixed(1)} KB (retina)`);

const avifLg = await sharp(await readFile(src))
  .resize(960, 1440, { fit: 'inside', withoutEnlargement: true })
  .avif({ quality: 58, effort: 6 })
  .toBuffer();
await writeFile(resolve(root, 'src/assets/profile@2x.avif'), avifLg);
console.log(`AVIF 960w: ${(avifLg.length / 1024).toFixed(1)} KB (retina)`);
