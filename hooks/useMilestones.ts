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
        .maybeSingle()

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
        // Data is already sorted by week_start_date descending (most recent first)
        consecutiveWeeks = 1 // Count the most recent week

        for (let i = 0; i < weeklyGoals.length - 1; i++) {
          const currentWeek = new Date(weeklyGoals[i].week_start_date)
          const nextWeek = new Date(weeklyGoals[i + 1].week_start_date)

          // Calculate the difference in days
          const daysDiff = Math.floor(
            (currentWeek.getTime() - nextWeek.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Weeks should be exactly 7 days apart for consecutive
          if (daysDiff === 7) {
            consecutiveWeeks++
          } else {
            // Chain is broken, stop counting
            break
          }
        }
      }

      // Build milestone data
      const achievedSet = new Set(
        achieved?.map((m) => `${m.milestone_type}-${m.milestone_value}`) || []
      )

      const sessionProgress = getMilestoneProgress(
        MILESTONE_TYPES.TOTAL_SESSIONS,
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
        // Total Sessions
        ...MILESTONES.TOTAL_SESSIONS.map((value) => ({
          type: MILESTONE_TYPES.TOTAL_SESSIONS,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.TOTAL_SESSIONS}-${value}`),
          label: `${value} Times Locked In`,
          description: `Show up ${value} times total 🔥`,
        })),
        // Streaks
        ...MILESTONES.STREAKS.map((value) => ({
          type: MILESTONE_TYPES.STREAK,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.STREAK}-${value}`),
          label: `${value}-Day Streak`,
          description: `Stay consistent for ${value} days straight 🚀`,
        })),
        // Weekly Goals
        ...MILESTONES.WEEKLY_GOALS.map((value) => ({
          type: MILESTONE_TYPES.WEEKLY_GOAL,
          value,
          achieved: achievedSet.has(`${MILESTONE_TYPES.WEEKLY_GOAL}-${value}`),
          label: `${value} Week Goal Streak`,
          description: `Hit your weekly goal ${value} weeks in a row ⚡`,
        })),
      ]

      return {
        milestones: allMilestones,
        progress: {
          totalSessions: sessionProgress,
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
