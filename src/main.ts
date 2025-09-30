import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/main.scss'
import App from './App.vue'
import router from './router'

/**
 * 创建Vue应用实例并配置插件
 */
const app = createApp(App)

// 创建Pinia状态管理实例
const pinia = createPinia()

// 使用路由
app.use(router)

// 使用状态管理
app.use(pinia)

// 挂载应用
app.mount('#app')
