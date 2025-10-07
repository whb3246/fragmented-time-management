<template>
  <div class="timer-page">
    <div class="container">


      <!-- 任务信息 -->
      <div class="timer-page__task-info" v-if="currentTask">
        <h1 class="timer-page__task-title">{{ currentTask.title }}</h1>
        <p class="timer-page__task-description">{{ currentTask.description }}</p>
        
        <!-- 积分显示区域 - 仅注册用户可见 -->
        <div v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="timer-points-display">
          <div class="timer-points-display__item">
            <svg class="timer-points-display__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="timer-points-display__label">当前已获得积分</span>
            <span class="timer-points-display__value">{{ currentEarnedPoints }}</span>
          </div>
          <div class="timer-points-display__item">
            <svg class="timer-points-display__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="timer-points-display__label">预期总积分</span>
            <span class="timer-points-display__value">{{ Math.floor(totalDuration / 60) }}</span>
          </div>
        </div>
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
            <span class="timer-display__time">{{ formattedRemainingTime }}</span>
            <span class="timer-display__status">{{ statusText }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="timer-controls">
          <button
            v-if="!isRunning && !isPaused"
            class="timer-controls__btn timer-controls__btn--start"
            @click="handleStart"
          >
            <Play class="timer-controls__icon" />
            开始
          </button>
          
          <button
            v-if="isRunning"
            class="timer-controls__btn timer-controls__btn--pause"
            @click="pause"
          >
            <Pause class="timer-controls__icon" />
            暂停
          </button>
          
          <button
            v-if="isPaused"
            class="timer-controls__btn timer-controls__btn--resume"
            @click="resume"
          >
            <Play class="timer-controls__icon" />
            继续
          </button>
          
          <button
            v-if="isRunning || isPaused"
            class="timer-controls__btn timer-controls__btn--stop"
            @click="handleStop"
          >
            <Square class="timer-controls__icon" />
            停止
          </button>
        </div>

        <!-- 音频控制 -->
        <div class="timer-audio-controls">
          <button
            class="timer-audio-controls__btn"
            @click="toggleSound"
            :class="{ 'timer-audio-controls__btn--active': enableSound }"
          >
            {{ enableSound ? '🔊' : '🔇' }} 声音
          </button>
          <div class="timer-audio-controls__volume">
            <label>音量:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="volume"
              @input="handleVolumeChange"
              class="timer-audio-controls__slider"
            />
          </div>
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
            用时：{{ formattedElapsedTime }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Play, Pause, Square } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import DataService from '@/services/dataService'
import { useTimer } from '@/composables/useTimer'
import { PointsService } from '@/services/pointsService'
import type { Task } from '@/lib/supabase'

/**
 * 计时器页面组件
 */

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const currentTask = ref<Task | null>(null)
const showCompletionDialog = ref(false)

// 使用 useTimer 组合式函数
const {
  totalDuration,
  remainingTime,
  elapsedTime,
  progress,
  isRunning,
  isPaused,
  isCompleted,
  startTime,
  enableSound,
  volume,
  formattedRemainingTime,
  formattedElapsedTime,
  start,
  pause,
  resume,
  stop,
  reset,
  setDuration,
  toggleSound,
  setVolume
} = useTimer()

// 计算属性
const circumference = 2 * Math.PI * 90 // 圆周长

const strokeDashoffset = computed(() => {
  return circumference * (1 - progress.value / 100)
})

const statusText = computed(() => {
  if (isRunning.value) return '专注中...'
  if (isPaused.value) return '已暂停'
  if (isCompleted.value) return '已完成'
  return '准备开始'
})

/**
 * 计算当前已获得积分
 */
const currentEarnedPoints = computed(() => {
  if (authStore.isGuestMode || !authStore.isAuthenticated) {
    return 0
  }
  return Math.floor(elapsedTime.value / 60) // 每分钟1积分
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
    // 设置计时器时长
    setDuration(duration * 60) // 转换为秒
  } catch (error) {
    console.error('获取任务出错:', error)
  }
}

/**
 * 开始计时器
 */
const handleStart = () => {
  start()
}

/**
 * 停止计时器
 */
const handleStop = () => {
  stop()
}

/**
 * 处理音量变化
 */
const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  setVolume(parseFloat(target.value))
}

/**
 * 保存任务记录
 */
const saveTaskRecord = async () => {
  try {
    if (!currentTask.value) return
    
    // 计算实际完成时间（分钟）
    const actualDurationMinutes = Math.floor(elapsedTime.value / 60)
    
    // 为注册用户计算积分（每分钟1积分）
    let pointsEarned = 0
    if (!authStore.isGuestMode && authStore.isAuthenticated) {
      pointsEarned = actualDurationMinutes
    }
    
    const taskRecord = {
      task_id: currentTask.value.id,
      task_title: currentTask.value.title,
      task_description: currentTask.value.description || '',
      planned_duration: Math.floor(totalDuration.value / 60), // 转换为分钟
      actual_duration: actualDurationMinutes, // 转换为分钟
      status: 'completed' as const,
      started_at: startTime.value?.toISOString() || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      points_earned: pointsEarned // 添加积分字段
    }
    
    // 使用 DataService 保存任务记录，自动适配游客模式和登录用户
    await DataService.addTaskRecord(taskRecord)
    
    goHome()
  } catch (error) {
    console.error('保存任务记录出错:', error)
  }
}



/**
 * 返回首页
 */
const goHome = () => {
  router.push({ name: 'home' })
}

// 监听计时器完成状态
watch(isCompleted, (completed) => {
  if (completed) {
    showCompletionDialog.value = true
  }
})

// 组件挂载时获取任务信息
onMounted(() => {
  fetchTask()
})
</script>

<style lang="scss" scoped>
@use '@/styles/utils/mixins' as *;

.timer-page {
  min-height: 100vh;
  // 优化整体背景，与导航栏协调
  background: linear-gradient(180deg, 
    rgba(248, 250, 252, 0.3) 0%, 
    rgba(255, 255, 255, 0.95) 15%, 
    rgba(248, 250, 252, 0.2) 100%
  );
  padding: 1rem;
  display: flex;
  flex-direction: column;

  @include respond-to(tablet) {
    padding: 2rem;
  }

  &__back-btn {
    position: fixed;
    top: 6rem; // 调整位置，避免与导航栏重叠
    left: 1rem;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    backdrop-filter: blur(10px);
    border: 1px solid rgba(226, 232, 240, 0.3);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    z-index: 10;

    &:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 1) 0%, 
        rgba(248, 250, 252, 0.95) 100%
      );
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    @include respond-to(tablet) {
      left: 2rem;
    }
  }

  &__task-info {
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
    text-align: center;
    border: 1px solid rgba(226, 232, 240, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__task-title {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;

    @include respond-to(tablet) {
      font-size: 2rem;
    }
  }

  &__task-description {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
    line-height: 1.5;
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
  margin-bottom: 2rem;
  
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

.timer-audio-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  
  &__btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    &--active {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.2);
    }
  }
  
  &__volume {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
  
  &__slider {
    width: 100px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #10b981;
      border-radius: 50%;
      cursor: pointer;
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #10b981;
      border-radius: 50%;
      border: none;
      cursor: pointer;
    }
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
  
  .timer-audio-controls {
    flex-direction: column;
    gap: 1rem;
  }
}
}

.timer-points-display {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  
  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  &__icon {
    color: #F59E0B;
    flex-shrink: 0;
  }
  
  &__label {
    font-size: 0.85rem;
    color: #92400e;
    font-weight: 500;
  }
  
  &__value {
    font-size: 18px;
    font-weight: bold;
    color: #F59E0B;
    min-width: 1.5rem;
    text-align: center;
  }
}
</style>