import { supabase } from '@/lib/supabase'
import type { UserPreferences } from '@/types/database'

/**
 * 用户服务类 - 处理用户相关的数据库操作
 */
export class UserService {
  /**
   * 获取用户偏好设置
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 用户偏好不存在，返回默认设置
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('获取用户偏好失败:', error)
      throw new Error('获取用户偏好失败')
    }
  }

  /**
   * 创建或更新用户偏好设置
   */
  static async upsertUserPreferences(
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserPreferences> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新用户偏好失败:', error)
      throw new Error('更新用户偏好失败')
    }
  }

  /**
   * 获取用户的默认偏好设置
   */
  static getDefaultPreferences(): Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
      preferred_categories: [],
      difficulty_preference: 'medium',
      notifications_enabled: true,
      task_reminder: true,
      completion_celebration: true,
      default_duration: 25,
      theme_color: 'blue',
      auto_pause: true
    }
  }

  /**
   * 初始化新用户的偏好设置
   */
  static async initializeUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const defaultPreferences = this.getDefaultPreferences()
      return await this.upsertUserPreferences(userId, defaultPreferences)
    } catch (error) {
      console.error('初始化用户偏好失败:', error)
      throw new Error('初始化用户偏好失败')
    }
  }

  /**
   * 更新单个偏好设置
   */
  static async updatePreference(
    userId: string,
    key: keyof Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    value: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          [key]: value,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('更新偏好设置失败:', error)
      throw new Error('更新偏好设置失败')
    }
  }

  /**
   * 删除用户所有数据
   */
  static async deleteUserData(userId: string): Promise<void> {
    try {
      // 删除任务记录
      const { error: recordsError } = await supabase
        .from('task_records')
        .delete()
        .eq('user_id', userId)

      if (recordsError) throw recordsError

      // 删除用户偏好
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)

      if (preferencesError) throw preferencesError

    } catch (error) {
      console.error('删除用户数据失败:', error)
      throw new Error('删除用户数据失败')
    }
  }

  /**
   * 导出用户数据
   */
  static async exportUserData(userId: string): Promise<{
    preferences: UserPreferences | null
    taskRecords: any[]
    stats: any
  }> {
    try {
      // 获取用户偏好
      const preferences = await this.getUserPreferences(userId)

      // 获取任务记录
      const { data: taskRecords, error: recordsError } = await supabase
        .from('task_records')
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            task_categories (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (recordsError) throw recordsError

      // 计算统计数据
      const records = taskRecords || []
      const completedTasks = records.filter(r => r.status === 'completed')
      const stats = {
        totalTasks: completedTasks.length,
        totalMinutes: completedTasks.reduce((sum, r) => sum + (r.actual_duration || 0), 0),
        averageCompletion: records.length > 0 
          ? Math.round((completedTasks.length / records.length) * 100)
          : 0,
        firstTaskDate: records.length > 0 ? records[records.length - 1].created_at : null,
        lastTaskDate: records.length > 0 ? records[0].created_at : null
      }

      return {
        preferences,
        taskRecords: records,
        stats
      }
    } catch (error) {
      console.error('导出用户数据失败:', error)
      throw new Error('导出用户数据失败')
    }
  }

  /**
   * 获取用户活动概览
   */
  static async getUserActivityOverview(userId: string, days: number = 30): Promise<{
    dailyActivity: Array<{
      date: string
      tasksCompleted: number
      minutesSpent: number
    }>
    categoryStats: Array<{
      categoryName: string
      taskCount: number
      totalMinutes: number
    }>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      // 获取指定时间范围内的任务记录
      const { data: records, error } = await supabase
        .from('task_records')
        .select(`
          *,
          tasks (
            task_categories (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', startDateStr)
        .order('completed_at', { ascending: true })

      if (error) throw error

      const taskRecords = records || []

      // 计算每日活动数据
      const dailyActivityMap = new Map<string, { tasksCompleted: number, minutesSpent: number }>()
      
      // 初始化所有日期
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dailyActivityMap.set(dateStr, { tasksCompleted: 0, minutesSpent: 0 })
      }

      // 填充实际数据
      taskRecords.forEach(record => {
        const date = record.completed_at?.split('T')[0]
        if (date && dailyActivityMap.has(date)) {
          const activity = dailyActivityMap.get(date)!
          activity.tasksCompleted++
          activity.minutesSpent += record.actual_duration || 0
        }
      })

      const dailyActivity = Array.from(dailyActivityMap.entries())
        .map(([date, activity]) => ({ date, ...activity }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // 计算分类统计
      const categoryStatsMap = new Map<string, { taskCount: number, totalMinutes: number }>()
      
      taskRecords.forEach(record => {
        const categoryName = record.tasks?.task_categories?.name || '未分类'
        if (!categoryStatsMap.has(categoryName)) {
          categoryStatsMap.set(categoryName, { taskCount: 0, totalMinutes: 0 })
        }
        const stats = categoryStatsMap.get(categoryName)!
        stats.taskCount++
        stats.totalMinutes += record.actual_duration || 0
      })

      const categoryStats = Array.from(categoryStatsMap.entries())
        .map(([categoryName, stats]) => ({ categoryName, ...stats }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes)

      return {
        dailyActivity,
        categoryStats
      }
    } catch (error) {
      console.error('获取用户活动概览失败:', error)
      throw new Error('获取用户活动概览失败')
    }
  }

  /**
   * 检查用户是否为新用户
   */
  static async isNewUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('task_records')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) throw error
      return !data || data.length === 0
    } catch (error) {
      console.error('检查新用户状态失败:', error)
      return true // 出错时假设为新用户
    }
  }

  /**
   * 获取用户成就数据
   */
  static async getUserAchievements(userId: string): Promise<{
    firstTask: boolean
    streak7Days: boolean
    streak30Days: boolean
    complete100Tasks: boolean
    complete1000Minutes: boolean
    perfectWeek: boolean
  }> {
    try {
      const { data: records, error } = await supabase
        .from('task_records')
        .select('status, actual_duration, created_at, completed_at')
        .eq('user_id', userId)

      if (error) throw error

      const taskRecords = records || []
      const completedTasks = taskRecords.filter(r => r.status === 'completed')

      // 计算各种成就
      const achievements = {
        firstTask: completedTasks.length > 0,
        streak7Days: false,
        streak30Days: false,
        complete100Tasks: completedTasks.length >= 100,
        complete1000Minutes: completedTasks.reduce((sum, r) => sum + (r.actual_duration || 0), 0) >= 1000,
        perfectWeek: false
      }

      // 计算连续天数成就
      if (completedTasks.length > 0) {
        const streakDays = this.calculateStreakDays(
          completedTasks.map(r => r.completed_at || r.created_at).filter(Boolean)
        )
        achievements.streak7Days = streakDays >= 7
        achievements.streak30Days = streakDays >= 30
      }

      // 计算完美一周成就（连续7天都有完成任务）
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      })

      const completedDates = new Set(
        completedTasks.map(r => (r.completed_at || r.created_at)?.split('T')[0]).filter(Boolean)
      )

      achievements.perfectWeek = last7Days.every(date => completedDates.has(date))

      return achievements
    } catch (error) {
      console.error('获取用户成就失败:', error)
      throw new Error('获取用户成就失败')
    }
  }

  /**
   * 计算连续天数（私有方法）
   */
  private static calculateStreakDays(dates: string[]): number {
    if (!dates.length) return 0

    const uniqueDates = [...new Set(dates.map(d => new Date(d).toDateString()))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date()

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }
}