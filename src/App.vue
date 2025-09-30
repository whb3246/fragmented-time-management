<template>
  <div id="app">
    <!-- 全局顶部导航栏 -->
    <header class="app-header">
      <div class="app-header__container">
        <!-- Logo/品牌名称 -->
        <router-link to="/" class="app-header__logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span class="app-header__brand">碎片时间</span>
        </router-link>

        <!-- 用户导航 -->
        <UserNav />
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import UserNav from '@/components/UserNav.vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 应用根组件
 * 包含全局导航栏和路由视图
 */

/**
 * 初始化应用认证状态
 * 在应用启动时检查localStorage中的游客数据并恢复游客模式状态
 * 确保页面刷新后能正确恢复登录状态
 */
const initializeApp = async () => {
  const authStore = useAuthStore()
  await authStore.initialize()
}

// 在组件挂载时初始化认证状态
onMounted(() => {
  initializeApp()
})
</script>

<style lang="scss">
@use '@/styles/main.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #1e293b;
    font-weight: 600;
    font-size: 1.125rem;
    transition: color 0.2s ease;

    &:hover {
      color: #3b82f6;
    }

    svg {
      color: #3b82f6;
    }
  }

  &__brand {
    font-weight: 700;
  }
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    &__container {
      padding: 0 0.75rem;
      height: 56px;
    }

    &__logo {
      font-size: 1rem;
    }

    &__brand {
      display: none;
    }
  }
}
</style>