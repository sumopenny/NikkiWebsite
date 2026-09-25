import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 构建产物使用的基础路径（base）。
 *
 * GitHub Pages 的项目站地址是「子路径」形式：https://sumopenny.github.io/NikkiWebsite/
 * 因此构建时所有 /assets、/images 之类的绝对路径都要带上 /NikkiWebsite 前缀，
 * 否则线上会整站 404（资源请求跑到 https://sumopenny.github.io/assets/... 去了）。
 *
 * 所以下面用 command 做了区分：
 * - 构建（vite build）→ 带上 /NikkiWebsite/ 前缀，产物可直接丢到 GitHub Pages；
 * - 开发（vite dev）→ 仍走根路径 /，这样 Start-Website.bat 打开的
 *   http://localhost:5180 不受影响。
 *
 * 若将来绑定自定义域名（站点挂在域名根路径），把下面 base 改成 '/' 即可。
 */
const BUILD_BASE = '/NikkiWebsite/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BUILD_BASE : '/',
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: true
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true
  }
}))
