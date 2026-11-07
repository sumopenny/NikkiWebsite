import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
const base = process.env.SITE_BASE_PATH || '/'
if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..') || base.includes('//')) {
  throw new Error('SITE_BASE_PATH must be an absolute path ending in /.')
}
export default defineConfig({
  base,
  plugins: [vue(), {
    name: 'responsive-hero-preload',
    transformIndexHtml(html) {
      const assets = JSON.parse(readFileSync('src/data/imageManifest.json', 'utf8'))
      const withBase = (asset: { src: string; small: string; width: number; smallWidth: number } | undefined) =>
        asset ? { ...asset, src: base + asset.src.slice(1), small: base + asset.small.slice(1) } : undefined
      const first = { light: withBase(assets['/images/1.webp']), dark: withBase(assets['/images/11.webp']) }
      const marker = "link.href = '/images/' + (theme === 'dark' ? '11' : '1') + '.webp'"
      if (html.split(marker).length !== 2) {
        throw new Error('首屏预加载模板不匹配：请同步更新 index.html 和 vite.config.ts。')
      }
      return html.replace(marker, [
        'var asset = ' + JSON.stringify(first) + '[theme]',
        "if (!asset) { link.href = " + JSON.stringify(base + 'images/') + " + (theme === 'dark' ? '11' : '1') + '.webp' }",
        "else { link.href = asset.src; if (asset.width > asset.smallWidth) link.setAttribute('imagesrcset', asset.small + ' ' + asset.smallWidth + 'w, ' + asset.src + ' ' + asset.width + 'w') }",
        "link.setAttribute('imagesizes', '(max-width: 900px) 100vw, 75vw')"
      ].join('\n        '))
    }
  }],
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 4180, strictPort: true }
})
