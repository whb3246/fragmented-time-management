<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <header class="home-page__header">
      <div class="container">
        <h1 class="home-page__title">碎片时间管理器</h1>
        <p class="home-page__subtitle">让每一分钟都有意义</p>
        
        <!-- 积分显示区域 - 仅注册用户可见 -->
        <div v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="points-display">
          <div class="points-display__item">
            <svg class="points-display__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="points-display__label">总积分</span>
            <span class="points-display__value">{{ userPointsStats?.total_points || 0 }}</span>
          </div>
          <div class="points-display__item">
            <svg class="points-display__icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="points-display__label">本周积分</span>
            <span class="points-display__value">{{ userPointsStats?.weekly_points || 0 }}</span>
          </div>
        </div>
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
              <!-- 积分显示 - 仅注册用户可见 -->
              <div v-if="!authStore.isGuestMode && authStore.isAuthenticated" class="task-card__points">
                <svg class="task-card__points-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="task-card__points-value">{{ task.duration }}积分</span>
              </div>
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
import { PointsService } from '@/services/pointsService'
import type { Task } from '@/lib/supabase'
import type { UserPointsStats } from '@/types/database'

/**
 * 首页组件 - 时间选择和任务推荐
 */

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const selectedTime = ref<number>(0)
const customTime = ref<number>(15)
const recommendedTasks = ref<Task[]>([])
const loading = ref(false)
const userPointsStats = ref<UserPointsStats | null>(null)

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

/**
 * 获取用户积分统计
 */
const getUserPointsStats = async () => {
  if (authStore.isGuestMode || !authStore.isAuthenticated) {
    return
  }
  
  try {
    const stats = await PointsService.getUserStats(authStore.userId!)
    userPointsStats.value = stats
  } catch (error) {
    console.error('获取用户积分统计失败:', error)
  }
}

// 组件挂载时的初始化
onMounted(async () => {
  // 获取用户积分统计
  await getUserPointsStats()
})

// 监听认证状态变化
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated && !authStore.isGuestMode) {
    await getUserPointsStats()
  } else {
    userPointsStats.value = null
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  // 优化整体背景，创造更自然的过渡
  background: linear-gradient(180deg, 
    rgba(248, 250, 252, 0.3) 0%, 
    rgba(255, 255, 255, 0.95) 15%, 
    rgba(248, 250, 252, 0.2) 100%
  );
  
  &__header {
    // 移除强烈的渐变背景，使用柔和的半透明背景与导航栏协调
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 50%,
      rgba(241, 245, 249, 0.95) 100%
    );
    // 添加毛玻璃效果，与导航栏保持一致
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #1e293b;
    padding: 6rem 0 4rem; // 增加顶部padding，避免与导航栏重叠
    text-align: center;
    // 添加柔和的底部过渡
    position: relative;
    // 添加微妙的边框
    border-bottom: 1px solid rgba(226, 232, 240, 0.3);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0) 0%, 
        rgba(248, 250, 252, 0.5) 100%
      );
    }
  }
  
  &__title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    // 调整文字颜色，使其更协调
    color: #0f172a;
    // 移除文字阴影，使用更清晰的显示
    text-shadow: none;
  }
  
  &__subtitle {
    font-size: 1.2rem;
    opacity: 0.7;
    margin-bottom: 2rem;
    color: #475569;
    text-shadow: none;
  }
  
  &__nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
  
  &__time-selector {
    padding: 3rem 0 4rem; // 减少顶部padding，创造更自然的间距
    // 使用更柔和的背景色，与整体渐变协调
    background: linear-gradient(180deg, 
      rgba(248, 250, 252, 0.3) 0%, 
      rgba(255, 255, 255, 0.8) 50%,
      rgba(248, 250, 252, 0.2) 100%
    );
    // 移除硬边界
    border: none;
  }
  
  &__recommendations {
    padding: 3rem 0 4rem; // 调整间距
    // 添加柔和的背景过渡
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(248, 250, 252, 0.2) 100%
    );
  }
  
  &__quick-start {
    padding: 3rem 0;
    // 优化背景色，使用更柔和的渐变
    background: linear-gradient(180deg, 
      rgba(241, 245, 249, 0.3) 0%, 
      rgba(248, 250, 252, 0.5) 100%
    );
    text-align: center;
    // 移除硬边界
    border: none;
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
    // 添加柔和的文字效果
    font-weight: 600;
  }
  
  &__options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  &__option {
    padding: 1.5rem 1rem;
    // 使用更柔和的边框和背景
    border: 2px solid rgba(226, 232, 240, 0.6);
    border-radius: 16px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%, 
      rgba(248, 250, 252, 0.8) 100%
    );
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    // 添加柔和的阴影
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    &:hover {
      border-color: rgba(59, 130, 246, 0.6);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 1) 0%, 
        rgba(239, 246, 255, 0.9) 100%
      );
    }
    
    &--active {
      border-color: rgba(59, 130, 246, 0.8);
      background: linear-gradient(135deg, 
        rgba(239, 246, 255, 0.95) 0%, 
        rgba(219, 234, 254, 0.8) 100%
      );
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
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
    margin-top: 1.5rem;
  }
  
  &__custom-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  &__custom-input {
    padding: 0.75rem;
    border: 1px solid rgba(209, 213, 219, 0.6);
    border-radius: 8px;
    width: 80px;
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.recommendations {
  &__title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
    color: #1e293b;
    font-weight: 600;
  }
  
  &__loading {
    text-align: center;
    padding: 3rem 0;
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
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
  // 优化卡片背景和阴影，与整体设计保持一致
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(248, 250, 252, 0.9) 100%
  );
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  // 添加柔和的边框
  border: 1px solid rgba(226, 232, 240, 0.4);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 1) 0%, 
      rgba(239, 246, 255, 0.95) 100%
    );
    border-color: rgba(59, 130, 246, 0.3);
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
    background: linear-gradient(135deg, 
      rgba(239, 246, 255, 0.95) 0%, 
      rgba(219, 234, 254, 0.9) 100%
    );
    color: #3b82f6;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    align-self: flex-start;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }
  
  &__description {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  &__difficulty {
    font-size: 0.9rem;
    color: #64748b;
    padding: 0.25rem 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &__points {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  &__points-icon {
    color: #F59E0B;
    flex-shrink: 0;
  }
  
  &__points-value {
    font-size: 0.85rem;
    font-weight: bold;
    color: #F59E0B;
  }
  
  &__start-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
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
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%, 
      rgba(248, 250, 252, 0.9) 100%
    );
    color: #3b82f6;
    text-decoration: none;
    border-radius: 8px;
    border: 1px solid rgba(226, 232, 240, 0.5);
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(239, 246, 255, 0.95) 0%, 
        rgba(219, 234, 254, 0.8) 100%
      );
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
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

.points-display {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 158, 11, 0.2);
  
  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  &__icon {
    color: #F59E0B;
    flex-shrink: 0;
  }
  
  &__label {
    font-size: 0.9rem;
    color: #92400e;
    font-weight: 500;
  }
  
  &__value {
    font-size: 18px;
    font-weight: bold;
    color: #F59E0B;
    min-width: 2rem;
    text-align: center;
  }
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