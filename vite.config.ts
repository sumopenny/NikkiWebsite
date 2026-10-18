import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
export default defineConfig({
  plugins: [vue(), {
    name: 'responsive-hero-preload',
    transformIndexHtml(html) {
      const assets = JSON.parse(readFileSync('src/data/imageManifest.json', 'utf8'))
      const first = { light: assets['/images/1.webp'], dark: assets['/images/11.webp'] }
      return html.replace("link.href = '/images/' + (theme === 'dark' ? '11' : '1') + '.webp'", [
        'var asset = ' + JSON.stringify(first) + '[theme]',
        "if (!asset) { link.href = '/images/' + (theme === 'dark' ? '11' : '1') + '.webp' }",
        "else { link.href = asset.src; if (asset.width > asset.smallWidth) link.setAttribute('imagesrcset', asset.small + ' ' + asset.smallWidth + 'w, ' + asset.src + ' ' + asset.width + 'w') }",
        "link.setAttribute('imagesizes', '(max-width: 900px) 100vw, 75vw')"
      ].join('\n        '))
    }
  }],
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 4180, strictPort: true }
})
