<template>
  <div class="history">
    <!-- 页面头部 -->
    <header class="history__header">
      <h1 class="history__title">历史记录</h1>
      <div class="history__stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ totalTasks }}</div>
          <div class="stat-card__label">完成任务</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ totalMinutes }}</div>
          <div class="stat-card__label">总时长(分钟)</div>
        </div>
        <!-- 积分统计卡片 - 仅注册用户可见 -->
        <div v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="stat-card stat-card--points">
          <div class="stat-card__value">
            <svg class="points-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {{ totalPoints }}
          </div>
          <div class="stat-card__label">总积分</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ streakDays }}</div>
          <div class="stat-card__label">连续天数</div>
        </div>
      </div>
    </header>

    <!-- 积分统计图表 - 仅注册用户可见 -->
    <div v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="history__points-section">
      <div class="points-stats">
        <h2 class="points-stats__title">积分统计</h2>
        <div class="points-stats__cards">
          <div class="points-card">
            <div class="points-card__header">
              <svg class="points-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>本周积分</span>
            </div>
            <div class="points-card__value">{{ weeklyPoints }}</div>
          </div>
          <div class="points-card">
            <div class="points-card__header">
              <svg class="points-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>本月积分</span>
            </div>
            <div class="points-card__value">{{ monthlyPoints }}</div>
          </div>
          <div class="points-card">
            <div class="points-card__header">
              <svg class="points-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>平均每日</span>
            </div>
            <div class="points-card__value">{{ averageDailyPoints }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="history__filters">
      <div class="filter-group">
        <label class="filter-group__label">时间范围：</label>
        <select v-model="selectedPeriod" class="filter-group__select" @change="loadHistory()">
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="quarter">最近三月</option>
          <option value="all">全部</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-group__label">任务状态：</label>
        <select v-model="selectedStatus" class="filter-group__select" @change="loadHistory()">
          <option value="all">全部</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="history__loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="history__error">
      <p>{{ error }}</p>
      <button class="btn btn--primary" @click="loadHistory()">重试</button>
    </div>

    <!-- 历史记录列表 -->
    <div v-else class="history__content">
      <!-- 空状态 -->
      <div v-if="records.length === 0" class="history__empty">
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h3>暂无记录</h3>
          <p>开始你的第一个任务吧！</p>
          <router-link to="/" class="btn btn--primary">开始任务</router-link>
        </div>
      </div>

      <!-- 记录列表 -->
      <div v-else class="history__list">
        <div 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
          :class="`record-card--${record.status}`"
        >
          <div class="record-card__header">
            <div class="record-card__task-info">
              <h3 class="record-card__title">{{ record.task_title || '未知任务' }}</h3>
              <div class="record-card__category" v-if="record.task?.category">
                <span 
                  class="category-badge"
                  :style="{ backgroundColor: record.task.category.color }"
                >
                  {{ record.task.category.name }}
                </span>
              </div>
            </div>
            <div class="record-card__status">
              <span class="status-badge" :class="`status-badge--${record.status}`">
                {{ getStatusText(record.status) }}
              </span>
            </div>
          </div>

          <div class="record-card__details">
            <div class="record-card__time">
              <div class="time-info">
                <span class="time-info__label">计划时长：</span>
                <span class="time-info__value">{{ record.planned_duration }} 分钟</span>
              </div>
              <div class="time-info" v-if="record.actual_duration">
                <span class="time-info__label">实际时长：</span>
                <span class="time-info__value">{{ record.actual_duration }} 分钟</span>
              </div>
              <!-- 积分显示 - 仅注册用户且任务已完成时显示 -->
              <div 
                v-if="!authStore.isGuestMode && authStore.isAuthenticated && record.status === 'completed' && record.points_earned" 
                class="time-info time-info--points"
              >
                <span class="time-info__label">获得积分：</span>
                <span class="time-info__value time-info__points">
                  <svg class="points-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {{ record.points_earned }}
                </span>
              </div>
            </div>
            
            <div class="record-card__date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(record.started_at) }}
            </div>
          </div>

          <!-- 完成率进度条 -->
          <div class="record-card__progress" v-if="record.status === 'completed' && record.actual_duration">
            <div class="progress-bar">
              <div 
                class="progress-bar__fill"
                :style="{ width: `${getCompletionRate(record)}%` }"
              ></div>
            </div>
            <span class="progress-text">
              完成率: {{ getCompletionRate(record) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="hasMore" class="history__pagination">
        <button 
          class="btn btn--secondary"
          @click="loadMore"
          :disabled="loadingMore"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DataService from '@/services/dataService'
import { PointsService } from '@/services/pointsService'
import type { TaskRecord } from '@/types/database'

// 类型定义
interface TaskCategory {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  category?: TaskCategory
}

interface TaskRecord {
  id: string
  planned_duration: number
  actual_duration?: number
  status: 'started' | 'paused' | 'completed' | 'cancelled'
  started_at: string
  completed_at?: string
  task?: Task
}

// 状态管理
const authStore = useAuthStore()

// 响应式数据
const records = ref<TaskRecord[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const selectedPeriod = ref('month')
const selectedStatus = ref('all')
const currentPage = ref(0)
const pageSize = 20
const hasMore = ref(true)

// 统计数据
const totalTasks = ref(0)
const totalMinutes = ref(0)
const streakDays = ref(0)

// 积分统计数据
const totalPoints = ref(0)
const weeklyPoints = ref(0)
const monthlyPoints = ref(0)
const averageDailyPoints = ref(0)

/**
 * 获取状态文本
 * @param status 任务状态
 * @returns 中文状态描述
 */
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    started: '已开始',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

/**
 * 计算任务完成率
 * @param record 任务记录
 * @returns 完成率百分比
 */
const getCompletionRate = (record: TaskRecord): number => {
  if (!record.actual_duration || record.planned_duration === 0) return 0
  return Math.min(Math.round((record.actual_duration / record.planned_duration) * 100), 100)
}

/**
 * 获取时间范围的开始日期
 * @param period 时间周期
 * @returns 开始日期
 */
const getStartDate = (period: string): Date => {
  const now = new Date()
  const startDate = new Date(now)
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    default:
      startDate.setFullYear(2020) // 设置一个很早的日期
  }
  
  return startDate
}

/**
 * 加载积分统计数据
 */
const loadPointsStats = async (): Promise<void> => {
  if (authStore.isGuestMode || !authStore.isAuthenticated) {
    return
  }

  try {
    const pointsService = new PointsService()
    
    // 获取总积分
    const userStats = await pointsService.getUserPointsStats()
    totalPoints.value = userStats?.total_points || 0
    weeklyPoints.value = userStats?.weekly_points || 0
    monthlyPoints.value = userStats?.monthly_points || 0
    
    // 计算平均每日积分
    const allRecords = await DataService.getTaskRecords()
    const completedRecords = allRecords.filter(record => record.status === 'completed')
    
    if (completedRecords.length > 0) {
      const uniqueDates = [...new Set(completedRecords.map(record => 
        new Date(record.started_at).toDateString()
      ))]
      
      if (uniqueDates.length > 0) {
        averageDailyPoints.value = Math.round(totalPoints.value / uniqueDates.length)
      }
    }
  } catch (err) {
    console.error('加载积分统计失败:', err)
  }
}

/**
 * 加载历史记录
 */
const loadHistory = async (reset = true): Promise<void> => {
  try {
    if (reset) {
      loading.value = true
      currentPage.value = 0
      records.value = []
      hasMore.value = true
    } else {
      loadingMore.value = true
    }
    
    error.value = ''
    
    // 使用 DataService 获取任务记录
    const allRecords = await DataService.getTaskRecords()
    
    // 根据筛选条件过滤数据
    let filteredRecords = allRecords
    
    // 时间范围筛选
    if (selectedPeriod.value !== 'all') {
      const startDate = getStartDate(selectedPeriod.value)
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.started_at) >= startDate
      )
    }
    
    // 状态筛选
    if (selectedStatus.value !== 'all') {
      filteredRecords = filteredRecords.filter(record => 
        record.status === selectedStatus.value
      )
    }
    
    // 分页处理
    const startIndex = currentPage.value * pageSize
    const endIndex = startIndex + pageSize
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)
    
    if (reset) {
      records.value = paginatedRecords
    } else {
      records.value.push(...paginatedRecords)
    }
    
    // 检查是否还有更多数据
    hasMore.value = endIndex < filteredRecords.length
    
    if (!reset) {
      currentPage.value++
    }
    
    // 加载统计数据
    if (reset) {
      await loadStats()
      await loadPointsStats()
    }
    
  } catch (err) {
    console.error('加载历史记录失败:', err)
    error.value = err instanceof Error ? err.message : '加载历史记录失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

/**
 * 加载更多记录
 */
const loadMore = (): void => {
  if (!hasMore.value || loadingMore.value) return
  currentPage.value++
  loadHistory(false)
}

/**
 * 加载统计数据
 */
const loadStats = async (): Promise<void> => {
  try {
    // 使用 DataService 获取统计数据
    const stats = await DataService.getTaskStats()
    
    totalTasks.value = stats.completedTasks
    totalMinutes.value = stats.totalTime
    
    // 计算连续天数
    const allRecords = await DataService.getTaskRecords()
    const completedRecords = allRecords.filter(record => record.status === 'completed')
    
    if (completedRecords.length > 0) {
      streakDays.value = calculateStreak(completedRecords.map(r => r.started_at))
    }
    
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

/**
 * 计算连续天数
 * @param dates 日期数组
 * @returns 连续天数
 */
const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0
  
  const uniqueDates = [...new Set(dates.map(date => new Date(date).toDateString()))]
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

// 生命周期
onMounted(() => {
  loadHistory()
})
</script>

<style lang="scss" scoped>
@use '@/styles/utils/mixins' as *;
@use '@/styles/base/variables' as *;

.history {
  min-height: 100vh;
  // 优化整体背景，与导航栏协调
  background: linear-gradient(180deg, 
    rgba(248, 250, 252, 0.3) 0%, 
    rgba(255, 255, 255, 0.95) 15%, 
    rgba(248, 250, 252, 0.2) 100%
  );
  padding: 1rem;

  @include respond-to(tablet) {
    padding: 2rem;
  }

  &__header {
    // 添加毛玻璃效果，与导航栏保持一致
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 50%,
      rgba(241, 245, 249, 0.95) 100%
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 6rem 2rem 2rem; // 增加顶部padding，避免与导航栏重叠
    margin-bottom: 2rem;
    border: 1px solid rgba(226, 232, 240, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__title {
    color: #1e293b;
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    text-align: center;

    @include respond-to(tablet) {
      font-size: 2.5rem;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  &__points-section {
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
  }

  &__filters {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.98) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(226, 232, 240, 0.3);
  }

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #1e293b;
    text-align: center;
  }

  &__content {
    max-width: 800px;
    margin: 0 auto;
  }

  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__pagination {
    text-align: center;
    margin-top: 2rem;
  }
}

.stat-card {
  // 统一统计卡片样式
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4f46e5;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &__label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }

  &--points {
    .stat-card__value {
      color: #d97706;
      font-weight: 700;
      font-size: 18px;
    }
  }
}

.points-stats {
  &__title {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
}

.points-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #d97706;
    font-weight: 600;
    font-size: 0.875rem;
  }

  &__value {
    color: #d97706;
    font-size: 18px;
    font-weight: 700;
  }
}

.points-icon {
  color: #d97706;
  flex-shrink: 0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
  }

  &__select {
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
}

.record-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &--completed {
    border-left: 4px solid #10b981;
  }

  &--cancelled {
    border-left: 4px solid #ef4444;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  &__task-info {
    flex: 1;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  &__category {
    margin-bottom: 0.5rem;
  }

  &__status {
    flex-shrink: 0;
  }

  &__details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__time {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.category-badge {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  &--completed {
    background: #d1fae5;
    color: #065f46;
  }

  &--cancelled {
    background: #fee2e2;
    color: #991b1b;
  }

  &--started,
  &--paused {
    background: #fef3c7;
    color: #92400e;
  }
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;

  &__label {
    color: #6b7280;
  }

  &__value {
    color: #1f2937;
    font-weight: 500;
  }

  &--points {
    .time-info__value {
      color: #d97706;
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  &__points {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background: #10b981;
    transition: width 0.3s ease;
  }
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: white;
  padding: 2rem;

  svg {
    margin-bottom: 1rem;
    opacity: 0.7;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0 0 1.5rem 0;
    opacity: 0.8;
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

.btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  &--primary {
    background: #3b82f6;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }

  &--secondary {
    background: #6b7280;

    &:hover:not(:disabled) {
      background: #4b5563;
    }
  }
}
</style>