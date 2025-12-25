import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, startOfDay, differenceInDays } from 'date-fns'
import {
  calculateStreakUpdate,
  calculateWorkoutPoints,
  checkMilestoneAchieved,
} from '@/lib/gamification'
import { MILESTONE_TYPES, NOTIFICATION_TYPES } from '@/lib/constants'

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

    // Check if user already logged a workout today
    const today = startOfDay(new Date())
    const { data: todayWorkouts } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)
      .gte('completed_at', today.toISOString())
      .limit(1)

    if (todayWorkouts && todayWorkouts.length > 0) {
      return NextResponse.json(
        { error: 'You have already logged a workout today!' },
        { status: 400 }
      )
    }

    // Get current streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Calculate new streak
    const streakUpdate = calculateStreakUpdate(
      streakData?.last_workout_date ? new Date(streakData.last_workout_date) : null,
      streakData?.current_streak || 0
    )

    // Get current week's goal
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    const { data: currentGoal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .single()

    let isWeeklyGoalComplete = false
    let weeklyGoalData = currentGoal

    if (!currentGoal) {
      // Create new weekly goal
      const { data: newGoal } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          week_start_date: weekStart.toISOString().split('T')[0],
          target_workouts: 4,
          completed_workouts: 1,
          achieved: false,
        })
        .select()
        .single()

      weeklyGoalData = newGoal
    } else {
      // Update existing goal
      const newCompleted = currentGoal.completed_workouts + 1
      isWeeklyGoalComplete =
        newCompleted >= currentGoal.target_workouts && !currentGoal.achieved

      const { data: updatedGoal } = await supabase
        .from('goals')
        .update({
          completed_workouts: newCompleted,
          achieved: isWeeklyGoalComplete || currentGoal.achieved,
        })
        .eq('id', currentGoal.id)
        .select()
        .single()

      weeklyGoalData = updatedGoal
    }

    // Calculate points
    const pointsEarned = calculateWorkoutPoints(
      isWeeklyGoalComplete,
      streakUpdate.bonusPoints
    )

    // Insert workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        points_earned: pointsEarned,
      })
      .select()
      .single()

    if (workoutError) {
      return NextResponse.json(
        { error: 'Failed to log workout' },
        { status: 500 }
      )
    }

    // Update streak
    await supabase
      .from('streaks')
      .upsert({
        user_id: user.id,
        current_streak: streakUpdate.currentStreak,
        longest_streak: Math.max(
          streakUpdate.currentStreak,
          streakData?.longest_streak || 0
        ),
        last_workout_date: today.toISOString().split('T')[0],
      })

    // Check for milestones
    const milestones = []

    // Get total workouts count
    const { count: totalWorkouts } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get achieved milestones
    const { data: achievedMilestones } = await supabase
      .from('milestones')
      .select('milestone_value')
      .eq('user_id', user.id)
      .eq('milestone_type', MILESTONE_TYPES.TOTAL_WORKOUTS)

    const achievedValues = achievedMilestones?.map((m) => m.milestone_value) || []

    // Check total workouts milestone
    const totalWorkoutsMilestone = checkMilestoneAchieved(
      MILESTONE_TYPES.TOTAL_WORKOUTS,
      totalWorkouts || 0,
      achievedValues
    )

    if (totalWorkoutsMilestone) {
      await supabase.from('milestones').insert({
        user_id: user.id,
        milestone_type: MILESTONE_TYPES.TOTAL_WORKOUTS,
        milestone_value: totalWorkoutsMilestone,
      })
      milestones.push({
        type: MILESTONE_TYPES.TOTAL_WORKOUTS,
        value: totalWorkoutsMilestone,
        message: `${totalWorkoutsMilestone} total workouts`,
      })
    }

    // Check streak milestone
    const { data: streakMilestones } = await supabase
      .from('milestones')
      .select('milestone_value')
      .eq('user_id', user.id)
      .eq('milestone_type', MILESTONE_TYPES.STREAK)

    const achievedStreakValues =
      streakMilestones?.map((m) => m.milestone_value) || []

    const streakMilestone = checkMilestoneAchieved(
      MILESTONE_TYPES.STREAK,
      streakUpdate.currentStreak,
      achievedStreakValues
    )

    if (streakMilestone) {
      await supabase.from('milestones').insert({
        user_id: user.id,
        milestone_type: MILESTONE_TYPES.STREAK,
        milestone_value: streakMilestone,
      })
      milestones.push({
        type: MILESTONE_TYPES.STREAK,
        value: streakMilestone,
        message: `${streakMilestone}-day streak`,
      })
    }

    // Get partner's user ID
    const { data: allUsers } = await supabase
      .from('users')
      .select('id')
      .neq('id', user.id)
      .limit(1)

    const partnerId = allUsers?.[0]?.id

    // Create notification for partner
    if (partnerId) {
      await supabase.from('notifications').insert({
        user_id: partnerId,
        notification_type: NOTIFICATION_TYPES.PARTNER_COMPLETED,
        message: 'Your partner just completed a workout!',
      })
    }

    return NextResponse.json({
      success: true,
      pointsEarned,
      workout,
      streak: streakUpdate.currentStreak,
      milestones,
      message: streakUpdate.streakBroken
        ? 'Workout logged! Starting fresh streak.'
        : `Workout logged! ${streakUpdate.currentStreak} day streak!`,
    })
  } catch (error: any) {
    console.error('Error logging workout:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
