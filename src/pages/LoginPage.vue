<template>
  <div class="login-page">
    <div class="login-page__container">
      <div class="login-card">
        <!-- 头部 -->
        <div class="login-card__header">
          <h1 class="login-card__title">碎片时间管理器</h1>
          <p class="login-card__subtitle">让每一分钟都有意义</p>
        </div>

        <!-- 登录表单 -->
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="login-form__tabs">
            <button
              type="button"
              :class="[
                'login-form__tab',
                { 'login-form__tab--active': isLogin }
              ]"
              @click="switchToLogin"
            >
              登录
            </button>
            <button
              type="button"
              :class="[
                'login-form__tab',
                { 'login-form__tab--active': !isLogin }
              ]"
              @click="switchToRegister"
            >
              注册
            </button>
          </div>

          <!-- 邮箱输入 -->
          <div class="form-group">
            <label class="form-group__label" for="email">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-group__input"
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <label class="form-group__label" for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-group__input"
              placeholder="请输入密码"
              required
            />
          </div>

          <!-- 确认密码（仅注册时显示） -->
          <div v-if="!isLogin" class="form-group">
            <label class="form-group__label" for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-group__input"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <!-- 姓名（仅注册时显示） -->
          <div v-if="!isLogin" class="form-group">
            <label class="form-group__label" for="name">姓名</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-group__input"
              placeholder="请输入您的姓名"
              required
            />
          </div>

          <!-- 错误信息 -->
          <div v-if="error" class="login-form__error">
            {{ error }}
          </div>

          <!-- 提交按钮组 -->
          <div class="login-form__buttons">
            <button
              type="button"
              class="login-form__cancel"
              @click="handleCancel"
              :disabled="loading"
            >
              取消
            </button>
            <button
              type="submit"
              class="login-form__submit"
              :disabled="loading || !validateForm()"
            >
              <span v-if="loading" class="loading-spinner">⏳</span>
              {{ isLogin ? '确认登录' : '确认注册' }}
            </button>
          </div>
        </form>

        <!-- 其他登录方式 -->
        <div class="login-card__divider">
          <span>或</span>
        </div>

        <button
          class="login-card__guest-btn"
          @click="continueAsGuest"
          :disabled="loading"
        >
          游客模式体验
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

/**
 * 登录页面组件
 */

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

// 表单数据
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: ''
})

/**
 * 切换到登录模式
 */
const switchToLogin = () => {
  isLogin.value = true
  error.value = ''
  resetForm()
}

/**
 * 切换到注册模式
 */
const switchToRegister = () => {
  isLogin.value = false
  error.value = ''
  resetForm()
}

/**
 * 重置表单
 */
const resetForm = () => {
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.name = ''
}

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  if (!form.email || !form.password) {
    error.value = '请填写完整信息'
    return false
  }

  if (!isLogin.value) {
    if (!form.name) {
      error.value = '请输入姓名'
      return false
    }
    
    if (form.password !== form.confirmPassword) {
      error.value = '两次输入的密码不一致'
      return false
    }
    
    if (form.password.length < 6) {
      error.value = '密码长度至少6位'
      return false
    }
  }

  return true
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = ''
  
  try {
    if (isLogin.value) {
      // 登录逻辑 - 直接使用 Supabase Auth 验证
      const result = await authStore.signIn(form.email, form.password)
      if (result.success) {
        router.push('/')
      } else {
        error.value = result.error || '邮箱或密码错误'
      }
    } else {
      // 注册逻辑 - 直接使用 Supabase Auth 注册
      const result = await authStore.signUp(form.email, form.password, form.name)
      if (result.success) {
        if (result.needsVerification) {
          error.value = ''
          // 显示验证提示信息
          alert('注册成功！请检查您的邮箱并点击验证链接')
        } else {
          router.push('/')
        }
      } else {
        error.value = result.error || '注册失败'
      }
    }
  } catch (err) {
    error.value = err.message || '操作失败'
  } finally {
    loading.value = false
  }
}

/**
 * 游客模式继续
 */
const continueAsGuest = async () => {
  try {
    // 设置 localStorage 以便持久化
    localStorage.setItem('isGuestMode', 'true')
    
    // 调用 authStore 的 setGuestMode 方法更新认证状态
    await authStore.setGuestMode(true)
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('设置游客模式失败:', error)
    // 即使出错也尝试跳转，因为 localStorage 已经设置
    router.push('/')
  }
}

// 取消按钮处理
const handleCancel = () => {
  router.push('/')
}


</script>

<style lang="scss" scoped>
@use '@/styles/utils/mixins' as *;

.login-page {
  min-height: 100vh;
  // 优化整体背景，与导航栏协调
  background: linear-gradient(180deg, 
    rgba(248, 250, 252, 0.3) 0%, 
    rgba(255, 255, 255, 0.95) 15%, 
    rgba(248, 250, 252, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  &__container {
    width: 100%;
    max-width: 400px;
  }
}

.login-card {
  // 添加毛玻璃效果，与导航栏保持一致
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.3);
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  
  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  &__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }
  
  &__subtitle {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  &__divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--color-border);
    }
    
    span {
      background: white;
      padding: 0 1rem;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }
  
  &__guest-btn {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--color-primary);
    background: transparent;
    color: var(--color-primary);
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: var(--color-primary);
      color: white;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.login-form {
  &__tabs {
    display: flex;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  &__tab {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: color 0.2s ease;
    
    &--active {
      color: var(--color-primary);
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--color-primary);
      }
    }
  }
  
  &__error {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  &__buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  &__cancel {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border: 2px solid #e5e7eb;
    background: transparent;
    color: #6b7280;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      border-color: #d1d5db;
      background: #f9fafb;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &__submit {
    flex: 2;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  .loading-spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.form-group {
  margin-bottom: 1rem;
  
  &__label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  &__input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    
    &::placeholder {
      color: var(--color-text-tertiary);
    }
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@include respond-to(mobile) {
  .login-card {
    padding: 1.5rem;
    
    &__title {
      font-size: 1.5rem;
    }
  }
}
</style>