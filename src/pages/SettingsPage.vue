<template>
  <div class="settings-page">
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
      <!-- 页面标题和用户信息区域 -->
      <section class="settings-section settings-section--header">
        <h1 class="settings-page__main-title">设置</h1>
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

      <!-- 积分总览 - 仅注册用户可见 -->
      <section v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="settings-section settings-section--points">
        <h2 class="settings-section__title">积分总览</h2>
        <div class="points-overview">
          <div class="points-overview__main">
            <div class="points-total">
              <svg class="points-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div class="points-total__content">
                <span class="points-total__value">{{ totalPoints }}</span>
                <span class="points-total__label">总积分</span>
              </div>
            </div>
            <div class="points-stats">
              <div class="points-stat">
                <span class="points-stat__value">{{ weeklyPoints }}</span>
                <span class="points-stat__label">本周积分</span>
              </div>
              <div class="points-stat">
                <span class="points-stat__value">{{ monthlyPoints }}</span>
                <span class="points-stat__label">本月积分</span>
              </div>
            </div>
          </div>
          
          <!-- 积分成就徽章 -->
          <div class="points-achievements">
            <h3 class="points-achievements__title">成就徽章</h3>
            <div class="achievements-grid">
              <div 
                v-for="achievement in achievements" 
                :key="achievement.id"
                class="achievement-badge"
                :class="{ 'achievement-badge--unlocked': achievement.unlocked }"
              >
                <div class="achievement-badge__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path v-if="achievement.type === 'star'" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    <path v-else-if="achievement.type === 'diamond'" d="M6,2L18,2L22,8L12,22L2,8L6,2Z"/>
                    <path v-else-if="achievement.type === 'crown'" d="M5 16L3 5L8.5 12L12 4L15.5 12L21 5L19 16H5Z"/>
                    <path v-else d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div class="achievement-badge__content">
                  <span class="achievement-badge__name">{{ achievement.name }}</span>
                  <span class="achievement-badge__description">{{ achievement.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 积分历史 -->
          <div class="points-history">
            <h3 class="points-history__title">积分获得历史</h3>
            <div class="points-history__list">
              <div 
                v-for="record in recentPointsHistory" 
                :key="record.id"
                class="points-history__item"
              >
                <div class="points-history__date">
                  {{ formatDate(record.date) }}
                </div>
                <div class="points-history__task">
                  {{ record.taskTitle }}
                </div>
                <div class="points-history__points">
                  <svg class="points-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  +{{ record.points }}
                </div>
              </div>
            </div>
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
import { PointsService } from '@/services/pointsService'
import type { User } from '@supabase/supabase-js'
import type { TaskRecord } from '@/types/database'

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

// 积分相关数据
const totalPoints = ref(0)
const weeklyPoints = ref(0)
const monthlyPoints = ref(0)
const recentPointsHistory = ref<Array<{
  id: string
  date: string
  taskTitle: string
  points: number
}>>([])

// 成就徽章数据
const achievements = ref([
  {
    id: 'first_task',
    name: '初出茅庐',
    description: '完成第一个任务',
    type: 'star',
    unlocked: false,
    requirement: 1
  },
  {
    id: 'points_100',
    name: '百分达人',
    description: '获得100积分',
    type: 'diamond',
    unlocked: false,
    requirement: 100
  },
  {
    id: 'streak_7',
    name: '七日坚持',
    description: '连续7天完成任务',
    type: 'crown',
    unlocked: false,
    requirement: 7
  },
  {
    id: 'points_500',
    name: '积分大师',
    description: '获得500积分',
    type: 'diamond',
    unlocked: false,
    requirement: 500
  },
  {
    id: 'tasks_50',
    name: '任务专家',
    description: '完成50个任务',
    type: 'star',
    unlocked: false,
    requirement: 50
  },
  {
    id: 'points_1000',
    name: '积分王者',
    description: '获得1000积分',
    type: 'crown',
    unlocked: false,
    requirement: 1000
  }
])

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
 * 格式化日期
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `昨天`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 加载积分统计数据
 */
const loadPointsStats = async (): Promise<void> => {
  if (authStore.isGuestMode || !authStore.isAuthenticated) {
    return
  }

  try {
    // 获取积分统计
    const userStats = await PointsService.getUserStats()
    totalPoints.value = userStats?.total_points || 0
    weeklyPoints.value = userStats?.points_this_week || 0
    monthlyPoints.value = userStats?.points_this_month || 0
    
    // 获取积分历史记录
    const taskRecords = await DataService.getTaskRecords()
    const completedRecords = taskRecords
      .filter(record => record.status === 'completed' && record.points_earned && record.points_earned > 0)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 10) // 只显示最近10条记录
    
    recentPointsHistory.value = completedRecords.map(record => ({
      id: record.id,
      date: record.started_at,
      taskTitle: record.task_title || '未知任务',
      points: record.points_earned || 0
    }))
    
    // 更新成就徽章状态
    updateAchievements()
    
  } catch (err) {
    console.error('加载积分统计失败:', err)
  }
}

/**
 * 更新成就徽章状态
 */
const updateAchievements = (): void => {
  achievements.value.forEach(achievement => {
    switch (achievement.id) {
      case 'first_task':
        achievement.unlocked = userStats.totalTasks >= 1
        break
      case 'points_100':
        achievement.unlocked = totalPoints.value >= 100
        break
      case 'streak_7':
        achievement.unlocked = userStats.streakDays >= 7
        break
      case 'points_500':
        achievement.unlocked = totalPoints.value >= 500
        break
      case 'tasks_50':
        achievement.unlocked = userStats.totalTasks >= 50
        break
      case 'points_1000':
        achievement.unlocked = totalPoints.value >= 1000
        break
    }
  })
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
      await loadPointsStats()
      return
    }

    // 加载用户偏好设置
    const preferences = await DataService.getUserPreferences()
    if (preferences) {
      settings.taskReminder = preferences.task_reminder ?? true
      settings.completionCelebration = preferences.completion_celebration ?? true
      settings.defaultDuration = preferences.default_duration ?? 25
      settings.themeColor = preferences.theme_color ?? 'blue'
      settings.autoPause = preferences.auto_pause ?? true
    }

    // 加载统计数据
    await loadUserStats()
    await loadPointsStats()

  } catch (err) {
    console.error('加载用户设置失败:', err)
    error.value = err instanceof Error ? err.message : '加载设置失败'
  } finally {
    loading.value = false
  }
}

/**
 * 更新设置
 */
const updateSetting = async (key: string, value: any): Promise<void> => {
  try {
    if (authStore.isGuestMode) {
      // 游客模式下只在本地保存设置
      localStorage.setItem(`guest_setting_${key}`, JSON.stringify(value))
      return
    }

    // 构建更新对象
    const updateData: Record<string, any> = {}
    
    switch (key) {
      case 'taskReminder':
        updateData.task_reminder = value
        break
      case 'completionCelebration':
        updateData.completion_celebration = value
        break
      case 'defaultDuration':
        updateData.default_duration = value
        break
      case 'themeColor':
        updateData.theme_color = value
        break
      case 'autoPause':
        updateData.auto_pause = value
        break
    }

    await DataService.updateUserPreferences(updateData)
  } catch (err) {
    console.error('更新设置失败:', err)
    // 可以在这里显示错误提示
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
 * 导出数据
 */
const exportData = async (): Promise<void> => {
  try {
    const records = await DataService.getTaskRecords()
    const preferences = await DataService.getUserPreferences()
    
    const exportData = {
      records,
      preferences,
      exportDate: new Date().toISOString(),
      userEmail: user.value?.email
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fragmented-time-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (err) {
    console.error('导出数据失败:', err)
    alert('导出数据失败，请稍后重试')
  }
}

/**
 * 清除数据
 */
const clearData = async (): Promise<void> => {
  if (!confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    return
  }
  
  try {
    if (authStore.isGuestMode) {
      // 清除本地存储的游客数据
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('guest_') || key.startsWith('fragmented_time_')
      )
      keys.forEach(key => localStorage.removeItem(key))
    } else {
      // 清除数据库中的用户数据
      const records = await DataService.getTaskRecords()
      for (const record of records) {
        await DataService.deleteTaskRecord(record.id)
      }
    }
    
    // 重新加载数据
    await loadUserStats()
    await loadPointsStats()
    
    alert('数据已清除')
  } catch (err) {
    console.error('清除数据失败:', err)
    alert('清除数据失败，请稍后重试')
  }
}

/**
 * 退出登录
 */
const logout = async (): Promise<void> => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (err) {
    console.error('退出登录失败:', err)
    alert('退出登录失败，请稍后重试')
  }
}

// 生命周期
onMounted(() => {
  loadUserSettings()
})
</script>

<style lang="scss" scoped>
@use '@/styles/base/variables' as *;
@use '@/styles/utils/mixins' as *;

.settings-page {
  min-height: 100vh;
  background: linear-gradient(180deg, 
    rgba(248, 250, 252, 0.3) 0%, 
    rgba(255, 255, 255, 0.95) 15%, 
    rgba(248, 250, 252, 0.2) 100%
  );
  padding: 1rem;

  @include respond-to(tablet) {
    padding: 2rem;
  }

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    color: #1e293b;
  }

  &__content {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 4rem; // 为导航栏留出空间
  }

  &__main-title {
    color: #1e293b;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    text-align: center;
  }
}

.settings-section {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);

  &--header {
    text-align: center;
  }

  &--points {
    border: 2px solid rgba(217, 119, 6, 0.2);
    background: linear-gradient(135deg, 
      rgba(255, 251, 235, 0.98) 0%, 
      rgba(254, 243, 199, 0.9) 100%
    );
  }

  &__title {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;

  &__avatar {
    flex-shrink: 0;
  }

  &__details {
    flex: 1;
    text-align: left;
  }

  &__name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  &__email {
    color: #64748b;
    margin: 0 0 0.25rem 0;
  }

  &__join-date {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
  }
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.points-overview {
  &__main {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
}

.points-total {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);
  flex: 1;
  min-width: 200px;

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__value {
    color: #d97706;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  }

  &__label {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }
}

.points-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-width: 150px;
}

.points-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__value {
    color: #d97706;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  &__label {
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }
}

.points-achievements {
  margin-bottom: 2rem;

  &__title {
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.3);
  opacity: 0.5;
  transition: all 0.2s;

  &--unlocked {
    opacity: 1;
    border-color: rgba(217, 119, 6, 0.3);
    background: linear-gradient(135deg, 
      rgba(255, 251, 235, 0.98) 0%, 
      rgba(254, 243, 199, 0.9) 100%
    );
  }

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #d97706, #f59e0b);
    color: white;
  }

  &__content {
    flex: 1;
  }

  &__name {
    display: block;
    color: #1e293b;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  &__description {
    display: block;
    color: #64748b;
    font-size: 0.75rem;
  }
}

.points-history {
  &__title {
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  &__date {
    color: #64748b;
    font-size: 0.75rem;
    white-space: nowrap;
    min-width: 60px;
  }

  &__task {
    flex: 1;
    color: #1e293b;
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__points {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #d97706;
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
  }
}

.points-icon {
  color: #d97706;
  flex-shrink: 0;
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
    color: #1e293b;
    margin-bottom: 0.5rem;
    cursor: pointer;
  }

  &__description {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0;
  }
}

.setting-select {
  padding: 0.5rem 0.75rem;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  color: #1e293b;
  font-size: 0.875rem;
  min-width: 120px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

.toggle-switch {
  appearance: none;
  width: 48px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:checked {
    background: #4f46e5;
  }

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::before {
    transform: translateX(24px);
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
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #4f46e5;
    margin-bottom: 0.25rem;
  }

  &__label {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
  }

  &--secondary {
    background: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background: #4b5563;
    }
  }

  &--warning {
    background: #f59e0b;
    color: white;

    &:hover:not(:disabled) {
      background: #d97706;
    }
  }

  &--danger {
    background: #ef4444;
    color: white;

    &:hover:not(:disabled) {
      background: #dc2626;
    }
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(30, 41, 59, 0.1);
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@include respond-to(mobile) {
  .settings-page {
    padding: 6rem 0.5rem 2rem 0.5rem;
    
    &__content {
      padding: 0.75rem;
    }
  }
  
  .settings-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>