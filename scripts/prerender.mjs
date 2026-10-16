import { build } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// 服务端临时产物留在被忽略的 .verify 下，避免向公开 dist 发布服务端模块。
const outDir = resolve('.verify/prerender')
await build({
  build: {
    ssr: 'src/entry-server.ts',
    outDir,
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } }
  }
})
const { render } = await import(pathToFileURL(resolve(outDir, 'entry-server.mjs')).href)
const content = await render()
const file = resolve('dist/index.html')
const template = await readFile(file, 'utf8')
const outlet = '<div id="app"></div>'
// 模板变化或渲染异常时使发布失败，不能悄悄退回不可抓取的空壳。
if (!template.includes(outlet) || !content.includes('暖立方') || !content.includes('<main')) {
  throw new Error('首页预渲染失败：缺少挂载容器或主要正文。')
}
await writeFile(file, template.replace(outlet, () => `<div id="app">${content}</div>`), 'utf8')
console.log('首页预渲染完成：已输出可直接阅读的中文正文。')
