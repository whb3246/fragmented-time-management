/**
 * localStorage 数据管理服务
 * 为游客模式提供本地数据存储功能
 */

export interface TaskRecord {
  id: string
  task_id?: string
  task_title: string
  task_description: string
  planned_duration: number
  actual_duration?: number
  status: 'started' | 'paused' | 'completed' | 'cancelled'
  started_at: string
  completed_at?: string
  created_at: string
}

export interface UserPreference {
  id: string
  preferred_categories: string[]
  difficulty_preference: 'easy' | 'medium' | 'hard'
  notifications_enabled: boolean
  updated_at: string
}

export interface GuestData {
  taskRecords: TaskRecord[]
  userPreferences: UserPreference
  lastSync: string
  expiresAt: string
}

/**
 * localStorage 键名常量
 */
const STORAGE_KEYS = {
  GUEST_DATA: 'fragment_time_guest_data',
  TASK_RECORDS: 'fragment_time_task_records',
  USER_PREFERENCES: 'fragment_time_user_preferences'
} as const

/**
 * localStorage 数据管理服务类
 */
export class LocalStorageService {
  /**
   * 获取游客数据
   * 检查数据是否过期，过期则清除并返回默认数据
   */
  static getGuestData(): GuestData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUEST_DATA)
      if (data) {
        const guestData = JSON.parse(data)
        
        // 检查数据是否过期
        if (guestData.expiresAt && new Date(guestData.expiresAt) < new Date()) {
          console.log('游客数据已过期，清除本地数据')
          this.clearGuestData()
          return this.getDefaultGuestData()
        }
        
        // 兼容旧数据：如果没有expiresAt字段，添加默认过期时间
        if (!guestData.expiresAt) {
          guestData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          this.saveGuestData(guestData)
        }
        
        return guestData
      }
    } catch (error) {
      console.error('获取游客数据失败:', error)
      // 数据损坏时清除并返回默认数据
      this.clearGuestData()
    }
    
    return this.getDefaultGuestData()
  }

  /**
   * 获取默认游客数据
   */
  private static getDefaultGuestData(): GuestData {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    
    return {
      taskRecords: [],
      userPreferences: {
        id: 'guest-preferences',
        preferred_categories: [],
        difficulty_preference: 'medium',
        notifications_enabled: true,
        updated_at: now.toISOString()
      },
      lastSync: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }
  }

  /**
   * 保存游客数据
   * 自动设置7天后的过期时间
   */
  static saveGuestData(data: GuestData): void {
    try {
      const now = new Date()
      data.lastSync = now.toISOString()
      
      // 如果没有过期时间或过期时间已过，重新设置7天后过期
      if (!data.expiresAt || new Date(data.expiresAt) <= now) {
        data.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      localStorage.setItem(STORAGE_KEYS.GUEST_DATA, JSON.stringify(data))
    } catch (error) {
      console.error('保存游客数据失败:', error)
    }
  }

  /**
   * 获取任务记录列表
   */
  static getTaskRecords(): TaskRecord[] {
    const guestData = this.getGuestData()
    return guestData.taskRecords
  }

  /**
   * 添加任务记录
   */
  static addTaskRecord(record: Omit<TaskRecord, 'id' | 'created_at'>): TaskRecord {
    const guestData = this.getGuestData()
    const newRecord: TaskRecord = {
      ...record,
      id: `guest-record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    }
    
    guestData.taskRecords.push(newRecord)
    this.saveGuestData(guestData)
    
    return newRecord
  }

  /**
   * 更新任务记录
   */
  static updateTaskRecord(id: string, updates: Partial<TaskRecord>): TaskRecord | null {
    const guestData = this.getGuestData()
    const recordIndex = guestData.taskRecords.findIndex(record => record.id === id)
    
    if (recordIndex === -1) {
      return null
    }
    
    guestData.taskRecords[recordIndex] = {
      ...guestData.taskRecords[recordIndex],
      ...updates
    }
    
    this.saveGuestData(guestData)
    return guestData.taskRecords[recordIndex]
  }

  /**
   * 删除任务记录
   */
  static deleteTaskRecord(id: string): boolean {
    const guestData = this.getGuestData()
    const initialLength = guestData.taskRecords.length
    
    guestData.taskRecords = guestData.taskRecords.filter(record => record.id !== id)
    
    if (guestData.taskRecords.length < initialLength) {
      this.saveGuestData(guestData)
      return true
    }
    
    return false
  }

  /**
   * 获取用户偏好设置
   */
  static getUserPreferences(): UserPreference {
    const guestData = this.getGuestData()
    return guestData.userPreferences
  }

  /**
   * 更新用户偏好设置
   */
  static updateUserPreferences(updates: Partial<UserPreference>): UserPreference {
    const guestData = this.getGuestData()
    
    guestData.userPreferences = {
      ...guestData.userPreferences,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    this.saveGuestData(guestData)
    return guestData.userPreferences
  }

  /**
   * 获取任务统计数据
   */
  static getTaskStats() {
    const records = this.getTaskRecords()
    const completedRecords = records.filter(record => record.status === 'completed')
    
    return {
      totalTasks: records.length,
      completedTasks: completedRecords.length,
      totalTime: completedRecords.reduce((sum, record) => sum + (record.actual_duration || 0), 0),
      averageTime: completedRecords.length > 0 
        ? Math.round(completedRecords.reduce((sum, record) => sum + (record.actual_duration || 0), 0) / completedRecords.length)
        : 0
    }
  }

  /**
   * 清除所有游客数据
   */
  static clearGuestData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GUEST_DATA)
      localStorage.removeItem(STORAGE_KEYS.TASK_RECORDS)
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
    } catch (error) {
      console.error('清除游客数据失败:', error)
    }
  }

  /**
   * 检查是否有游客数据
   */
  static hasGuestData(): boolean {
    const guestData = this.getGuestData()
    return guestData.taskRecords.length > 0
  }

  /**
   * 导出游客数据（用于数据迁移）
   */
  static exportGuestData(): GuestData {
    return this.getGuestData()
  }
}

export default LocalStorageService