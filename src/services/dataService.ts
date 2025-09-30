/**
 * 统一数据访问服务
 * 根据用户状态选择使用 localStorage 或 Supabase 存储
 */

import { supabase } from '@/lib/supabase'
import LocalStorageService, { type TaskRecord, type UserPreference } from './localStorageService'
import { useAuthStore } from '@/stores/auth'

/**
 * 数据存储适配器接口
 */
export interface DataAdapter {
  // 任务记录相关
  getTaskRecords(): Promise<TaskRecord[]>
  addTaskRecord(record: Omit<TaskRecord, 'id' | 'created_at'>): Promise<TaskRecord>
  updateTaskRecord(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null>
  deleteTaskRecord(id: string): Promise<boolean>
  
  // 用户偏好相关
  getUserPreferences(): Promise<UserPreference>
  updateUserPreferences(updates: Partial<UserPreference>): Promise<UserPreference>
  
  // 统计数据
  getTaskStats(): Promise<{
    totalTasks: number
    completedTasks: number
    totalTime: number
    averageTime: number
  }>
}

/**
 * localStorage 适配器
 */
class LocalStorageAdapter implements DataAdapter {
  async getTaskRecords(): Promise<TaskRecord[]> {
    return LocalStorageService.getTaskRecords()
  }

  async addTaskRecord(record: Omit<TaskRecord, 'id' | 'created_at'>): Promise<TaskRecord> {
    return LocalStorageService.addTaskRecord(record)
  }

  async updateTaskRecord(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null> {
    return LocalStorageService.updateTaskRecord(id, updates)
  }

  async deleteTaskRecord(id: string): Promise<boolean> {
    return LocalStorageService.deleteTaskRecord(id)
  }

  async getUserPreferences(): Promise<UserPreference> {
    return LocalStorageService.getUserPreferences()
  }

  async updateUserPreferences(updates: Partial<UserPreference>): Promise<UserPreference> {
    return LocalStorageService.updateUserPreferences(updates)
  }

  async getTaskStats() {
    return LocalStorageService.getTaskStats()
  }
}

/**
 * Supabase 适配器
 */
class SupabaseAdapter implements DataAdapter {
  async getTaskRecords(): Promise<TaskRecord[]> {
    const authStore = useAuthStore()
    if (!authStore.userId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('task_records')
      .select(`
        id,
        task_id,
        planned_duration,
        actual_duration,
        status,
        started_at,
        completed_at,
        created_at,
        tasks (
          title,
          description
        )
      `)
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // 转换数据格式
    return (data || []).map(record => ({
      id: record.id,
      task_id: record.task_id,
      task_title: (record.tasks as any)?.title || '未知任务',
      task_description: (record.tasks as any)?.description || '',
      planned_duration: record.planned_duration,
      actual_duration: record.actual_duration,
      status: record.status,
      started_at: record.started_at,
      completed_at: record.completed_at,
      created_at: record.created_at
    }))
  }

  async addTaskRecord(record: Omit<TaskRecord, 'id' | 'created_at'>): Promise<TaskRecord> {
    const authStore = useAuthStore()
    if (!authStore.userId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('task_records')
      .insert({
        user_id: authStore.userId,
        task_id: record.task_id,
        planned_duration: record.planned_duration,
        actual_duration: record.actual_duration,
        status: record.status,
        started_at: record.started_at,
        completed_at: record.completed_at
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      id: data.id,
      task_id: data.task_id,
      task_title: record.task_title,
      task_description: record.task_description,
      planned_duration: data.planned_duration,
      actual_duration: data.actual_duration,
      status: data.status,
      started_at: data.started_at,
      completed_at: data.completed_at,
      created_at: data.created_at
    }
  }

  async updateTaskRecord(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null> {
    const { data, error } = await supabase
      .from('task_records')
      .update({
        actual_duration: updates.actual_duration,
        status: updates.status,
        completed_at: updates.completed_at
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      task_id: data.task_id,
      task_title: updates.task_title || '未知任务',
      task_description: updates.task_description || '',
      planned_duration: data.planned_duration,
      actual_duration: data.actual_duration,
      status: data.status,
      started_at: data.started_at,
      completed_at: data.completed_at,
      created_at: data.created_at
    }
  }

  async deleteTaskRecord(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('task_records')
      .delete()
      .eq('id', id)

    return !error
  }

  async getUserPreferences(): Promise<UserPreference> {
    const authStore = useAuthStore()
    if (!authStore.userId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', authStore.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      // 创建默认偏好设置
      const defaultPreferences = {
        user_id: authStore.userId,
        preferred_categories: [],
        difficulty_preference: 'medium' as const,
        notifications_enabled: true
      }

      const { data: newData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return {
        id: newData.id,
        preferred_categories: newData.preferred_categories,
        difficulty_preference: newData.difficulty_preference,
        notifications_enabled: newData.notifications_enabled,
        updated_at: newData.updated_at
      }
    }

    return {
      id: data.id,
      preferred_categories: data.preferred_categories,
      difficulty_preference: data.difficulty_preference,
      notifications_enabled: data.notifications_enabled,
      updated_at: data.updated_at
    }
  }

  async updateUserPreferences(updates: Partial<UserPreference>): Promise<UserPreference> {
    const authStore = useAuthStore()
    if (!authStore.userId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        preferred_categories: updates.preferred_categories,
        difficulty_preference: updates.difficulty_preference,
        notifications_enabled: updates.notifications_enabled
      })
      .eq('user_id', authStore.userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      id: data.id,
      preferred_categories: data.preferred_categories,
      difficulty_preference: data.difficulty_preference,
      notifications_enabled: data.notifications_enabled,
      updated_at: data.updated_at
    }
  }

  async getTaskStats() {
    const authStore = useAuthStore()
    if (!authStore.userId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('task_records')
      .select('status, actual_duration')
      .eq('user_id', authStore.userId)

    if (error) {
      throw error
    }

    const records = data || []
    const completedRecords = records.filter(record => record.status === 'completed')
    const totalTime = completedRecords.reduce((sum, record) => sum + (record.actual_duration || 0), 0)

    return {
      totalTasks: records.length,
      completedTasks: completedRecords.length,
      totalTime,
      averageTime: completedRecords.length > 0 ? Math.round(totalTime / completedRecords.length) : 0
    }
  }
}

/**
 * 数据服务类
 */
export class DataService {
  private static localStorageAdapter = new LocalStorageAdapter()
  private static supabaseAdapter = new SupabaseAdapter()

  /**
   * 获取当前适配器
   */
  private static getCurrentAdapter(): DataAdapter {
    const authStore = useAuthStore()
    return authStore.isGuestMode ? this.localStorageAdapter : this.supabaseAdapter
  }

  /**
   * 获取任务记录列表
   */
  static async getTaskRecords(): Promise<TaskRecord[]> {
    const adapter = this.getCurrentAdapter()
    return adapter.getTaskRecords()
  }

  /**
   * 添加任务记录
   */
  static async addTaskRecord(record: Omit<TaskRecord, 'id' | 'created_at'>): Promise<TaskRecord> {
    const adapter = this.getCurrentAdapter()
    return adapter.addTaskRecord(record)
  }

  /**
   * 更新任务记录
   */
  static async updateTaskRecord(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null> {
    const adapter = this.getCurrentAdapter()
    return adapter.updateTaskRecord(id, updates)
  }

  /**
   * 删除任务记录
   */
  static async deleteTaskRecord(id: string): Promise<boolean> {
    const adapter = this.getCurrentAdapter()
    return adapter.deleteTaskRecord(id)
  }

  /**
   * 获取用户偏好设置
   */
  static async getUserPreferences(): Promise<UserPreference> {
    const adapter = this.getCurrentAdapter()
    return adapter.getUserPreferences()
  }

  /**
   * 更新用户偏好设置
   */
  static async updateUserPreferences(updates: Partial<UserPreference>): Promise<UserPreference> {
    const adapter = this.getCurrentAdapter()
    return adapter.updateUserPreferences(updates)
  }

  /**
   * 获取任务统计数据
   */
  static async getTaskStats() {
    const adapter = this.getCurrentAdapter()
    return adapter.getTaskStats()
  }
}

export default DataService