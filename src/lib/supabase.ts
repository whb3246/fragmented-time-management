import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 配置和客户端实例
 */

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量配置')
}

/**
 * 创建 Supabase 客户端实例
 * 用于与 Supabase 后端服务进行交互
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新令牌
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话变化
    detectSessionInUrl: true
  }
})

/**
 * 数据库表名常量
 */
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks', 
  TASK_CATEGORIES: 'task_categories',
  TASK_RECORDS: 'task_records',
  USER_PREFERENCES: 'user_preferences'
} as const

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

/**
 * 任务类别枚举
 */
export enum TaskCategory {
  WORK = 'work',
  STUDY = 'study',
  EXERCISE = 'exercise',
  READING = 'reading',
  MEDITATION = 'meditation',
  OTHER = 'other'
}

/**
 * 用户偏好设置类型
 */
export interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  default_task_duration: number
  notification_enabled: boolean
  sound_enabled: boolean
  created_at: string
  updated_at: string
}

/**
 * 任务类型定义
 */
export interface Task {
  id: string
  title: string
  description?: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  category_id?: string
  steps?: string[]
  is_active: boolean
  created_at: string
  updated_at?: string
  task_categories?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

/**
 * 任务记录类型定义
 */
export interface TaskRecord {
  id: string
  user_id: string
  task_id: string
  start_time: string
  end_time?: string
  actual_duration: number
  status: TaskStatus
  created_at: string
}

/**
 * 用户类型定义
 */
export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}