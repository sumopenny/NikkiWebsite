import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const root = path.resolve('images')
const output = path.resolve('public/images/optimized')
await fs.mkdir(output, { recursive: true })
const manifest = {}
const keep = new Set()

/** 对实际发布的字节计算哈希，压缩参数或编码器变化也会生成新地址。 */
async function publish(bytes, suffix = '') {
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16)
  const name = `${hash}${suffix}.webp`
  keep.add(name)
  try {
    await fs.access(path.join(output, name))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await fs.writeFile(path.join(output, name), bytes)
  }
  return `/images/optimized/${name}`
}

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== 'originals') await walk(path.join(dir, entry.name))
      continue
    }
    if (!entry.name.endsWith('.webp')) continue
    const file = path.join(dir, entry.name)
    const bytes = await fs.readFile(file)
    const { width } = await sharp(bytes).metadata()
    if (!width) throw new Error('Unknown width: ' + file)
    const src = await publish(bytes)
    // 小于等于 960px 的源图直接复用，避免生成没有尺寸收益的副本。
    const small = width > 960
      ? await publish(await sharp(bytes).resize({ width: 960 }).webp({ quality: 86 }).toBuffer(), '-960')
      : src
    const key = '/images/' + path.relative(root, file).split(path.sep).join('/')
    manifest[key] = { src, small, width, smallWidth: Math.min(width, 960) }
  }
}
await walk(root)
for (const file of await fs.readdir(output)) {
  if (!keep.has(file)) await fs.unlink(path.join(output, file))
}
await fs.writeFile('src/data/imageManifest.json', JSON.stringify(manifest, null, 2) + '\n')
console.log('Prepared responsive, content-hashed images: ' + Object.keys(manifest).length)
