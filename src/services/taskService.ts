import { supabase } from '@/lib/supabase'
import type { Task, TaskRecord, TaskCategory } from '@/lib/supabase'

/**
 * 任务服务类 - 处理任务相关的数据库操作
 */
export class TaskService {
  /**
   * 获取所有任务分类
   */
  static async getTaskCategories(): Promise<TaskCategory[]> {
    try {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取任务分类失败:', error)
      throw new Error('获取任务分类失败')
    }
  }

  /**
   * 根据时长获取推荐任务
   */
  static async getRecommendedTasks(duration: number): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .lte('duration', duration + 5) // 允许5分钟的误差
        .gte('duration', Math.max(duration - 10, 5)) // 最少5分钟
        .eq('is_active', true)
        .order('difficulty')
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取推荐任务失败:', error)
      throw new Error('获取推荐任务失败')
    }
  }

  /**
   * 根据分类获取任务
   */
  static async getTasksByCategory(categoryId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('difficulty')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取分类任务失败:', error)
      throw new Error('获取分类任务失败')
    }
  }

  /**
   * 根据ID获取单个任务
   */
  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('id', taskId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // 任务不存在
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('获取任务详情失败:', error)
      throw new Error('获取任务详情失败')
    }
  }

  /**
   * 搜索任务
   */
  static async searchTasks(query: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('difficulty')
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('搜索任务失败:', error)
      throw new Error('搜索任务失败')
    }
  }

  /**
   * 创建自定义任务
   */
  static async createCustomTask(taskData: {
    title: string
    description: string
    duration: number
    categoryId: string
    steps?: string[]
  }): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          duration: taskData.duration,
          category_id: taskData.categoryId,
          steps: taskData.steps || [],
          difficulty: 'medium',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          task_categories (
            id,
            name,
            color,
            icon
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建自定义任务失败:', error)
      throw new Error('创建自定义任务失败')
    }
  }
}

/**
 * 任务记录服务类 - 处理任务记录相关的数据库操作
 */
export class TaskRecordService {
  /**
   * 创建任务记录
   */
  static async createTaskRecord(recordData: {
    userId: string
    taskId: string
    plannedDuration: number
    customDuration?: number
  }): Promise<TaskRecord> {
    try {
      const { data, error } = await supabase
        .from('task_records')
        .insert({
          user_id: recordData.userId,
          task_id: recordData.taskId,
          planned_duration: recordData.plannedDuration,
          custom_duration: recordData.customDuration,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            task_categories (
              id,
              name,
              color,
              icon
            )
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建任务记录失败:', error)
      throw new Error('创建任务记录失败')
    }
  }

  /**
   * 更新任务记录状态
   */
  static async updateTaskRecord(
    recordId: string, 
    updates: {
      status?: 'in_progress' | 'completed' | 'paused' | 'cancelled'
      actualDuration?: number
      completedAt?: string
      pausedAt?: string
      resumedAt?: string
    }
  ): Promise<TaskRecord> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      // 根据状态设置相应的时间戳
      if (updates.status === 'completed') {
        updateData.completed_at = updates.completedAt || new Date().toISOString()
      } else if (updates.status === 'paused') {
        updateData.paused_at = updates.pausedAt || new Date().toISOString()
      } else if (updates.status === 'in_progress' && updates.resumedAt) {
        updateData.resumed_at = updates.resumedAt
      }

      const { data, error } = await supabase
        .from('task_records')
        .update(updateData)
        .eq('id', recordId)
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            task_categories (
              id,
              name,
              color,
              icon
            )
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新任务记录失败:', error)
      throw new Error('更新任务记录失败')
    }
  }

  /**
   * 获取用户的任务记录
   */
  static async getUserTaskRecords(
    userId: string,
    options: {
      status?: 'in_progress' | 'completed' | 'paused' | 'cancelled'
      limit?: number
      offset?: number
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<TaskRecord[]> {
    try {
      let query = supabase
        .from('task_records')
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            duration,
            task_categories (
              id,
              name,
              color,
              icon
            )
          )
        `)
        .eq('user_id', userId)

      // 添加状态筛选
      if (options.status) {
        query = query.eq('status', options.status)
      }

      // 添加日期范围筛选
      if (options.startDate) {
        query = query.gte('created_at', options.startDate)
      }
      if (options.endDate) {
        query = query.lte('created_at', options.endDate)
      }

      // 添加分页
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
      }

      // 按创建时间倒序排列
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取任务记录失败:', error)
      throw new Error('获取任务记录失败')
    }
  }

  /**
   * 获取用户统计数据
   */
  static async getUserStats(userId: string): Promise<{
    totalTasks: number
    totalMinutes: number
    streakDays: number
    averageCompletion: number
    todayTasks: number
    weeklyTasks: number
  }> {
    try {
      // 获取所有任务记录
      const { data: allRecords, error: allError } = await supabase
        .from('task_records')
        .select('status, actual_duration, created_at, completed_at')
        .eq('user_id', userId)

      if (allError) throw allError

      const records = allRecords || []
      const completedTasks = records.filter(r => r.status === 'completed')
      
      // 计算总任务数和总分钟数
      const totalTasks = completedTasks.length
      const totalMinutes = completedTasks.reduce((sum, r) => sum + (r.actual_duration || 0), 0)

      // 计算平均完成率
      const averageCompletion = records.length > 0 
        ? Math.round((completedTasks.length / records.length) * 100)
        : 0

      // 计算今日任务数
      const today = new Date().toISOString().split('T')[0]
      const todayTasks = records.filter(r => 
        r.created_at?.startsWith(today) && r.status === 'completed'
      ).length

      // 计算本周任务数
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weeklyTasks = records.filter(r => 
        r.created_at && r.created_at >= weekStartStr && r.status === 'completed'
      ).length

      // 计算连续天数
      const streakDays = this.calculateStreakDays(
        completedTasks.map(r => r.completed_at || r.created_at).filter(Boolean)
      )

      return {
        totalTasks,
        totalMinutes,
        streakDays,
        averageCompletion,
        todayTasks,
        weeklyTasks
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      throw new Error('获取用户统计失败')
    }
  }

  /**
   * 计算连续完成任务的天数
   */
  private static calculateStreakDays(dates: string[]): number {
    if (!dates.length) return 0

    // 获取唯一的日期并排序
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

  /**
   * 删除任务记录
   */
  static async deleteTaskRecord(recordId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_records')
        .delete()
        .eq('id', recordId)

      if (error) throw error
    } catch (error) {
      console.error('删除任务记录失败:', error)
      throw new Error('删除任务记录失败')
    }
  }
}