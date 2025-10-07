<template>
  <div class="task-detail">
    <!-- 页面头部 -->
    <header class="task-detail__header">
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



// 生命周期
onMounted(() => {
  loadTask()
})
</script>

<style lang="scss" scoped>
@use '@/styles/utils/mixins' as *;
@use '@/styles/base/variables' as *;

.task-detail {
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
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(226, 232, 240, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__back-btn {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    backdrop-filter: blur(10px);
    border: 1px solid rgba(226, 232, 240, 0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    &:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 1) 0%, 
        rgba(248, 250, 252, 0.95) 100%
      );
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
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
    max-width: 600px;
    margin: 0 auto;
  }

  &__actions {
    margin-top: 2rem;
    text-align: center;
  }
}

.task-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);
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
  // 统一时间选择器样式，与其他页面保持一致
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.3);

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  &__options {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  &__option {
    background: linear-gradient(135deg, 
      rgba(248, 250, 252, 0.8) 0%, 
      rgba(241, 245, 249, 0.9) 100%
    );
    border: 2px solid rgba(226, 232, 240, 0.6);
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    font-weight: 500;
    backdrop-filter: blur(5px);

    &:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(248, 250, 252, 0.9) 100%
      );
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &--active {
      background: linear-gradient(135deg, 
        rgba(99, 102, 241, 0.1) 0%, 
        rgba(139, 92, 246, 0.05) 100%
      );
      border-color: rgba(99, 102, 241, 0.6);
      color: #4f46e5;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }
  }

  &__custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__label {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__input {
    padding: 0.5rem 0.75rem;
    border: 2px solid rgba(226, 232, 240, 0.6);
    border-radius: 8px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    color: #1e293b;
    font-size: 0.875rem;
    width: 100px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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