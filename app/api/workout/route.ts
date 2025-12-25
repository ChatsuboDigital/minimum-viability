import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, startOfDay } from 'date-fns'
import {
  calculateStreakUpdate,
  calculateWorkoutPoints,
} from '@/lib/gamification'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current streak data for calculation
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Calculate new streak using business logic
    const streakUpdate = calculateStreakUpdate(
      streakData?.last_workout_date ? new Date(streakData.last_workout_date) : null,
      streakData?.current_streak || 0
    )

    // Calculate longest streak
    const longestStreak = Math.max(
      streakUpdate.currentStreak,
      streakData?.longest_streak || 0
    )

    // Get current week start date (UTC) - CRITICAL: Use UTC for both to match RPC functions
    const now = new Date()
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const weekStart = startOfDay(startOfWeek(utcDate, { weekStartsOn: 1 }))
    const weekStartString = weekStart.toISOString().split('T')[0]
    // Use UTC for today as well to match week start calculation
    const today = startOfDay(utcDate)
    const todayString = today.toISOString().split('T')[0]

    // Get current goal to determine if this workout completes it (for points calculation)
    const { data: currentGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartString)
      .maybeSingle()

    const isWeeklyGoalComplete =
      currentGoal &&
      currentGoal.completed_workouts + 1 >= currentGoal.target_workouts &&
      !currentGoal.achieved

    // Calculate points based on goal completion and streak bonus
    const pointsEarned = calculateWorkoutPoints(
      isWeeklyGoalComplete || false,
      streakUpdate.bonusPoints
    )

    logger.debug('Workout API - Calling transaction with:', {
      userId: user.id,
      todayString,
      weekStartString,
      newStreak: streakUpdate.currentStreak,
      longestStreak,
      pointsEarned,
      isWeeklyGoalComplete: isWeeklyGoalComplete || false,
    })

    // Call atomic transaction function - this replaces all the sequential DB operations
    // and prevents race conditions with row-level locking
    const { data: result, error: transactionError } = await supabase.rpc(
      'log_workout_transaction',
      {
        p_user_id: user.id,
        p_today_date: todayString,
        p_week_start_date: weekStartString,
        p_new_streak: streakUpdate.currentStreak,
        p_longest_streak: longestStreak,
        p_points_earned: pointsEarned,
        p_is_weekly_goal_complete: isWeeklyGoalComplete || false,
      }
    )

    if (transactionError) {
      logger.error('Transaction error:', transactionError)

      // Handle specific error for duplicate workout
      if (transactionError.message?.includes('already logged a workout')) {
        return NextResponse.json(
          { error: 'You have already logged a workout today!' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to log workout' },
        { status: 500 }
      )
    }

    logger.debug('Transaction result:', result)

    // Format milestones for response
    const milestones = result.newMilestones.map((m: any) => {
      if (m.type === 'total_sessions') {
        return {
          type: m.type,
          value: m.value,
          message: `${m.value} times locked in 🔥`,
        }
      } else if (m.type === 'streak') {
        return {
          type: m.type,
          value: m.value,
          message: `${m.value}-day streak 🚀`,
        }
      }
      return m
    })

    return NextResponse.json({
      success: true,
      pointsEarned,
      workout: { id: result.workoutId },
      streak: streakUpdate.currentStreak,
      milestones,
      message: streakUpdate.streakBroken
        ? 'Session logged! Starting fresh streak.'
        : `Session logged! ${streakUpdate.currentStreak} day streak!`,
      debug: {
        weekStartString,
        goalCompleted: result.goalCompleted,
        goalId: result.goalId,
        totalWorkouts: result.totalWorkouts,
      },
    })
  } catch (error: any) {
    logger.error('Error logging workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
