<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <header class="settings-page__header">
      <button 
        class="settings-page__back-btn"
        @click="goBack"
        aria-label="返回"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="settings-page__title">设置</h1>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="settings-page__loading">
      <div class="loading-spinner"></div>
      <p>加载设置中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="settings-page__error">
      <p>{{ error }}</p>
      <button @click="loadUserSettings" class="btn btn--secondary">重试</button>
    </div>

    <!-- 设置内容 -->
    <div v-else class="settings-page__content">
      <!-- 用户信息区域 -->
      <section class="settings-section">
        <h2 class="settings-section__title">用户信息</h2>
        <div class="user-info">
          <div class="user-info__avatar">
            <div class="avatar-placeholder">
              {{ userInitial }}
            </div>
          </div>
          <div class="user-info__details">
            <p class="user-info__name">{{ displayName }}</p>
            <p class="user-info__email">{{ displayEmail }}</p>
            <p class="user-info__join-date">
              {{ displayJoinDate }}
            </p>
          </div>
        </div>
      </section>

      <!-- 通知设置 -->
      <section class="settings-section">
        <h2 class="settings-section__title">通知设置</h2>
        <div class="setting-item">
          <label class="setting-item__label">
            <span>任务提醒</span>
            <input 
              type="checkbox" 
              v-model="settings.taskReminder"
              @change="updateSetting('taskReminder', settings.taskReminder)"
              class="toggle-switch"
            >
          </label>
          <p class="setting-item__description">在任务开始前提醒您</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-item__label">
            <span>完成庆祝</span>
            <input 
              type="checkbox" 
              v-model="settings.completionCelebration"
              @change="updateSetting('completionCelebration', settings.completionCelebration)"
              class="toggle-switch"
            >
          </label>
          <p class="setting-item__description">任务完成时显示庆祝动画</p>
        </div>
      </section>

      <!-- 偏好设置 -->
      <section class="settings-section">
        <h2 class="settings-section__title">偏好设置</h2>
        
        <div class="setting-item">
          <label class="setting-item__label">
            <span>默认时长</span>
            <select 
              v-model="settings.defaultDuration"
              @change="updateSetting('defaultDuration', settings.defaultDuration)"
              class="setting-select"
            >
              <option value="15">15分钟</option>
              <option value="25">25分钟</option>
              <option value="30">30分钟</option>
              <option value="45">45分钟</option>
              <option value="60">60分钟</option>
            </select>
          </label>
          <p class="setting-item__description">新任务的默认时长</p>
        </div>

        <div class="setting-item">
          <label class="setting-item__label">
            <span>主题色彩</span>
            <select 
              v-model="settings.themeColor"
              @change="updateSetting('themeColor', settings.themeColor)"
              class="setting-select"
            >
              <option value="blue">蓝色</option>
              <option value="green">绿色</option>
              <option value="purple">紫色</option>
              <option value="orange">橙色</option>
            </select>
          </label>
          <p class="setting-item__description">应用的主题颜色</p>
        </div>

        <div class="setting-item">
          <label class="setting-item__label">
            <span>自动暂停</span>
            <input 
              type="checkbox" 
              v-model="settings.autoPause"
              @change="updateSetting('autoPause', settings.autoPause)"
              class="toggle-switch"
            >
          </label>
          <p class="setting-item__description">离开页面时自动暂停计时器</p>
        </div>
      </section>

      <!-- 数据统计 -->
      <section class="settings-section">
        <h2 class="settings-section__title">数据统计</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-item__value">{{ userStats.totalTasks }}</span>
            <span class="stat-item__label">完成任务</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__value">{{ userStats.totalMinutes }}</span>
            <span class="stat-item__label">专注分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__value">{{ userStats.streakDays }}</span>
            <span class="stat-item__label">连续天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-item__value">{{ userStats.averageCompletion }}%</span>
            <span class="stat-item__label">完成率</span>
          </div>
        </div>
      </section>

      <!-- 账户操作 -->
      <section class="settings-section">
        <h2 class="settings-section__title">账户操作</h2>
        <div class="action-buttons">
          <button @click="exportData" class="btn btn--secondary">
            导出数据
          </button>
          <button @click="clearData" class="btn btn--warning">
            清除数据
          </button>
          <button @click="logout" class="btn btn--danger">
            退出登录
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import DataService from '@/services/dataService'
import type { User } from '@supabase/supabase-js'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const error = ref('')
const user = computed(() => authStore.user)

// 用户设置
const settings = reactive({
  taskReminder: true,
  completionCelebration: true,
  defaultDuration: 25,
  themeColor: 'blue',
  autoPause: true
})

// 用户统计数据
const userStats = reactive({
  totalTasks: 0,
  totalMinutes: 0,
  streakDays: 0,
  averageCompletion: 0
})

/**
 * 获取用户名首字母
 */
const userInitial = computed(() => {
  if (authStore.isGuestMode) {
    return '时'
  }
  if (!user.value?.email) return '?'
  return user.value.email.charAt(0).toUpperCase()
})

/**
 * 显示用户名
 */
const displayName = computed(() => {
  return authStore.userName || '未知用户'
})

/**
 * 显示邮箱
 */
const displayEmail = computed(() => {
  if (authStore.isGuestMode) {
    return '游客模式'
  }
  return user.value?.email || '未登录'
})

/**
 * 显示加入时间
 */
const displayJoinDate = computed(() => {
  if (authStore.isGuestMode) {
    return '当前会话：游客模式'
  }
  return `加入时间：${formatDate(user.value?.created_at)}`
})

/**
 * 返回上一页
 */
const goBack = (): void => {
  router.back()
}

/**
 * 格式化日期
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 加载用户设置
 */
const loadUserSettings = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  try {
    // 如果是游客模式，直接加载统计数据
    if (authStore.isGuestMode) {
      await loadUserStats()
      return
    }

    // 登录用户模式：获取用户偏好设置
    if (user.value) {
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (prefError && prefError.code !== 'PGRST116') {
        throw prefError
      }

      // 如果有设置数据，更新本地设置
      if (preferences) {
        Object.assign(settings, {
          taskReminder: preferences.task_reminder ?? true,
          completionCelebration: preferences.completion_celebration ?? true,
          defaultDuration: preferences.default_duration ?? 25,
          themeColor: preferences.theme_color ?? 'blue',
          autoPause: preferences.auto_pause ?? true
        })
      }
    }

    // 获取用户统计数据
    await loadUserStats()

  } catch (err) {
    console.error('加载用户设置失败:', err)
    error.value = '加载设置失败，请重试'
  } finally {
    loading.value = false
  }
}

/**
 * 加载用户统计数据
 */
const loadUserStats = async (): Promise<void> => {
  try {
    // 使用 DataService 获取统计数据
    const stats = await DataService.getTaskStats()
    
    // 获取任务记录用于计算连续天数
    const records = await DataService.getTaskRecords()
    const completedRecords = records.filter(record => record.status === 'completed')
    
    // 计算连续天数
    const streakDays = completedRecords.length > 0 
      ? calculateStreakDays(completedRecords.map(r => r.started_at || r.created_at))
      : 0
    
    // 计算平均完成率
    const averageCompletion = records.length > 0 
      ? Math.round((stats.completedTasks / records.length) * 100)
      : 0

    Object.assign(userStats, {
      totalTasks: stats.completedTasks,
      totalMinutes: stats.totalTime,
      streakDays,
      averageCompletion
    })
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

/**
 * 计算连续天数
 */
const calculateStreakDays = (dates: string[]): number => {
  if (!dates.length) return 0
  
  const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  
  // 检查今天或昨天是否有任务
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    streak = 1
    let currentDate = new Date(uniqueDates[0])
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      
      if (uniqueDates[i] === prevDate.toDateString()) {
        streak++
        currentDate = new Date(uniqueDates[i])
      } else {
        break
      }
    }
  }
  
  return streak
}

/**
 * 更新设置
 */
const updateSetting = async (key: string, value: any): Promise<void> => {
  if (!user.value) return

  try {
    const updateData = {
      user_id: user.value.id,
      [key === 'taskReminder' ? 'task_reminder' : 
        key === 'completionCelebration' ? 'completion_celebration' :
        key === 'defaultDuration' ? 'default_duration' :
        key === 'themeColor' ? 'theme_color' :
        key === 'autoPause' ? 'auto_pause' : key]: value,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert(updateData)

    if (error) throw error

  } catch (err) {
    console.error('更新设置失败:', err)
    // 恢复原值
    await loadUserSettings()
  }
}

/**
 * 导出数据
 */
const exportData = async (): Promise<void> => {
  if (!user.value) return

  try {
    // 获取用户所有数据
    const { data: records } = await supabase
      .from('task_records')
      .select('*')
      .eq('user_id', user.value.id)

    const exportData = {
      user: user.value.email,
      settings,
      stats: userStats,
      records: records || []
    }

    // 创建下载链接
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fragment-time-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

  } catch (err) {
    console.error('导出数据失败:', err)
    alert('导出数据失败，请重试')
  }
}

/**
 * 清除数据
 */
const clearData = async (): Promise<void> => {
  if (!user.value) return

  if (!confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    return
  }

  try {
    // 删除任务记录
    const { error: recordsError } = await supabase
      .from('task_records')
      .delete()
      .eq('user_id', user.value.id)

    if (recordsError) throw recordsError

    // 重置统计数据
    Object.assign(userStats, {
      totalTasks: 0,
      totalMinutes: 0,
      streakDays: 0,
      averageCompletion: 0
    })

    alert('数据已清除')

  } catch (err) {
    console.error('清除数据失败:', err)
    alert('清除数据失败，请重试')
  }
}

/**
 * 退出登录
 */
const logout = async (): Promise<void> => {
  if (!confirm('确定要退出登录吗？')) {
    return
  }

  try {
    await authStore.signOut()
    router.push('/login')
  } catch (err) {
    console.error('退出登录失败:', err)
    alert('退出登录失败，请重试')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserSettings()
})
</script>

<style lang="scss" scoped>
@use '@/styles/base/variables' as *;
@use '@/styles/utils/mixins' as *;

.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;

  &__header {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__back-btn {
    background: none;
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-right: 1rem;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: white;
    text-align: center;
  }

  &__content {
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  &__title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__avatar {
    .avatar-placeholder {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }
  }

  &__details {
    flex: 1;
  }

  &__name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.25rem 0;
  }

  &__email {
    font-size: 1rem;
    color: #666;
    margin: 0 0 0.25rem 0;
  }

  &__join-date {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
  }
}

.setting-item {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }

  &__description {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
}

.toggle-switch {
  appearance: none;
  width: 50px;
  height: 26px;
  background: #ddd;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;

  &:checked {
    background: #667eea;
  }

  &::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  &:checked::before {
    transform: translateX(24px);
  }
}

.setting-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  &__value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: 0.9rem;
    color: #666;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @include mobile {
    gap: 0.5rem;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &--secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
    }
  }

  &--warning {
    background: #ffc107;
    color: #212529;

    &:hover {
      background: #e0a800;
    }
  }

  &--danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@include mobile {
  .settings-page {
    &__content {
      padding: 0.75rem;
    }
  }

  .settings-section {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .setting-item__label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>