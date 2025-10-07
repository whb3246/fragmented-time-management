/**
 * 数据库类型定义
 */

export interface UserPreferences {
  id: string
  user_id: string
  preferred_categories: string[]
  difficulty_preference: 'easy' | 'medium' | 'hard'
  notifications_enabled: boolean
  task_reminder: boolean
  completion_celebration: boolean
  default_duration: number
  theme_color: string
  auto_pause: boolean
  created_at: string
  updated_at: string
}

export interface TaskRecord {
  id: string
  user_id: string
  task_id?: string
  task_title: string
  task_description: string
  planned_duration: number
  actual_duration?: number
  status: 'started' | 'paused' | 'completed' | 'cancelled'
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
  // 积分相关字段
  points_earned?: number
}

/**
 * 用户积分统计类型
 */
export interface UserPointsStats {
  id: string
  user_id: string
  total_points: number
  points_this_week: number
  points_this_month: number
  last_updated_at: string
  created_at: string
}