import { LocalStorageService } from './localStorageService'
import DataService from './dataService'
import { useAuthStore } from '@/stores/auth'
import type { TaskRecord, UserPreference } from './localStorageService'

/**
 * 数据迁移服务
 * 负责将游客模式的 localStorage 数据迁移到数据库
 */
export class MigrationService {
  /**
   * 检查是否有游客数据需要迁移
   * @returns 是否有数据需要迁移
   */
  hasGuestDataToMigrate(): boolean {
    return LocalStorageService.hasGuestData()
  }

  /**
   * 获取游客数据统计信息
   * @returns 游客数据统计
   */
  getGuestDataSummary(): {
    taskRecords: number
    totalTime: number
    hasPreferences: boolean
  } {
    const guestData = LocalStorageService.getGuestData()
    
    return {
      taskRecords: guestData.taskRecords.length,
      totalTime: guestData.taskRecords.reduce((sum, record) => 
        sum + (record.actual_duration || 0), 0
      ),
      hasPreferences: Object.keys(guestData.userPreferences).length > 0
    }
  }

  /**
   * 执行数据迁移
   * 将 localStorage 中的游客数据迁移到数据库
   * @returns 迁移结果
   */
  async migrateGuestData(): Promise<{
    success: boolean
    migratedRecords: number
    migratedPreferences: boolean
    error?: string
  }> {
    try {
      const authStore = useAuthStore()
      
      // 检查用户是否已登录
      if (!authStore.isAuthenticated || authStore.isGuestMode) {
        throw new Error('用户未登录，无法执行数据迁移')
      }

      // 获取游客数据
      const guestData = LocalStorageService.getGuestData()
      
      if (guestData.taskRecords.length === 0 && Object.keys(guestData.userPreferences).length === 0) {
        return {
          success: true,
          migratedRecords: 0,
          migratedPreferences: false
        }
      }

      let migratedRecords = 0
      let migratedPreferences = false

      // 迁移任务记录
      for (const record of guestData.taskRecords) {
        try {
          await DataService.addTaskRecord(record)
          migratedRecords++
        } catch (error) {
          console.warn('迁移任务记录失败:', record.id, error)
          // 继续迁移其他记录，不中断整个过程
        }
      }

      // 迁移用户偏好设置
      if (Object.keys(guestData.userPreferences).length > 0) {
        try {
          await DataService.updateUserPreferences(guestData.userPreferences)
          migratedPreferences = true
        } catch (error) {
          console.warn('迁移用户偏好设置失败:', error)
        }
      }

      // 迁移成功后清除 localStorage 数据
      LocalStorageService.clearGuestData()

      return {
        success: true,
        migratedRecords,
        migratedPreferences
      }

    } catch (error) {
      console.error('数据迁移失败:', error)
      return {
        success: false,
        migratedRecords: 0,
        migratedPreferences: false,
        error: error instanceof Error ? error.message : '数据迁移失败'
      }
    }
  }

  /**
   * 清除游客数据
   * 用于用户选择不迁移数据的情况
   */
  clearGuestData(): void {
    LocalStorageService.clearGuestData()
  }

  /**
   * 导出游客数据
   * 用于用户备份数据
   * @returns 游客数据的 JSON 字符串
   */
  exportGuestData(): string {
    return JSON.stringify(LocalStorageService.exportGuestData())
  }

  /**
   * 自动迁移检查
   * 在用户登录后自动检查并提示是否需要迁移数据
   * @returns 是否需要显示迁移提示
   */
  shouldShowMigrationPrompt(): boolean {
    const authStore = useAuthStore()
    
    // 只有在用户刚登录且有游客数据时才显示提示
    return authStore.isAuthenticated && 
           !authStore.isGuestMode && 
           this.hasGuestDataToMigrate()
  }

  /**
   * 静默迁移
   * 在后台自动迁移数据，不显示提示
   * 适用于数据量较少的情况
   */
  async silentMigration(): Promise<boolean> {
    const summary = this.getGuestDataSummary()
    
    // 只有在数据量较少时才执行静默迁移
    if (summary.taskRecords <= 5 && summary.totalTime <= 300) {
      const result = await this.migrateGuestData()
      return result.success
    }
    
    return false
  }
}

// 导出单例实例
export const migrationService = new MigrationService()