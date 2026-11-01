/**
 * 应用入口
 * 样式加载顺序：Element Plus 基础样式 → 深色变量 → 站点设计系统（覆盖组件库默认视觉）
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/index.css'

import App from './App.vue'
import router from './router'
import { probeBackend } from './api'

const app = createApp(App)

// 全局注册 Element Plus 图标，模板中可直接使用 <User /> 等
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

// 语言由 App.vue 的 <el-config-provider> 动态提供（中文 / English）
app.use(ElementPlus)
app.use(router)
app.mount('#app')

// 静默探测后端：不可用时接口层会自动切到本地演示数据
probeBackend()
