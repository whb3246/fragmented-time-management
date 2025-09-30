<template>
  <div class="reset-password-page">
    <div class="reset-password-page__container">
      <div class="reset-password-page__card">
        <!-- 页面头部 -->
        <header class="reset-password-page__header">
          <h1 class="reset-password-page__title">重置密码</h1>
          <p class="reset-password-page__subtitle">
            输入您的邮箱地址，我们将发送重置密码的链接
          </p>
        </header>

        <!-- 重置密码表单 -->
        <form @submit.prevent="handleResetPassword" class="reset-password-form">
          <div class="form-group">
            <label for="email" class="form-group__label">邮箱地址</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-group__input"
              :class="{ 'form-group__input--error': emailError }"
              placeholder="请输入您的邮箱地址"
              required
              :disabled="loading"
            />
            <span v-if="emailError" class="form-group__error">{{ emailError }}</span>
          </div>

          <button
            type="submit"
            class="reset-password-form__submit"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-spinner loading-spinner--small"></span>
            {{ loading ? '发送中...' : '发送重置链接' }}
          </button>
        </form>

        <!-- 成功消息 -->
        <div v-if="successMessage" class="reset-password-page__success">
          <div class="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <p>{{ successMessage }}</p>
        </div>

        <!-- 错误消息 -->
        <div v-if="errorMessage" class="reset-password-page__error">
          <div class="error-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p>{{ errorMessage }}</p>
        </div>

        <!-- 返回登录 -->
        <div class="reset-password-page__footer">
          <router-link to="/login" class="reset-password-page__back-link">
            ← 返回登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

/**
 * 重置密码页面组件
 */

// 响应式数据
const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const emailError = ref('')

/**
 * 表单验证
 */
const isFormValid = computed(() => {
  return email.value.trim() !== '' && isValidEmail(email.value)
})

/**
 * 验证邮箱格式
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证邮箱输入
 */
const validateEmail = (): void => {
  emailError.value = ''
  
  if (!email.value.trim()) {
    emailError.value = '请输入邮箱地址'
    return
  }
  
  if (!isValidEmail(email.value)) {
    emailError.value = '请输入有效的邮箱地址'
    return
  }
}

/**
 * 处理重置密码请求
 */
const handleResetPassword = async (): Promise<void> => {
  // 清除之前的消息
  successMessage.value = ''
  errorMessage.value = ''
  
  // 验证表单
  validateEmail()
  if (emailError.value) {
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/reset-password-confirm`
    })

    if (error) {
      throw error
    }

    successMessage.value = '重置密码链接已发送到您的邮箱，请查收并按照邮件中的指示操作。'
    
    // 清空表单
    email.value = ''

  } catch (error: any) {
    console.error('重置密码失败:', error)
    
    // 处理不同类型的错误
    if (error.message?.includes('rate_limit')) {
      errorMessage.value = '请求过于频繁，请稍后再试'
    } else if (error.message?.includes('invalid_email')) {
      errorMessage.value = '邮箱地址无效'
    } else {
      errorMessage.value = '发送重置链接失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/base/variables' as *;
@use '@/styles/utils/mixins' as *;

.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  @include flex-center;
  padding: 2rem 1rem;

  &__container {
    width: 100%;
    max-width: 400px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    @include mobile {
      padding: 1.5rem;
      border-radius: 12px;
    }
  }

  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  &__subtitle {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
  }

  &__success,
  &__error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    font-size: 0.9rem;
    line-height: 1.4;

    p {
      margin: 0;
    }
  }

  &__success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;

    .success-icon {
      color: #28a745;
      flex-shrink: 0;
    }
  }

  &__error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;

    .error-icon {
      color: #dc3545;
      flex-shrink: 0;
    }
  }

  &__footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  &__back-link {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }
  }
}

.reset-password-form {
  &__submit {
    width: 100%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    @include flex-center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
}

.form-group {
  margin-bottom: 1.5rem;

  &__label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  &__input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &--error {
      border-color: #dc3545;
      
      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }
    }

    &:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    &::placeholder {
      color: #adb5bd;
    }
  }

  &__error {
    display: block;
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &--small {
    width: 16px;
    height: 16px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@include mobile {
  .reset-password-page {
    padding: 1rem;

    &__card {
      padding: 1.5rem;
    }

    &__title {
      font-size: 1.5rem;
    }
  }

  .form-group {
    margin-bottom: 1.25rem;

    &__input {
      padding: 0.75rem;
    }
  }
}
</style>