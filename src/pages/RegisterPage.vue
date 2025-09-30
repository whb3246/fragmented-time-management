<template>
  <div class="register-page">
    <div class="register-page__container">
      <div class="register-page__card">
        <!-- 头部 -->
        <div class="register-page__header">
          <h1 class="register-page__title">创建账户</h1>
          <p class="register-page__subtitle">开始您的碎片时间管理之旅</p>
        </div>

        <!-- 注册表单 -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- 邮箱输入 -->
          <div class="form-group">
            <label for="email" class="form-group__label">邮箱地址</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-group__input"
              :class="{ 'form-group__input--error': errors.email }"
              placeholder="请输入您的邮箱地址"
              required
              :disabled="loading"
            />
            <span v-if="errors.email" class="form-group__error">{{ errors.email }}</span>
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <label for="password" class="form-group__label">密码</label>
            <div class="password-input">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-group__input"
                :class="{ 'form-group__input--error': errors.password }"
                placeholder="请输入密码（至少6位）"
                required
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-input__toggle"
                :disabled="loading"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
          </div>

          <!-- 确认密码输入 -->
          <div class="form-group">
            <label for="confirmPassword" class="form-group__label">确认密码</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              class="form-group__input"
              :class="{ 'form-group__input--error': errors.confirmPassword }"
              placeholder="请再次输入密码"
              required
              :disabled="loading"
            />
            <span v-if="errors.confirmPassword" class="form-group__error">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 用户协议 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.agreeToTerms"
                type="checkbox"
                class="checkbox-label__input"
                required
                :disabled="loading"
              />
              <span class="checkbox-label__checkmark"></span>
              <span class="checkbox-label__text">
                我已阅读并同意
                <a href="#" class="checkbox-label__link">用户协议</a>
                和
                <a href="#" class="checkbox-label__link">隐私政策</a>
              </span>
            </label>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ errorMessage }}
          </div>

          <!-- 成功提示 -->
          <div v-if="successMessage" class="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            {{ successMessage }}
          </div>

          <!-- 注册按钮组 -->
          <div class="register-form__buttons">
            <button
              type="button"
              class="register-form__cancel"
              @click="handleCancel"
              :disabled="loading"
            >
              取消
            </button>
            <button
              type="submit"
              class="register-form__submit"
              :disabled="loading || !isFormValid"
            >
              <svg v-if="loading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-icon">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              {{ loading ? '注册中...' : '确认注册' }}
            </button>
          </div>
        </form>

        <!-- 登录链接 -->
        <div class="register-page__footer">
          <p class="register-page__login-text">
            已有账户？
            <router-link to="/login" class="register-page__login-link">立即登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

/**
 * 用户注册页面组件
 */

const router = useRouter()

// 响应式数据
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表单数据
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  name: ''
})

// 表单验证错误
const errors = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

/**
 * 验证邮箱格式
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 */
const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

/**
 * 验证表单
 */
const validateForm = (): boolean => {
  let isValid = true

  // 重置错误信息
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  // 验证邮箱
  if (!formData.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!validateEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 验证密码
  if (!formData.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (!validatePassword(formData.password)) {
    errors.password = '密码至少需要6位字符'
    isValid = false
  }

  // 验证确认密码
  if (!formData.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  return isValid
}

/**
 * 表单是否有效
 */
const isFormValid = computed(() => {
  return formData.email && 
         formData.password && 
         formData.confirmPassword && 
         formData.agreeToTerms &&
         formData.password === formData.confirmPassword &&
         validateEmail(formData.email) &&
         validatePassword(formData.password)
})

/**
 * 处理取消操作
 */
const handleCancel = (): void => {
  // 返回首页
  router.push('/')
}

/**
 * 检查邮箱是否已存在
 */
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // 使用 Supabase Auth 的 resetPasswordForEmail 来检查用户是否存在
    // 这个方法不会真正发送邮件，但会告诉我们用户是否存在
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password'
    })

    // 如果没有错误，说明用户存在
    if (!error) {
      return true
    }

    // 如果是 "User not found" 错误，说明用户不存在
    if (error.message.includes('User not found') || error.message.includes('not found')) {
      return false
    }

    // 其他错误情况，为安全起见假设用户存在
    return true
  } catch (error) {
    console.error('检查邮箱失败:', error)
    // 发生其他错误时，为了安全起见，假设用户存在
    return true
  }
}

/**
 * 处理用户注册
 */
const handleRegister = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // 首先检查邮箱是否已存在
    const emailExists = await checkEmailExists(formData.email)
    if (emailExists) {
      errorMessage.value = '该邮箱已有账户，请直接登录'
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          name: formData.name || formData.email.split('@')[0] // 使用用户输入的姓名或邮箱前缀
        }
      }
    })

    if (error) {
      throw error
    }

    if (data.user && !data.user.email_confirmed_at) {
      successMessage.value = '注册成功！请检查您的邮箱并点击确认链接来激活账户。'
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else if (data.user) {
      successMessage.value = '注册成功！正在跳转...'
      
      // 跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    
    // 处理不同类型的错误
    if (error.message?.includes('User already registered')) {
      errorMessage.value = '该邮箱已被注册，请使用其他邮箱或直接登录'
    } else if (error.message?.includes('Password should be at least 6 characters')) {
      errorMessage.value = '密码至少需要6位字符'
    } else if (error.message?.includes('Invalid email')) {
      errorMessage.value = '请输入有效的邮箱地址'
    } else {
      errorMessage.value = error.message || '注册失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/base/variables';
@import '@/styles/utils/mixins';

.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  @include flex-center;
  padding: 2rem 1rem;

  &__container {
    width: 100%;
    max-width: 480px;
  }

  &__card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    @include mobile {
      padding: 2rem 1.5rem;
      border-radius: 16px;
    }
  }

  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.5rem 0;

    @include mobile {
      font-size: 1.75rem;
    }
  }

  &__subtitle {
    color: #666;
    font-size: 1rem;
    margin: 0;
  }

  &__footer {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }

  &__login-text {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  &__login-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }
  }
}

.register-form {
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
    border-radius: 12px;
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
    border-radius: 12px;
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

    .loading-icon {
      animation: spin 1s linear infinite;
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
      border-color: #e74c3c;
    }

    &:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }
  }

  &__error {
    display: block;
    color: #e74c3c;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
}

.password-input {
  position: relative;

  &__toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s;

    &:hover:not(:disabled) {
      color: #333;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;

  &__input {
    display: none;
  }

  &__checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 4px;
    background: white;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s;
    margin-top: 1px;

    &::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  &__input:checked + &__checkmark {
    background: #667eea;
    border-color: #667eea;

    &::after {
      opacity: 1;
    }
  }

  &__text {
    color: #666;
  }

  &__link {
    color: #667eea;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@include mobile {
  .register-page {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }
}
</style>