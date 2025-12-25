'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MILESTONES, MILESTONE_TYPES } from '@/lib/constants'
import { getMilestoneProgress } from '@/lib/gamification'

export function useMilestones(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['milestones', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      // Get achieved milestones
      const { data: achieved } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false })

      // Get current values for progress
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .single()

      // Get consecutive weekly goals
      const { data: weeklyGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('achieved', true)
        .order('week_start_date', { ascending: false })

      // Calculate consecutive weeks
      let consecutiveWeeks = 0
      if (weeklyGoals && weeklyGoals.length > 0) {
        // Simple count for now - would need more logic for true consecutive
        consecutiveWeeks = weeklyGoals.length
      }

      // Build milestone data
      const achievedSet = new Set(
        achieved?.map((m) => `${m.milestone_type}-${m.milestone_value}`) || []
      )

      const workoutProgress = getMilestoneProgress(
        MILESTONE_TYPES.TOTAL_WORKOUTS,
        totalWorkouts || 0
      )

      const streakProgress = getMilestoneProgress(
        MILESTONE_TYPES.STREAK,
        streak?.current_streak || 0
      )

      const weeklyGoalProgress = getMilestoneProgress(
        MILESTONE_TYPES.WEEKLY_GOAL,
        consecutiveWeeks
      )

      const allMilestones = [
        // Total Workouts
        ...MILESTONES.TOTAL_WORKOUTS.map((value) => ({
          type: MILESTONE_TYPES.TOTAL_WORKOUTS,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.TOTAL_WORKOUTS}-${value}`),
          label: `${value} Total Workouts`,
          description: `Complete ${value} workouts in total`,
        })),
        // Streaks
        ...MILESTONES.STREAKS.map((value) => ({
          type: MILESTONE_TYPES.STREAK,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.STREAK}-${value}`),
          label: `${value}-Day Streak`,
          description: `Maintain a ${value}-day workout streak`,
        })),
        // Weekly Goals
        ...MILESTONES.WEEKLY_GOALS.map((value) => ({
          type: MILESTONE_TYPES.WEEKLY_GOAL,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.WEEKLY_GOAL}-${value}`),
          label: `${value} Week Goal Streak`,
          description: `Hit your weekly goal ${value} weeks in a row`,
        })),
      ]

      return {
        milestones: allMilestones,
        progress: {
          totalWorkouts: workoutProgress,
          streak: streakProgress,
          weeklyGoal: weeklyGoalProgress,
        },
        stats: {
          totalAchieved: achieved?.length || 0,
          totalPossible: allMilestones.length,
        },
      }
    },
    enabled: !!userId,
  })
}
