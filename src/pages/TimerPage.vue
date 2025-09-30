<template>
  <div class="timer-page">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="timer-page__back-btn" @click="goBack">
        <ArrowLeft class="timer-page__back-icon" />
        返回
      </button>

      <!-- 任务信息 -->
      <div class="timer-page__task-info" v-if="currentTask">
        <h1 class="timer-page__task-title">{{ currentTask.title }}</h1>
        <p class="timer-page__task-description">{{ currentTask.description }}</p>
      </div>

      <!-- 计时器主体 -->
      <div class="timer-container">
        <!-- 圆形进度条 -->
        <div class="timer-circle">
          <svg class="timer-circle__svg" viewBox="0 0 200 200">
            <circle
              class="timer-circle__background"
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="8"
            />
            <circle
              class="timer-circle__progress"
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#3b82f6"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              transform="rotate(-90 100 100)"
            />
          </svg>
          
          <!-- 时间显示 -->
          <div class="timer-display">
            <span class="timer-display__time">{{ formattedTime }}</span>
            <span class="timer-display__status">{{ statusText }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="timer-controls">
          <button
            v-if="!isRunning && !isPaused"
            class="timer-controls__btn timer-controls__btn--start"
            @click="startTimer"
          >
            <Play class="timer-controls__icon" />
            开始
          </button>
          
          <button
            v-if="isRunning"
            class="timer-controls__btn timer-controls__btn--pause"
            @click="pauseTimer"
          >
            <Pause class="timer-controls__icon" />
            暂停
          </button>
          
          <button
            v-if="isPaused"
            class="timer-controls__btn timer-controls__btn--resume"
            @click="resumeTimer"
          >
            <Play class="timer-controls__icon" />
            继续
          </button>
          
          <button
            v-if="isRunning || isPaused"
            class="timer-controls__btn timer-controls__btn--stop"
            @click="stopTimer"
          >
            <Square class="timer-controls__icon" />
            停止
          </button>
        </div>

        <!-- 任务步骤 -->
        <div class="timer-steps" v-if="currentTask?.steps && currentTask.steps.length > 0">
          <h3 class="timer-steps__title">任务步骤</h3>
          <ul class="timer-steps__list">
            <li
              v-for="(step, index) in currentTask.steps"
              :key="index"
              class="timer-steps__item"
            >
              {{ step }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 完成对话框 -->
      <div v-if="showCompletionDialog" class="completion-dialog">
        <div class="completion-dialog__content">
          <h2 class="completion-dialog__title">🎉 任务完成！</h2>
          <p class="completion-dialog__message">
            恭喜你完成了"{{ currentTask?.title }}"任务！
          </p>
          <p class="completion-dialog__time">
            用时：{{ Math.floor(actualDuration / 60) }}分{{ actualDuration % 60 }}秒
          </p>
          <div class="completion-dialog__actions">
            <button
              class="completion-dialog__btn completion-dialog__btn--primary"
              @click="saveTaskRecord"
            >
              保存记录
            </button>
            <button
              class="completion-dialog__btn completion-dialog__btn--secondary"
              @click="goHome"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Play, Pause, Square } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import DataService from '@/services/dataService'
import type { Task } from '@/lib/supabase'

/**
 * 计时器页面组件
 */

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const currentTask = ref<Task | null>(null)
const totalDuration = ref(0) // 总时长（秒）
const remainingTime = ref(0) // 剩余时间（秒）
const actualDuration = ref(0) // 实际用时（秒）
const isRunning = ref(false)
const isPaused = ref(false)
const showCompletionDialog = ref(false)
const startTime = ref<Date | null>(null)
const pausedTime = ref(0) // 暂停的总时长

let timerInterval: number | null = null

// 计算属性
const circumference = 2 * Math.PI * 90 // 圆周长
const progress = computed(() => {
  if (totalDuration.value === 0) return 0
  return (totalDuration.value - remainingTime.value) / totalDuration.value
})

const strokeDashoffset = computed(() => {
  return circumference * (1 - progress.value)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const statusText = computed(() => {
  if (isRunning.value) return '专注中...'
  if (isPaused.value) return '已暂停'
  if (remainingTime.value === 0) return '已完成'
  return '准备开始'
})

/**
 * 获取任务信息
 * 统一从数据库获取任务数据，不区分游客模式和登录用户
 */
const fetchTask = async () => {
  try {
    const taskId = route.params.taskId as string
    const duration = parseInt(route.query.duration as string) || 25
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()
    
    if (error) {
      console.error('获取任务失败:', error)
      return
    }
    
    currentTask.value = data
    totalDuration.value = duration * 60 // 转换为秒
    remainingTime.value = totalDuration.value
  } catch (error) {
    console.error('获取任务出错:', error)
  }
}

/**
 * 开始计时器
 */
const startTimer = () => {
  isRunning.value = true
  isPaused.value = false
  startTime.value = new Date()
  
  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      actualDuration.value++
    } else {
      completeTimer()
    }
  }, 1000)
}

/**
 * 暂停计时器
 */
const pauseTimer = () => {
  isRunning.value = false
  isPaused.value = true
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

/**
 * 继续计时器
 */
const resumeTimer = () => {
  isRunning.value = true
  isPaused.value = false
  
  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      actualDuration.value++
    } else {
      completeTimer()
    }
  }, 1000)
}

/**
 * 停止计时器
 */
const stopTimer = () => {
  isRunning.value = false
  isPaused.value = false
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  // 重置时间
  remainingTime.value = totalDuration.value
  actualDuration.value = 0
}

/**
 * 完成计时器
 */
const completeTimer = () => {
  isRunning.value = false
  isPaused.value = false
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  showCompletionDialog.value = true
}

/**
 * 保存任务记录
 */
const saveTaskRecord = async () => {
  try {
    if (!currentTask.value) return
    
    const taskRecord = {
      task_id: currentTask.value.id,
      task_title: currentTask.value.title,
      task_description: currentTask.value.description || '',
      planned_duration: Math.floor(totalDuration.value / 60), // 转换为分钟
      actual_duration: Math.floor(actualDuration.value / 60), // 转换为分钟
      status: 'completed' as const,
      started_at: startTime.value?.toISOString() || new Date().toISOString(),
      completed_at: new Date().toISOString()
    }
    
    // 使用 DataService 保存任务记录，自动适配游客模式和登录用户
    await DataService.addTaskRecord(taskRecord)
    
    goHome()
  } catch (error) {
    console.error('保存任务记录出错:', error)
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 返回首页
 */
const goHome = () => {
  router.push({ name: 'home' })
}

// 组件挂载时获取任务信息
onMounted(() => {
  fetchTask()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style lang="scss" scoped>
.timer-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  
  &__back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: background-color 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  &__back-icon {
    width: 1rem;
    height: 1rem;
  }
  
  &__task-info {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  &__task-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  &__task-description {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.timer-container {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.timer-circle {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 3rem;
  
  &__svg {
    width: 100%;
    height: 100%;
  }
  
  &__progress {
    transition: stroke-dashoffset 1s ease;
  }
}

.timer-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  &__time {
    display: block;
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  &__status {
    font-size: 1.1rem;
    opacity: 0.8;
  }
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  
  &__btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &--start {
      background-color: #10b981;
      color: white;
      
      &:hover {
        background-color: #059669;
        transform: translateY(-2px);
      }
    }
    
    &--pause {
      background-color: #f59e0b;
      color: white;
      
      &:hover {
        background-color: #d97706;
        transform: translateY(-2px);
      }
    }
    
    &--resume {
      background-color: #3b82f6;
      color: white;
      
      &:hover {
        background-color: #2563eb;
        transform: translateY(-2px);
      }
    }
    
    &--stop {
      background-color: #ef4444;
      color: white;
      
      &:hover {
        background-color: #dc2626;
        transform: translateY(-2px);
      }
    }
  }
  
  &__icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.timer-steps {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  
  &__title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  &__list {
    list-style: none;
    padding: 0;
  }
  
  &__item {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    &:last-child {
      border-bottom: none;
    }
    
    &::before {
      content: '•';
      margin-right: 0.5rem;
      color: #10b981;
    }
  }
}

.completion-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  &__content {
    background: white;
    color: #1e293b;
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    max-width: 400px;
    margin: 1rem;
  }
  
  &__title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  &__message {
    margin-bottom: 0.5rem;
    color: #64748b;
  }
  
  &__time {
    font-size: 1.1rem;
    font-weight: 600;
    color: #3b82f6;
    margin-bottom: 2rem;
  }
  
  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  &__btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &--primary {
      background-color: #3b82f6;
      color: white;
      
      &:hover {
        background-color: #2563eb;
      }
    }
    
    &--secondary {
      background-color: #f1f5f9;
      color: #64748b;
      
      &:hover {
        background-color: #e2e8f0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .timer-circle {
    width: 250px;
    height: 250px;
  }
  
  .timer-display__time {
    font-size: 2.5rem;
  }
  
  .timer-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .timer-controls__btn {
    width: 200px;
  }
}
</style>