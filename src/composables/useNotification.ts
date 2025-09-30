import { ref, readonly } from 'vue'

/**
 * 通知权限状态
 */
type NotificationPermission = 'default' | 'granted' | 'denied'

/**
 * 通知选项
 */
interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

/**
 * 通知组合式函数
 * 提供浏览器通知功能的封装
 */
export function useNotification() {
  const permission = ref<NotificationPermission>('default')
  const isSupported = ref(false)

  /**
   * 检查浏览器是否支持通知
   */
  const checkSupport = (): boolean => {
    isSupported.value = 'Notification' in window
    return isSupported.value
  }

  /**
   * 获取当前通知权限状态
   */
  const getPermission = (): NotificationPermission => {
    if (!checkSupport()) return 'denied'
    
    permission.value = Notification.permission as NotificationPermission
    return permission.value
  }

  /**
   * 请求通知权限
   */
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!checkSupport()) {
      permission.value = 'denied'
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      permission.value = 'granted'
      return 'granted'
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result as NotificationPermission
      return permission.value
    } catch (error) {
      console.error('请求通知权限失败:', error)
      permission.value = 'denied'
      return 'denied'
    }
  }

  /**
   * 显示通知
   */
  const showNotification = async (options: NotificationOptions): Promise<Notification | null> => {
    // 检查支持性
    if (!checkSupport()) {
      console.warn('浏览器不支持通知功能')
      return null
    }

    // 检查权限
    const currentPermission = getPermission()
    if (currentPermission !== 'granted') {
      console.warn('没有通知权限')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate
      })

      return notification
    } catch (error) {
      console.error('显示通知失败:', error)
      return null
    }
  }

  /**
   * 显示任务开始通知
   */
  const showTaskStartNotification = async (taskTitle: string, duration: number): Promise<Notification | null> => {
    return await showNotification({
      title: '任务开始',
      body: `开始执行"${taskTitle}"，预计用时 ${Math.round(duration / 60)} 分钟`,
      icon: '/icons/task-start.png',
      tag: 'task-start',
      requireInteraction: false
    })
  }

  /**
   * 显示任务完成通知
   */
  const showTaskCompleteNotification = async (taskTitle: string, actualDuration: number): Promise<Notification | null> => {
    return await showNotification({
      title: '任务完成！',
      body: `恭喜完成"${taskTitle}"，实际用时 ${Math.round(actualDuration / 60)} 分钟`,
      icon: '/icons/task-complete.png',
      tag: 'task-complete',
      requireInteraction: true,
      vibrate: [200, 100, 200]
    })
  }

  /**
   * 显示任务暂停通知
   */
  const showTaskPauseNotification = async (taskTitle: string): Promise<Notification | null> => {
    return await showNotification({
      title: '任务已暂停',
      body: `"${taskTitle}"已暂停，记得回来继续哦`,
      icon: '/icons/task-pause.png',
      tag: 'task-pause',
      requireInteraction: false
    })
  }

  /**
   * 显示时间提醒通知
   */
  const showTimeReminderNotification = async (remainingMinutes: number): Promise<Notification | null> => {
    return await showNotification({
      title: '时间提醒',
      body: `还剩 ${remainingMinutes} 分钟，继续加油！`,
      icon: '/icons/time-reminder.png',
      tag: 'time-reminder',
      requireInteraction: false
    })
  }

  /**
   * 显示休息提醒通知
   */
  const showBreakReminderNotification = async (): Promise<Notification | null> => {
    return await showNotification({
      title: '该休息了',
      body: '你已经专注了很久，是时候休息一下了',
      icon: '/icons/break-reminder.png',
      tag: 'break-reminder',
      requireInteraction: true
    })
  }

  /**
   * 关闭指定标签的通知
   */
  const closeNotificationByTag = (tag: string): void => {
    // 注意：由于浏览器限制，无法直接关闭其他通知
    // 这个方法主要用于记录和管理通知状态
    console.log(`尝试关闭标签为 ${tag} 的通知`)
  }

  /**
   * 初始化通知功能
   */
  const initialize = async (): Promise<boolean> => {
    if (!checkSupport()) {
      console.warn('浏览器不支持通知功能')
      return false
    }

    const currentPermission = getPermission()
    if (currentPermission === 'default') {
      const newPermission = await requestPermission()
      return newPermission === 'granted'
    }

    return currentPermission === 'granted'
  }

  // 初始化检查
  checkSupport()
  getPermission()

  return {
    // 状态
    permission: readonly(permission),
    isSupported: readonly(isSupported),
    
    // 权限管理
    checkSupport,
    getPermission,
    requestPermission,
    initialize,
    
    // 通用通知
    showNotification,
    
    // 特定场景通知
    showTaskStartNotification,
    showTaskCompleteNotification,
    showTaskPauseNotification,
    showTimeReminderNotification,
    showBreakReminderNotification,
    
    // 工具方法
    closeNotificationByTag
  }
}

/**
 * 声音通知组合式函数
 * 提供音频提醒功能
 */
export function useAudioNotification() {
  const isEnabled = ref(true)
  const volume = ref(0.5)

  /**
   * 播放音频文件
   */
  const playAudio = async (audioPath: string, customVolume?: number): Promise<void> => {
    if (!isEnabled.value) return

    try {
      const audio = new Audio(audioPath)
      audio.volume = customVolume ?? volume.value
      await audio.play()
    } catch (error) {
      console.error('播放音频失败:', error)
    }
  }

  /**
   * 播放任务开始音效
   */
  const playTaskStartSound = async (): Promise<void> => {
    await playAudio('/sounds/task-start.mp3')
  }

  /**
   * 播放任务完成音效
   */
  const playTaskCompleteSound = async (): Promise<void> => {
    await playAudio('/sounds/task-complete.mp3')
  }

  /**
   * 播放暂停音效
   */
  const playPauseSound = async (): Promise<void> => {
    await playAudio('/sounds/pause.mp3', 0.3)
  }

  /**
   * 播放恢复音效
   */
  const playResumeSound = async (): Promise<void> => {
    await playAudio('/sounds/resume.mp3', 0.3)
  }

  /**
   * 播放提醒音效
   */
  const playReminderSound = async (): Promise<void> => {
    await playAudio('/sounds/reminder.mp3')
  }

  /**
   * 设置音量
   */
  const setVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  /**
   * 切换音效开关
   */
  const toggleEnabled = (): void => {
    isEnabled.value = !isEnabled.value
  }

  return {
    // 状态
    isEnabled: readonly(isEnabled),
    volume: readonly(volume),
    
    // 控制方法
    setVolume,
    toggleEnabled,
    
    // 播放方法
    playAudio,
    playTaskStartSound,
    playTaskCompleteSound,
    playPauseSound,
    playResumeSound,
    playReminderSound
  }
}