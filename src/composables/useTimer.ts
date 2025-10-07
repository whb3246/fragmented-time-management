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
  
  // 音频相关状态
  const enableSound = ref(true) // 是否启用声音
  const volume = ref(0.2) // 音量大小 (0-1)，降低默认音量
  
  let intervalId: number | null = null
  let audioContext: AudioContext | null = null

  /**
   * 创建Web Audio API上下文
   */
  const createAudioContext = (): AudioContext | null => {
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
      return null
    }
  }

  /**
   * 生成滴答声音效果
   * 使用更舒适的音频参数，模拟真实时钟的滴答声
   */
  const playTickSound = (): void => {
    if (!enableSound.value || volume.value === 0) return

    if (!audioContext) {
      audioContext = createAudioContext()
    }

    if (!audioContext) return

    try {
      // 创建两个振荡器产生更自然的滴答声（双音调效果）
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const filterNode = audioContext.createBiquadFilter()

      // 连接音频节点
      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(filterNode)
      filterNode.connect(audioContext.destination)

      // 设置更舒适的滴答声参数
      // 主音调：使用更温和的500Hz频率
      oscillator1.frequency.setValueAtTime(500, audioContext.currentTime)
      oscillator1.type = 'triangle' // 三角波更柔和
      
      // 辅助音调：添加轻微的高频成分增加清脆感
      oscillator2.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator2.type = 'sine'

      // 添加低通滤波器，去除刺耳的高频
      filterNode.type = 'lowpass'
      filterNode.frequency.setValueAtTime(1200, audioContext.currentTime)
      filterNode.Q.setValueAtTime(1, audioContext.currentTime)

      // 设置更柔和的音量包络
      const currentTime = audioContext.currentTime
      const peakVolume = volume.value * 0.25 // 降低默认音量
      const attackTime = 0.005 // 更快的起音
      const decayTime = 0.06 // 更短的衰减时间

      gainNode.gain.setValueAtTime(0, currentTime)
      // 快速上升到峰值
      gainNode.gain.linearRampToValueAtTime(peakVolume, currentTime + attackTime)
      // 平滑衰减
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + decayTime)

      // 播放声音（更短的持续时间）
      oscillator1.start(currentTime)
      oscillator1.stop(currentTime + decayTime)
      
      oscillator2.start(currentTime)
      oscillator2.stop(currentTime + decayTime)
    } catch (error) {
      console.warn('Failed to play tick sound:', error)
    }
  }

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
        // 播放滴答声
        playTickSound()
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
   * 切换声音开关
   */
  const toggleSound = (): void => {
    enableSound.value = !enableSound.value
  }

  /**
   * 设置音量
   */
  const setVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume)) // 确保音量在0-1范围内
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
      actualRunTime: getActualRunTime(),
      enableSound: enableSound.value,
      volume: volume.value
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
    enableSound?: boolean
    volume?: number
  }): void => {
    totalDuration.value = state.totalDuration
    remainingTime.value = state.remainingTime
    startTime.value = state.startTime ? new Date(state.startTime) : null
    
    if (state.enableSound !== undefined) {
      enableSound.value = state.enableSound
    }
    if (state.volume !== undefined) {
      volume.value = state.volume
    }
    
    if (state.isRunning) {
      start()
    } else if (state.isPaused) {
      isPaused.value = true
    }
  }

  /**
   * 组件卸载时清理定时器和音频资源
   */
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
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
    
    // 音频状态
    enableSound: readonly(enableSound),
    volume: readonly(volume),
    
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
    
    // 音频控制方法
    toggleSound,
    setVolume,
    
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
  const getCurrentTimer = () => {
    return currentMode.value === 'work' ? workTimer : breakTimer
  }

  /**
   * 切换到下一个阶段
   */
  const switchToNextPhase = (): void => {
    if (currentMode.value === 'work') {
      completedPomodoros.value++
      
      // 每4个番茄钟后进行长休息
      if (completedPomodoros.value % 4 === 0) {
        isLongBreak.value = true
        breakTimer.setDuration(15 * 60) // 15分钟长休息
      } else {
        isLongBreak.value = false
        breakTimer.setDuration(breakDuration) // 5分钟短休息
      }
      
      currentMode.value = 'break'
      breakTimer.reset()
    } else {
      currentMode.value = 'work'
      workTimer.reset()
    }
  }

  /**
   * 跳过当前阶段
   */
  const skipCurrent = (): void => {
    if (currentMode.value === 'work') {
      workTimer.stop()
    } else {
      breakTimer.stop()
    }
    switchToNextPhase()
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

  return {
    // 计时器实例
    workTimer,
    breakTimer,
    
    // 番茄钟状态
    currentMode: readonly(currentMode),
    completedPomodoros: readonly(completedPomodoros),
    isLongBreak: readonly(isLongBreak),
    
    // 方法
    getCurrentTimer,
    switchToNextPhase,
    skipCurrent,
    resetPomodoro
  }
}