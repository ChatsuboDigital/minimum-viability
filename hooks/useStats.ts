'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfWeek, startOfDay } from 'date-fns'

export function useUserStats(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get total points
      const { data: workouts } = await supabase
        .from('workouts')
        .select('points_earned')
        .eq('user_id', userId)

      const totalPoints =
        workouts?.reduce((sum, w) => sum + w.points_earned, 0) || 0

      // Get current streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      // Get current week's goal
      const weekStart = startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 }))
      const { data: weeklyGoal } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart.toISOString().split('T')[0])
        .maybeSingle()

      // Check if workout logged today
      const today = startOfDay(new Date())
      const { data: todayWorkout } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .limit(1)
        .maybeSingle()

      return {
        totalWorkouts: totalWorkouts || 0,
        totalPoints,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        weeklyGoal: {
          target: weeklyGoal?.target_workouts || 4,
          completed: weeklyGoal?.completed_workouts || 0,
          achieved: weeklyGoal?.achieved || false,
        },
        workedOutToday: !!todayWorkout,
      }
    },
    enabled: !!userId,
  })
}

export function useAllUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*')

      if (error) throw error

      return data
    },
  })
}

export function useComparisonStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['comparison'],
    queryFn: async () => {
      // Get all users
      const { data: users } = await supabase.from('users').select('*')

      if (!users || users.length === 0) return []

      // Get stats for each user
      const stats = await Promise.all(
        users.map(async (user) => {
          const { count: totalWorkouts } = await supabase
            .from('workouts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          const { data: workouts } = await supabase
            .from('workouts')
            .select('points_earned')
            .eq('user_id', user.id)

          const totalPoints =
            workouts?.reduce((sum, w) => sum + w.points_earned, 0) || 0

          const { data: streak } = await supabase
            .from('streaks')
            .select('current_streak')
            .eq('user_id', user.id)
            .maybeSingle()

          const weekStart = startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 }))
          const { data: weeklyGoal } = await supabase
            .from('goals')
            .select('completed_workouts')
            .eq('user_id', user.id)
            .eq('week_start_date', weekStart.toISOString().split('T')[0])
            .maybeSingle()

          return {
            userId: user.id,
            username: user.username,
            avatarColor: user.avatar_color,
            totalWorkouts: totalWorkouts || 0,
            totalPoints,
            currentStreak: streak?.current_streak || 0,
            weekCompleted: weeklyGoal?.completed_workouts || 0,
          }
        })
      )

      return stats
    },
  })
}
