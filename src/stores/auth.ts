import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { migrationService } from '@/services/migrationService'

/**
 * 用户认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isGuestMode = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value || isGuestMode.value)
  const userEmail = computed(() => user.value?.email || (isGuestMode.value ? 'guest@local' : ''))
  const userId = computed(() => user.value?.id || (isGuestMode.value ? 'guest' : ''))
  const userName = computed(() => {
    if (isGuestMode.value) {
      return '时间管理大师'
    }
    return user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || ''
  })

  /**
   * 初始化认证状态
   * 检查当前用户会话，如果没有会话但有游客数据则自动设置游客模式
   */
  const initialize = async () => {
    try {
      loading.value = true
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
      
      // 如果没有用户会话，检查是否有游客数据
      if (!session?.user) {
        // 动态导入 LocalStorageService 避免循环依赖
        const { LocalStorageService } = await import('@/services/localStorageService')
        
        // 检查是否有游客数据
        if (LocalStorageService.hasGuestData()) {
          console.log('检测到游客数据，自动设置为游客模式')
          isGuestMode.value = true
        }
      } else {
        // 有用户会话时确保不是游客模式
        isGuestMode.value = false
      }
    } catch (err) {
      console.error('初始化认证状态失败:', err)
      error.value = '初始化认证状态失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   */
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        throw signInError
      }

      user.value = data.user
      isGuestMode.value = false
      
      // 登录成功后检查是否需要迁移游客数据
      if (migrationService.shouldShowMigrationPrompt()) {
        // 可以在这里触发迁移提示或自动迁移
        try {
          await migrationService.silentMigration()
        } catch (migrationError) {
          console.warn('自动迁移失败:', migrationError)
        }
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('登录失败:', err)
      error.value = err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户注册
   * @param email 邮箱
   * @param password 密码
   * @param name 用户姓名
   */
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0] // 使用提供的姓名或邮箱前缀作为默认姓名
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      // 注册成功但需要邮箱验证
      if (data.user && !data.session) {
        return { 
          success: true, 
          needsVerification: true,
          message: '请检查您的邮箱并点击验证链接'
        }
      }

      user.value = data.user
      isGuestMode.value = false
      
      // 注册成功后检查是否需要迁移游客数据
      if (migrationService.shouldShowMigrationPrompt()) {
        try {
          await migrationService.migrateGuestData()
        } catch (migrationError) {
          console.warn('注册后数据迁移失败:', migrationError)
        }
      }
      
      return { success: true, needsVerification: false }
    } catch (err: any) {
      console.error('注册失败:', err)
      error.value = err.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登出
   * 如果是游客模式，清除本地存储的所有数据
   */
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null

      // 如果是游客模式，清除本地数据
      if (isGuestMode.value) {
        const { LocalStorageService } = await import('@/services/localStorageService')
        LocalStorageService.clearGuestData()
        console.log('游客模式退出，已清除本地数据')
        
        user.value = null
        isGuestMode.value = false
        return { success: true }
      }

      // 正常用户登出
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }

      user.value = null
      isGuestMode.value = false
      return { success: true }
    } catch (err: any) {
      console.error('登出失败:', err)
      error.value = err.message || '登出失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置密码
   * @param email 邮箱
   */
  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        throw resetError
      }

      return { 
        success: true,
        message: '密码重置邮件已发送，请检查您的邮箱'
      }
    } catch (err: any) {
      console.error('重置密码失败:', err)
      error.value = err.message || '重置密码失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户资料
   * @param updates 更新数据
   */
  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })

      if (updateError) {
        throw updateError
      }

      user.value = data.user
      return { success: true }
    } catch (err: any) {
      console.error('更新用户资料失败:', err)
      error.value = err.message || '更新用户资料失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置游客模式
   * @param enabled 是否启用游客模式
   */
  const setGuestMode = async (enabled: boolean) => {
    isGuestMode.value = enabled
    if (enabled) {
      // 游客模式下清除用户信息
      user.value = null
    } else {
      // 退出游客模式时清除本地数据
      const { LocalStorageService } = await import('@/services/localStorageService')
      LocalStorageService.clearGuestData()
      console.log('退出游客模式，已清除本地数据')
    }
  }

  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = null
  }

  // 监听认证状态变化
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
    
    if (event === 'SIGNED_OUT') {
      // 清理用户相关数据
      user.value = null
      isGuestMode.value = false
    }
  })

  return {
    // 状态
    user,
    loading,
    error,
    isGuestMode,
    
    // 计算属性
    isAuthenticated,
    userEmail,
    userId,
    userName,
    
    // 方法
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    setGuestMode,
    clearError
  }
})