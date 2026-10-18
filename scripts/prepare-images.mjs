import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root = path.resolve('public/images');
const output = path.join(root, 'optimized');
await fs.mkdir(output, { recursive: true });
const manifest = {};
const keep = new Set();
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!['optimized', 'originals'].includes(entry.name)) await walk(path.join(dir, entry.name));
      continue;
    }
    if (!entry.name.endsWith('.webp')) continue;
    const file = path.join(dir, entry.name);
    const bytes = await fs.readFile(file);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const name = hash + '.webp';
    const mobile = hash + '-960.webp';
    keep.add(name); keep.add(mobile);
    try { await fs.access(path.join(output, name)); } catch { await fs.writeFile(path.join(output, name), bytes); }
    const meta = await sharp(bytes).metadata();
    const width = meta.width;
    if (!width) throw Error('Unknown width: ' + file);
    try { await fs.access(path.join(output, mobile)); } catch {
      await sharp(bytes).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(output, mobile));
    }
    const key = '/images/' + path.relative(root, file).split(path.sep).join('/');
    manifest[key] = { src: '/images/optimized/' + name, small: '/images/optimized/' + mobile, width, smallWidth: Math.min(width, 960) };
  }
}
await walk(root);
for (const file of await fs.readdir(output)) if (!keep.has(file)) await fs.unlink(path.join(output, file));
await fs.writeFile('src/data/imageManifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Prepared responsive, content-hashed images: ' + Object.keys(manifest).length);
