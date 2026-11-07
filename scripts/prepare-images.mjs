import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const root = path.resolve('images')
const output = path.resolve('public/images/optimized')
const cacheFile = path.resolve('.verify/image-cache.json')
const options = { width: 960, quality: 86 }
const encoderKey = JSON.stringify({ options, versions: sharp.versions })
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16)
await fs.mkdir(output, { recursive: true })
await fs.mkdir(path.dirname(cacheFile), { recursive: true })
let previous = {}
try {
  const saved = JSON.parse(await fs.readFile(cacheFile, 'utf8'))
  if (saved.encoderKey === encoderKey) previous = saved.entries ?? {}
} catch (error) {
  if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error
}
const manifest = {}
const entries = {}
const keep = new Set()
let resized = 0
let reused = 0

/** Addresses depend on the published bytes, including encoder changes. */
async function publish(bytes, suffix = '') {
  const name = hash(bytes) + suffix + '.webp'
  keep.add(name)
  const file = path.join(output, name)
  let existing
  try {
    existing = await fs.readFile(file)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (!existing?.equals(bytes)) await fs.writeFile(file, bytes)
  return '/images/optimized/' + name
}

/** Validate cached output bytes so missing or damaged files are regenerated. */
async function cachedSmall(cached, sourceHash) {
  if (!cached || cached.sourceHash !== sourceHash || typeof cached.small !== 'string') return null
  const name = cached.small.split('/').pop()
  if (!/^[a-f0-9]{16}-960\.webp$/.test(name)) return null
  try {
    const bytes = await fs.readFile(path.join(output, name))
    if (hash(bytes) !== name.slice(0, 16)) return null
    keep.add(name)
    return '/images/optimized/' + name
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return null
  }
}

async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  files.sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of files) {
    if (entry.isDirectory()) {
      if (entry.name !== 'originals') await walk(path.join(dir, entry.name))
      continue
    }
    if (!entry.name.endsWith('.webp')) continue
    const file = path.join(dir, entry.name)
    const bytes = await fs.readFile(file)
    const { width } = await sharp(bytes).metadata()
    if (!width) throw new Error('Unknown width: ' + file)
    const key = '/images/' + path.relative(root, file).split(path.sep).join('/')
    const sourceHash = hash(bytes)
    const src = await publish(bytes)
    let small = src
    if (width > options.width) {
      small = await cachedSmall(previous[key], sourceHash)
      if (small) reused++
      else {
        small = await publish(await sharp(bytes).resize({ width: options.width }).webp({ quality: options.quality }).toBuffer(), '-960')
        resized++
      }
    }
    manifest[key] = { src, small, width, smallWidth: Math.min(width, options.width) }
    entries[key] = { sourceHash, small }
  }
}
await walk(root)
for (const file of await fs.readdir(output)) {
  if (!keep.has(file)) await fs.unlink(path.join(output, file))
}
await fs.writeFile('src/data/imageManifest.json', JSON.stringify(manifest, null, 2) + '\n')
await fs.writeFile(cacheFile, JSON.stringify({ encoderKey, entries }) + '\n')
console.log('Prepared responsive, content-hashed images: ' + Object.keys(manifest).length + '; resized: ' + resized + '; reused: ' + reused)
