import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import ts from 'typescript'

const base = process.env.SITE_BASE_PATH || '/'
const html = fs.readFileSync('dist/index.html', 'utf8')
for (const match of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
  const url = match[1]
  if (url.startsWith('//')) continue
  assert.ok(url.startsWith(base), 'Resource outside deployment base: ' + url)
  assert.ok(fs.existsSync('dist/' + url.slice(base.length)), 'Missing deployed resource: ' + url)
}
assert.ok(html.includes(base + 'assets/'), 'Missing base-aware script')
assert.ok(html.includes(base + 'images/optimized/'), 'Missing base-aware images')
assert.ok(html.includes(base + 'favicon.svg'), 'Missing base-aware favicon')
const manifest = JSON.parse(fs.readFileSync('src/data/imageManifest.json', 'utf8'))
const source = fs.readFileSync('src/imageAssets.ts', 'utf8')
for (const testBase of ['/', '/NikkiWebsite/']) {
  const code = source.replace("import manifest from './data/imageManifest.json'", 'const manifest = fixture')
    .replace('import.meta.env.BASE_URL', JSON.stringify(testBase))
  const exports = {}
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, fixture: manifest, Map })
  const logical = Object.keys(manifest)[0]
  const expected = testBase + manifest[logical].src.slice(1)
  assert.equal(exports.imageSource(logical), expected)
  assert.equal(exports.imageSource(expected), expected, 'Repeated path resolution added the base twice')
  assert.equal(exports.imageSource('/images/brand-mark.png'), testBase + 'images/brand-mark.png')
  assert.equal(exports.imageSource('https://example.com/image.webp'), 'https://example.com/image.webp')
  const responsive = Object.keys(manifest).find(key => manifest[key].width > manifest[key].smallWidth)
  assert.ok(exports.imageSrcset(exports.imageSource(responsive)).includes(testBase + 'images/optimized/'))
}
console.log('Passed deployment base, published resource references, favicons and root/subpath image resolution.')
