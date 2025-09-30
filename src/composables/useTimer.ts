import { ref, computed, onUnmounted, readonly } from 'vue'

/**
 * 计时器组合式函数
 * 提供计时器的核心功能：开始、暂停、重置、时间格式化等
 */
export function useTimer(initialDuration: number = 0) {
  // 响应式状态
  const totalDuration = ref(initialDuration) // 总时长（秒）
  const remainingTime = ref(initialDuration) // 剩余时间（秒）
  const isRunning = ref(false) // 是否正在运行
  const isPaused = ref(false) // 是否已暂停
  const startTime = ref<Date | null>(null) // 开始时间
  const pausedTime = ref(0) // 暂停的总时长
  
  let intervalId: number | null = null

  /**
   * 计算进度百分比
   */
  const progress = computed(() => {
    if (totalDuration.value === 0) return 0
    return ((totalDuration.value - remainingTime.value) / totalDuration.value) * 100
  })

  /**
   * 计算已用时间
   */
  const elapsedTime = computed(() => {
    return totalDuration.value - remainingTime.value
  })

  /**
   * 检查是否已完成
   */
  const isCompleted = computed(() => {
    return remainingTime.value <= 0 && totalDuration.value > 0
  })

  /**
   * 格式化时间显示（MM:SS）
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 格式化剩余时间
   */
  const formattedRemainingTime = computed(() => {
    return formatTime(remainingTime.value)
  })

  /**
   * 格式化已用时间
   */
  const formattedElapsedTime = computed(() => {
    return formatTime(elapsedTime.value)
  })

  /**
   * 格式化总时长
   */
  const formattedTotalDuration = computed(() => {
    return formatTime(totalDuration.value)
  })

  /**
   * 开始计时器
   */
  const start = (): void => {
    if (isRunning.value) return

    isRunning.value = true
    isPaused.value = false
    
    if (!startTime.value) {
      startTime.value = new Date()
    }

    intervalId = window.setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        // 计时器完成
        stop()
      }
    }, 1000)
  }

  /**
   * 暂停计时器
   */
  const pause = (): void => {
    if (!isRunning.value) return

    isRunning.value = false
    isPaused.value = true

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * 恢复计时器
   */
  const resume = (): void => {
    if (isRunning.value || !isPaused.value) return
    start()
  }

  /**
   * 停止计时器
   */
  const stop = (): void => {
    isRunning.value = false
    isPaused.value = false

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * 重置计时器
   */
  const reset = (newDuration?: number): void => {
    stop()
    
    if (newDuration !== undefined) {
      totalDuration.value = newDuration
      remainingTime.value = newDuration
    } else {
      remainingTime.value = totalDuration.value
    }
    
    startTime.value = null
    pausedTime.value = 0
  }

  /**
   * 设置新的时长
   */
  const setDuration = (duration: number): void => {
    totalDuration.value = duration
    remainingTime.value = duration
    startTime.value = null
    pausedTime.value = 0
  }

  /**
   * 添加时间
   */
  const addTime = (seconds: number): void => {
    remainingTime.value += seconds
    totalDuration.value += seconds
  }

  /**
   * 减少时间
   */
  const subtractTime = (seconds: number): void => {
    const newRemaining = remainingTime.value - seconds
    const newTotal = totalDuration.value - seconds
    
    if (newRemaining >= 0 && newTotal >= 0) {
      remainingTime.value = newRemaining
      totalDuration.value = newTotal
    }
  }

  /**
   * 获取实际运行时间（排除暂停时间）
   */
  const getActualRunTime = (): number => {
    if (!startTime.value) return 0
    
    const now = new Date()
    const totalElapsed = Math.floor((now.getTime() - startTime.value.getTime()) / 1000)
    return Math.max(0, totalElapsed - pausedTime.value)
  }

  /**
   * 获取计时器状态信息
   */
  const getTimerState = () => {
    return {
      totalDuration: totalDuration.value,
      remainingTime: remainingTime.value,
      elapsedTime: elapsedTime.value,
      progress: progress.value,
      isRunning: isRunning.value,
      isPaused: isPaused.value,
      isCompleted: isCompleted.value,
      startTime: startTime.value,
      actualRunTime: getActualRunTime()
    }
  }

  /**
   * 从状态恢复计时器
   */
  const restoreFromState = (state: {
    totalDuration: number
    remainingTime: number
    isRunning: boolean
    isPaused: boolean
    startTime: string | null
  }): void => {
    totalDuration.value = state.totalDuration
    remainingTime.value = state.remainingTime
    startTime.value = state.startTime ? new Date(state.startTime) : null
    
    if (state.isRunning) {
      start()
    } else if (state.isPaused) {
      isPaused.value = true
    }
  }

  /**
   * 组件卸载时清理定时器
   */
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return {
    // 状态
    totalDuration: readonly(totalDuration),
    remainingTime: readonly(remainingTime),
    elapsedTime,
    progress,
    isRunning: readonly(isRunning),
    isPaused: readonly(isPaused),
    isCompleted,
    startTime: readonly(startTime),
    
    // 格式化时间
    formattedRemainingTime,
    formattedElapsedTime,
    formattedTotalDuration,
    formatTime,
    
    // 控制方法
    start,
    pause,
    resume,
    stop,
    reset,
    setDuration,
    addTime,
    subtractTime,
    
    // 工具方法
    getActualRunTime,
    getTimerState,
    restoreFromState
  }
}

/**
 * 番茄钟计时器组合式函数
 * 基于 useTimer 扩展，添加番茄钟特有的功能
 */
export function usePomodoroTimer(workDuration: number = 25 * 60, breakDuration: number = 5 * 60) {
  const workTimer = useTimer(workDuration)
  const breakTimer = useTimer(breakDuration)
  
  const currentMode = ref<'work' | 'break'>('work')
  const completedPomodoros = ref(0)
  const isLongBreak = ref(false)
  
  /**
   * 获取当前活动的计时器
   */
  const currentTimer = computed(() => {
    return currentMode.value === 'work' ? workTimer : breakTimer
  })

  /**
   * 开始工作时间
   */
  const startWork = (): void => {
    currentMode.value = 'work'
    breakTimer.stop()
    workTimer.start()
  }

  /**
   * 开始休息时间
   */
  const startBreak = (isLong: boolean = false): void => {
    currentMode.value = 'break'
    isLongBreak.value = isLong
    workTimer.stop()
    
    // 设置休息时长（长休息通常是15-30分钟）
    const duration = isLong ? 15 * 60 : breakDuration
    breakTimer.setDuration(duration)
    breakTimer.start()
  }

  /**
   * 完成一个番茄钟
   */
  const completePomodoro = (): void => {
    completedPomodoros.value++
    
    // 每4个番茄钟后进行长休息
    const shouldLongBreak = completedPomodoros.value % 4 === 0
    startBreak(shouldLongBreak)
  }

  /**
   * 重置番茄钟
   */
  const resetPomodoro = (): void => {
    workTimer.reset()
    breakTimer.reset()
    currentMode.value = 'work'
    completedPomodoros.value = 0
    isLongBreak.value = false
  }

  /**
   * 跳过当前阶段
   */
  const skipCurrent = (): void => {
    if (currentMode.value === 'work') {
      completePomodoro()
    } else {
      startWork()
    }
  }

  return {
    // 计时器实例
    workTimer,
    breakTimer,
    currentTimer,
    
    // 状态
    currentMode: readonly(currentMode),
    completedPomodoros: readonly(completedPomodoros),
    isLongBreak: readonly(isLongBreak),
    
    // 控制方法
    startWork,
    startBreak,
    completePomodoro,
    resetPomodoro,
    skipCurrent
  }
}