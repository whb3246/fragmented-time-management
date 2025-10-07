/**
 * 积分系统服务
 * 负责积分的计算、管理和统计功能
 */

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { UserPointsStats } from '@/types/database'

/**
 * 积分计算规则：每分钟1积分
 * @param actualDurationMinutes 实际完成时间（分钟）
 * @returns 计算得到的积分
 */
export function calculateTaskPoints(actualDurationMinutes: number): number {
  return Math.floor(actualDurationMinutes || 0)
}

/**
 * 获取用户积分统计信息
 * @returns 用户积分统计数据
 */
export async function getUserPointsStats(): Promise<UserPointsStats | null> {
  const authStore = useAuthStore()
  
  // 游客模式下不支持积分
  if (authStore.isGuestMode || !authStore.userId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_points_stats')
      .select('*')
      .eq('user_id', authStore.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  } catch (error) {
    console.error('获取用户积分统计失败:', error)
    return null
  }
}

/**
 * 更新用户积分统计
 * 当任务完成时调用此函数更新积分统计
 */
export async function updateUserPointsStats(): Promise<void> {
  const authStore = useAuthStore()
  
  // 游客模式下不支持积分
  if (authStore.isGuestMode || !authStore.userId) {
    return
  }

  try {
    // 调用数据库函数更新积分统计
    const { error } = await supabase.rpc('update_user_points_stats', {
      user_uuid: authStore.userId
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('更新用户积分统计失败:', error)
    throw error
  }
}

/**
 * 获取用户总积分
 * @returns 用户总积分数
 */
export async function getUserTotalPoints(): Promise<number> {
  const stats = await getUserPointsStats()
  return stats?.total_points || 0
}

/**
 * 获取用户本周积分
 * @returns 用户本周积分数
 */
export async function getUserWeeklyPoints(): Promise<number> {
  const stats = await getUserPointsStats()
  return stats?.points_this_week || 0
}

/**
 * 获取用户本月积分
 * @returns 用户本月积分数
 */
export async function getUserMonthlyPoints(): Promise<number> {
  const stats = await getUserPointsStats()
  return stats?.points_this_month || 0
}

/**
 * 检查用户是否支持积分功能
 * @returns 是否支持积分功能
 */
export function isPointsSupported(): boolean {
  const authStore = useAuthStore()
  return !authStore.isGuestMode && !!authStore.userId
}

/**
 * 格式化积分显示
 * @param points 积分数
 * @returns 格式化后的积分字符串
 */
export function formatPoints(points: number): string {
  if (points >= 10000) {
    return `${(points / 1000).toFixed(1)}k`
  }
  return points.toString()
}

/**
 * 获取积分等级和称号
 * @param totalPoints 总积分
 * @returns 等级信息
 */
export function getPointsLevel(totalPoints: number): {
  level: number
  title: string
  nextLevelPoints: number
  progress: number
} {
  const levels = [
    { level: 1, title: '时间新手', minPoints: 0, maxPoints: 100 },
    { level: 2, title: '效率达人', minPoints: 100, maxPoints: 500 },
    { level: 3, title: '专注大师', minPoints: 500, maxPoints: 1500 },
    { level: 4, title: '时间管理专家', minPoints: 1500, maxPoints: 5000 },
    { level: 5, title: '生产力之王', minPoints: 5000, maxPoints: Infinity }
  ]

  const currentLevel = levels.find(level => 
    totalPoints >= level.minPoints && totalPoints < level.maxPoints
  ) || levels[levels.length - 1]

  const nextLevel = levels.find(level => level.level === currentLevel.level + 1)
  const nextLevelPoints = nextLevel ? nextLevel.minPoints : currentLevel.maxPoints
  const progress = nextLevel 
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints,
    progress: Math.min(progress, 100)
  }
}

/**
 * 积分服务类
 */
export class PointsService {
  /**
   * 计算任务积分
   */
  static calculatePoints = calculateTaskPoints

  /**
   * 获取用户积分统计
   */
  static getUserStats = getUserPointsStats

  /**
   * 更新用户积分统计
   */
  static updateStats = updateUserPointsStats

  /**
   * 获取总积分
   */
  static getTotalPoints = getUserTotalPoints

  /**
   * 获取本周积分
   */
  static getWeeklyPoints = getUserWeeklyPoints

  /**
   * 获取本月积分
   */
  static getMonthlyPoints = getUserMonthlyPoints

  /**
   * 检查积分支持
   */
  static isSupported = isPointsSupported

  /**
   * 格式化积分
   */
  static format = formatPoints

  /**
   * 获取积分等级
   */
  static getLevel = getPointsLevel
}

export default PointsService