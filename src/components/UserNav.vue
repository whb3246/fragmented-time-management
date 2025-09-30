<template>
  <div class="user-nav">
    <!-- 未登录状态 -->
    <div v-if="!authStore.isAuthenticated" class="user-nav__guest">
      <button 
        class="user-nav__btn user-nav__btn--login"
        @click="goToLogin"
      >
        登录
      </button>
      <button 
        class="user-nav__btn user-nav__btn--register"
        @click="goToRegister"
      >
        注册
      </button>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-nav__user" @click="toggleDropdown" ref="userMenuRef">
      <div class="user-nav__avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="user-nav__info">
        <span class="user-nav__name">{{ displayName }}</span>
        <svg 
          class="user-nav__arrow" 
          :class="{ 'user-nav__arrow--open': showDropdown }"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>

      <!-- 下拉菜单 -->
      <div 
        v-if="showDropdown" 
        class="user-nav__dropdown"
        @click.stop
      >
        <router-link 
          to="/settings" 
          class="user-nav__dropdown-item"
          @click="closeDropdown"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
          个人设置
        </router-link>
        <router-link 
          to="/history" 
          class="user-nav__dropdown-item"
          @click="closeDropdown"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          历史记录
        </router-link>
        <div class="user-nav__dropdown-divider"></div>
        <button 
          class="user-nav__dropdown-item user-nav__dropdown-item--logout"
          @click="handleLogout"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 用户导航组件
 * 显示登录/注册按钮或用户信息和下拉菜单
 */

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showDropdown = ref(false)
const userMenuRef = ref<HTMLElement>()

// 计算属性
const displayName = computed(() => {
  return authStore.userName || '用户'
})

/**
 * 跳转到登录页面
 */
const goToLogin = () => {
  router.push('/login')
}

/**
 * 跳转到注册页面
 */
const goToRegister = () => {
  router.push('/register')
}

/**
 * 切换下拉菜单显示状态
 */
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

/**
 * 关闭下拉菜单
 */
const closeDropdown = () => {
  showDropdown.value = false
}

/**
 * 处理退出登录
 * 退出登录后刷新页面以确保所有状态都被清除
 */
const handleLogout = async () => {
  try {
    await authStore.signOut()
    closeDropdown()
    // 刷新页面以确保所有状态都被完全清除
    window.location.reload()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

/**
 * 点击外部关闭下拉菜单
 */
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// 组件挂载时添加全局点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
@import '@/styles/base/variables';
@import '@/styles/utils/mixins';

.user-nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__guest {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--login {
      background: transparent;
      color: #64748b;
      border: 1px solid #e2e8f0;

      &:hover {
        background: #f8fafc;
        color: #334155;
        border-color: #cbd5e1;
      }
    }

    &--register {
      background: #3b82f6;
      color: white;

      &:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
    }
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    color: #64748b;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    min-width: 180px;
    z-index: 1000;
    overflow: hidden;
    animation: dropdownFadeIn 0.15s ease-out;
  }

  &__dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #374151;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f9fafb;
    }

    &--logout {
      color: #dc2626;

      &:hover {
        background: #fef2f2;
      }
    }

    svg {
      flex-shrink: 0;
    }
  }

  &__dropdown-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 0.25rem 0;
  }
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-nav {
    &__name {
      max-width: 80px;
    }

    &__btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
    }

    &__dropdown {
      min-width: 160px;
    }
  }
}
</style>