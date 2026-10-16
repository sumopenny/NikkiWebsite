import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

/** 构建时复用真实首页模板输出中文正文，不读取浏览器存储或调用工具 API。 */
export function render() {
  return renderToString(createSSRApp(App))
}
