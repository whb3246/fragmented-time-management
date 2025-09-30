<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <header class="home-page__header">
      <div class="container">
        <h1 class="home-page__title">碎片时间管理器</h1>
        <p class="home-page__subtitle">让每一分钟都有意义</p>
      </div>
    </header>

    <!-- 时间选择器区域 -->
    <section class="home-page__time-selector">
      <div class="container">
        <div class="time-selector">
          <h2 class="time-selector__title">你有多少时间？</h2>
          <div class="time-selector__options">
            <button
              v-for="option in timeOptions"
              :key="option.value"
              :class="[
                'time-selector__option',
                { 'time-selector__option--active': selectedTime === option.value }
              ]"
              @click="selectTime(option.value)"
            >
              <span class="time-selector__option-time">{{ option.label }}</span>
              <span class="time-selector__option-desc">{{ option.description }}</span>
            </button>
          </div>
          
          <!-- 自定义时间输入 -->
          <div class="time-selector__custom">
            <label class="time-selector__custom-label">
              自定义时间（分钟）：
              <input
                v-model.number="customTime"
                type="number"
                min="1"
                max="120"
                class="time-selector__custom-input"
                @input="selectTime(customTime)"
              />
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 任务推荐区域 -->
    <section class="home-page__recommendations" v-if="selectedTime">
      <div class="container">
        <h2 class="recommendations__title">
          为你推荐 {{ selectedTime }} 分钟的任务
        </h2>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="recommendations__loading">
          <div class="loading-spinner"></div>
          <p>正在为你寻找合适的任务...</p>
        </div>
        
        <!-- 推荐任务列表 -->
        <div v-else-if="recommendedTasks.length > 0" class="recommendations__grid">
          <div
            v-for="task in recommendedTasks"
            :key="task.id"
            class="task-card"
            @click="startTask(task)"
          >
            <div class="task-card__header">
              <h3 class="task-card__title">{{ task.title }}</h3>
              <div class="task-card__category" v-if="task.task_categories">
                <span 
                  class="category-badge"
                  :style="{ backgroundColor: task.task_categories.color }"
                >
                  {{ task.task_categories.name }}
                </span>
              </div>
              <span class="task-card__duration">
                {{ task.duration }}分钟
              </span>
            </div>
            <p class="task-card__description">{{ task.description }}</p>
            <div class="task-card__footer">
              <span class="task-card__difficulty">{{ getDifficultyText(task.difficulty) }}</span>
              <button class="task-card__start-btn">开始任务</button>
            </div>
          </div>
        </div>
        
        <!-- 无推荐任务 -->
        <div v-else class="recommendations__empty">
          <div v-if="useAuthStore().isGuestMode" class="guest-mode-notice">
            <h3>游客模式提示</h3>
            <p>当前时间段暂无合适的任务。</p>
            <p>请尝试其他时间长度，或<router-link to="/login" class="login-link">登录</router-link>获得更多任务选择。</p>
          </div>
          <div v-else>
            <p>暂时没有找到合适的任务，试试其他时间长度吧！</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始区域 -->
    <section class="home-page__quick-start" v-if="!selectedTime">
      <div class="container">
        <h2 class="quick-start__title">或者直接开始</h2>
        <div class="quick-start__actions">
          <router-link to="/history" class="quick-start__link">
            查看历史记录
          </router-link>
          <router-link to="/settings" class="quick-start__link">
            个人设置
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Task } from '@/lib/supabase'

/**
 * 首页组件 - 时间选择和任务推荐
 */

const router = useRouter()

// 响应式数据
const selectedTime = ref<number>(0)
const customTime = ref<number>(15)
const recommendedTasks = ref<Task[]>([])
const loading = ref(false)

// 预设时间选项
const timeOptions = [
  { value: 5, label: '5分钟', description: '快速任务' },
  { value: 15, label: '15分钟', description: '短时专注' },
  { value: 25, label: '25分钟', description: '番茄工作法' },
  { value: 45, label: '45分钟', description: '深度工作' },
]



/**
 * 选择时间
 * @param time 选择的时间（分钟）
 */
const selectTime = (time: number) => {
  if (time > 0 && time <= 120) {
    selectedTime.value = time
  }
}

/**
 * 获取推荐任务
 * 根据精确时长匹配任务
 * @param duration 时间长度
 */
const getRecommendedTasks = async (duration: number) => {
  try {
    loading.value = true
    
    // 精确匹配任务时长
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_categories (
          name,
          color,
          icon
        )
      `)
      .eq('duration', duration)
      .eq('is_active', true)
      .limit(6)
    
    if (error) {
      console.error('获取推荐任务失败:', error)
      recommendedTasks.value = []
      return
    }
    
    recommendedTasks.value = data || []
  } catch (error) {
    console.error('获取推荐任务出错:', error)
    recommendedTasks.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 开始任务
 * @param task 选择的任务
 */
const startTask = (task: Task) => {
  router.push({
    name: 'timer',
    params: { taskId: task.id },
    query: { duration: selectedTime.value.toString() }
  })
}

/**
 * 获取难度文本
 * @param difficulty 难度级别
 */
const getDifficultyText = (difficulty: string) => {
  const difficultyMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || '中等'
}

// 监听选择时间变化
watch(selectedTime, (newTime) => {
  if (newTime > 0) {
    getRecommendedTasks(newTime)
  }
})

// 组件挂载时的初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  
  &__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0 3rem;
    text-align: center;
  }
  
  &__title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  &__subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }
  
  &__nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
  
  &__time-selector {
    padding: 3rem 0;
    background-color: #f8fafc;
  }
  
  &__recommendations {
    padding: 3rem 0;
  }
  
  &__quick-start {
    padding: 2rem 0;
    background-color: #f1f5f9;
    text-align: center;
  }
}



.time-selector {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  
  &__title {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: #1e293b;
  }
  
  &__options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  &__option {
    padding: 1.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    
    &--active {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
  }
  
  &__option-time {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  
  &__option-desc {
    font-size: 0.875rem;
    color: #64748b;
  }
  
  &__custom {
    margin-top: 1rem;
  }
  
  &__custom-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  &__custom-input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    width: 80px;
    text-align: center;
  }
}

.recommendations {
  &__title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: #1e293b;
  }
  
  &__loading {
    text-align: center;
    padding: 3rem 0;
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  &__empty {
    text-align: center;
    padding: 3rem 0;
    color: #64748b;
  }
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  &__title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  &__category {
    display: flex;
    align-items: center;
  }
  
  &__duration {
    background-color: #eff6ff;
    color: #3b82f6;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    align-self: flex-start;
  }
  
  &__description {
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__difficulty {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  &__start-btn {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #2563eb;
    }
  }
}

.quick-start {
  &__title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #374151;
  }
  
  &__actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  &__link {
    padding: 0.75rem 1.5rem;
    background-color: white;
    color: #3b82f6;
    text-decoration: none;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f9fafb;
      border-color: #3b82f6;
    }
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.category-badge {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
  .home-page__title {
    font-size: 2rem;
  }
  
  .time-selector__options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recommendations__grid {
    grid-template-columns: 1fr;
  }
  
  .quick-start__actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>