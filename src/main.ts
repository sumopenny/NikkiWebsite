import { createApp, createSSRApp } from 'vue'
import App from './App.vue'
import './style.css'

// 生产 HTML 已包含正文，复用节点接管交互；开发时仍从空容器挂载。
const root = document.getElementById('app')!
const app = root.hasChildNodes() ? createSSRApp(App) : createApp(App)
app.mount(root)
