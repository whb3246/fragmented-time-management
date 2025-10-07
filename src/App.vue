<template>
  <div id="app">
    <!-- 全局顶部导航栏 -->
    <header 
      ref="headerRef"
      class="app-header" 
      :class="{
        'app-header--fixed': !isScrolled,
        'app-header--floating': isScrolled
      }"
    >
      <div class="app-header__container">
        <!-- 返回按钮 (仅在内页显示) -->
        <button 
          v-if="showBackButton"
          class="app-header__back-btn"
          @click="handleGoBack"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

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
    <main class="app-main" ref="mainRef">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNav from '@/components/UserNav.vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 应用根组件
 * 包含全局导航栏和路由视图
 */

// 路由和状态管理
const route = useRoute()
const router = useRouter()

// 模板引用
const headerRef = ref<HTMLElement>()
const mainRef = ref<HTMLElement>()

// 响应式状态 - 简化为只需要判断是否滚动
const isScrolled = ref(false)

/**
 * 计算是否显示返回按钮
 * 根据当前路由判断是否为内页
 */
const showBackButton = computed(() => {
  const currentPath = route.path
  // 不显示返回按钮的页面
  const noBackButtonPages = ['/', '/login', '/register', '/reset-password']
  return !noBackButtonPages.includes(currentPath)
})

/**
 * 智能返回功能
 * 优先返回上一页，如果没有历史记录则返回首页
 */
const handleGoBack = () => {
  // 检查是否有历史记录可以返回
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // 没有历史记录时返回首页
    router.push('/')
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 */
const throttle = (func: Function, delay: number) => {
  let lastCall = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * 处理滚动事件 - 修复回到顶部的逻辑
 */
const handleScroll = throttle(() => {
  const currentScrollY = window.scrollY
  
  // 精确判断：scrollY === 0时回到sticky状态，scrollY > 0时保持浮动状态
  const wasScrolled = isScrolled.value
  isScrolled.value = currentScrollY > 0
  
  // 当导航栏状态发生变化时，动态调整body的padding-top
  if (wasScrolled !== isScrolled.value) {
    updateBodyPadding()
  }
}, 16) // 约60fps的节流

/**
 * 动态更新body的padding-top以避免浮动导航栏遮挡内容
 */
const updateBodyPadding = () => {
  const body = document.body
  if (isScrolled.value) {
    // 浮动状态：添加顶部间距
    const headerHeight = headerRef.value?.offsetHeight || 64
    body.style.paddingTop = `${headerHeight}px`
  } else {
    // 固定状态：移除顶部间距
    body.style.paddingTop = '0'
  }
}

/**
 * 初始化应用认证状态
 * 在应用启动时检查localStorage中的游客数据并恢复游客模式状态
 * 确保页面刷新后能正确恢复登录状态
 */
const initializeApp = async () => {
  const authStore = useAuthStore()
  await authStore.initialize()
}

/**
 * 初始化智能导航栏功能
 */
const initSmartNavbar = async () => {
  // 添加滚动事件监听器
  window.addEventListener('scroll', handleScroll, { passive: true })
}

/**
 * 清理事件监听器
 */
const cleanup = () => {
  window.removeEventListener('scroll', handleScroll)
}

// 监听路由变化，重置滚动状态
watch(route, async () => {
  // 路由变化时重置滚动状态
  await nextTick()
  isScrolled.value = window.scrollY > 10
  // 路由变化时也需要更新body padding
  updateBodyPadding()
}, { flush: 'post' })

// 在组件挂载时初始化
onMounted(async () => {
  await initializeApp()
  
  // 等待DOM更新完成后初始化智能导航栏
  await nextTick()
  await initSmartNavbar()
  
  // 初始化时设置正确的body padding
  updateBodyPadding()
})

// 在组件卸载时清理
onUnmounted(() => {
  cleanup()
  // 清理时重置body padding
  document.body.style.paddingTop = '0'
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
  // 使用渐变背景替代纯色背景
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.95) 50%, 
    rgba(241, 245, 249, 0.92) 100%
  );
  // 减少边框强度，使用更柔和的颜色
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  // 减少阴影强度，使用更柔和的阴影
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  // 添加平滑过渡效果
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 固定状态：在页面顶部时
  &--fixed {
    position: sticky;
    top: 0;
    z-index: 100;
    // 增强渐变效果
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 1) 0%, 
      rgba(248, 250, 252, 0.98) 50%, 
      rgba(241, 245, 249, 0.95) 100%
    );
  }
  
  // 浮动状态：开始滚动时
  &--floating {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transform: translateY(0);
    // 优化毛玻璃效果，使用更柔和的背景
    backdrop-filter: blur(12px) saturate(180%);
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.85) 0%, 
      rgba(248, 250, 252, 0.80) 50%, 
      rgba(241, 245, 249, 0.75) 100%
    );
    // 减少阴影强度，使用更柔和的阴影
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
    // 移除硬边框
    border-bottom: 1px solid rgba(226, 232, 240, 0.2);
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  &__back-btn {
    position: absolute;
    left: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;

    &:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      flex-shrink: 0;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #1e293b;
    font-weight: 600;
    font-size: 1.125rem;
    transition: all 0.2s ease;
    // 动态调整左边距：当有返回按钮时向右偏移
    margin-left: 0;
    
    // 当显示返回按钮时，增加左边距避免重合
    .app-header__container:has(.app-header__back-btn) & {
      margin-left: 3rem; // 返回按钮宽度(40px) + 间距
    }

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
  // 确保内容区域能够正常滚动
  overflow-y: auto;
  // 移除顶部间距，改为在具体页面中处理
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    &__container {
      padding: 0 0.75rem;
      height: 56px;
    }

    &__back-btn {
      left: 0.75rem;
      width: 36px;
      height: 36px;
    }

    &__logo {
      font-size: 1rem;
      
      // 移动端当有返回按钮时的左边距调整
      .app-header__container:has(.app-header__back-btn) & {
        margin-left: 2.5rem; // 移动端返回按钮宽度(36px) + 间距
      }
    }

    &__brand {
      display: none;
    }
    
    // 移动端优化浮动效果
    &--floating {
      backdrop-filter: blur(4px);
      background: rgba(255, 255, 255, 0.98);
    }
  }
  
  // 移动端调整主内容区域的顶部间距
  .app-main {
    // 移除移动端的padding-top
  }
}

// 平板设备优化
@media (max-width: 1024px) and (min-width: 769px) {
  .app-header {
    &--floating {
      backdrop-filter: blur(6px);
    }
  }
}

// 添加平滑滚动效果
html {
  scroll-behavior: smooth;
}

// 优化滚动条样式（仅在支持的浏览器中生效）
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>