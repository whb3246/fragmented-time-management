<template>
  <div class="task-detail">
    <!-- 页面头部 -->
    <header class="task-detail__header">
      <button 
        class="task-detail__back-btn"
        @click="goBack"
        aria-label="返回"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="task-detail__title">任务详情</h1>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="task-detail__loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="task-detail__error">
      <p>{{ error }}</p>
      <button class="btn btn--primary" @click="loadTask">重试</button>
    </div>

    <!-- 任务内容 -->
    <div v-else-if="task" class="task-detail__content">
      <!-- 任务基本信息 -->
      <div class="task-card">
        <div class="task-card__header">
          <div class="task-card__category" :style="{ backgroundColor: task.category?.color }">
            {{ task.category?.name }}
          </div>
          <div class="task-card__difficulty task-card__difficulty--{{ task.difficulty }}">
            {{ getDifficultyText(task.difficulty) }}
          </div>
        </div>
        
        <h2 class="task-card__title">{{ task.title }}</h2>
        <p class="task-card__description">{{ task.description }}</p>
        
        <div class="task-card__meta">
          <div class="task-card__duration">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {{ task.duration }} 分钟
          </div>
        </div>
      </div>

      <!-- 任务步骤 -->
      <div class="task-steps" v-if="task.steps && task.steps.length > 0">
        <h3 class="task-steps__title">任务步骤</h3>
        <ol class="task-steps__list">
          <li 
            v-for="(step, index) in task.steps" 
            :key="index"
            class="task-steps__item"
          >
            <span class="task-steps__number">{{ index + 1 }}</span>
            <span class="task-steps__text">{{ step }}</span>
          </li>
        </ol>
      </div>

      <!-- 时间选择 -->
      <div class="time-selector">
        <h3 class="time-selector__title">选择执行时间</h3>
        <div class="time-selector__options">
          <button
            v-for="duration in suggestedDurations"
            :key="duration"
            class="time-selector__option"
            :class="{ 'time-selector__option--active': selectedDuration === duration }"
            @click="selectedDuration = duration"
          >
            {{ duration }} 分钟
          </button>
        </div>
        
        <div class="time-selector__custom">
          <label for="custom-duration" class="time-selector__label">
            自定义时间（分钟）：
          </label>
          <input
            id="custom-duration"
            v-model.number="customDuration"
            type="number"
            min="1"
            max="120"
            class="time-selector__input"
            @input="onCustomDurationChange"
          />
        </div>
      </div>

      <!-- 开始按钮 -->
      <div class="task-detail__actions">
        <button 
          class="btn btn--primary btn--large"
          @click="startTask"
          :disabled="!selectedDuration"
        >
          开始任务 ({{ selectedDuration }} 分钟)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

// 类型定义
interface TaskCategory {
  id: string
  name: string
  color: string
  icon: string
}

interface Task {
  id: string
  title: string
  description: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  steps: string[]
  category?: TaskCategory
}

// 路由和状态
const route = useRoute()
const router = useRouter()
const taskId = route.params.id as string

// 响应式数据
const task = ref<Task | null>(null)
const loading = ref(true)
const error = ref('')
const selectedDuration = ref<number>(0)
const customDuration = ref<number>(0)

// 计算属性
const suggestedDurations = computed(() => {
  if (!task.value) return []
  
  const { duration } = task.value
  const durations = []
  
  // 基于任务的标准时长提供建议选项
  durations.push(duration)
  
  // 提供一些灵活的时间选择
  if (duration >= 10) {
    durations.push(Math.max(5, duration - 5))
  }
  if (duration <= 60) {
    durations.push(duration + 5)
  }
  
  return [...new Set(durations)].sort((a, b) => a - b)
})

/**
 * 获取难度等级的中文文本
 * @param difficulty 难度等级
 * @returns 中文难度描述
 */
const getDifficultyText = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || '未知'
}

/**
 * 加载任务详情数据
 */
const loadTask = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''
    
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        category:task_categories(*)
      `)
      .eq('id', taskId)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    if (!data) {
      throw new Error('任务不存在')
    }
    
    task.value = data
    
    // 设置默认选中时间为推荐时间的第一个
    if (suggestedDurations.value.length > 0) {
      selectedDuration.value = suggestedDurations.value[0]
    }
    
  } catch (err) {
    console.error('加载任务失败:', err)
    error.value = err instanceof Error ? err.message : '加载任务失败'
  } finally {
    loading.value = false
  }
}

/**
 * 处理自定义时间输入变化
 */
const onCustomDurationChange = (): void => {
  if (customDuration.value > 0 && customDuration.value <= 120) {
    selectedDuration.value = customDuration.value
  }
}

/**
 * 开始执行任务
 */
const startTask = (): void => {
  if (!task.value || !selectedDuration.value) return
  
  // 跳转到计时器页面
  router.push({
    name: 'Timer',
    params: { taskId: task.value.id },
    query: { duration: selectedDuration.value.toString() }
  })
}

/**
 * 返回上一页
 */
const goBack = (): void => {
  router.back()
}

// 生命周期
onMounted(() => {
  loadTask()
})
</script>

<style lang="scss" scoped>
@import '@/styles/utils/mixins';
@import '@/styles/base/variables';

.task-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;

  @include respond-to(tablet) {
    padding: 2rem;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    color: white;
  }

  &__back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &__title {
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
    min-height: 200px;
    color: white;
    text-align: center;
  }

  &__content {
    max-width: 600px;
    margin: 0 auto;
  }

  &__actions {
    margin-top: 2rem;
    text-align: center;
  }
}

.task-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__category {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__difficulty {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;

    &--easy {
      background: #d1fae5;
      color: #065f46;
    }

    &--medium {
      background: #fef3c7;
      color: #92400e;
    }

    &--hard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  &__description {
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__duration {
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
}

.task-steps {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.75rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__number {
    background: #3b82f6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  &__text {
    color: #374151;
    line-height: 1.5;
    padding-top: 0.125rem;
  }
}

.time-selector {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
  }

  &__options {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  &__option {
    background: #f3f4f6;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;

    &:hover {
      background: #e5e7eb;
    }

    &--active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  }

  &__custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__label {
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__input {
    border: 2px solid #d1d5db;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    width: 80px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
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

  &--large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  &--primary {
    background: #3b82f6;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }
}
</style>