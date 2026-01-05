import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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

    // Get optional workout date from request body
    const body = await request.json().catch(() => ({}))
    const { workoutDate } = body

    // Get Sydney dates
    const { data: sydneyDates, error: datesError } = await supabase.rpc(
      'get_sydney_dates'
    )

    if (datesError || !sydneyDates) {
      logger.error('Error getting Sydney dates:', datesError)
      return NextResponse.json(
        { error: 'Failed to get current date' },
        { status: 500 }
      )
    }

    // Use provided date or calculate yesterday
    let targetDateString: string
    if (workoutDate) {
      // Validate that the date is not in the future
      if (workoutDate > sydneyDates.today) {
        return NextResponse.json(
          { error: 'Cannot log workouts for future dates' },
          { status: 400 }
        )
      }
      targetDateString = workoutDate
    } else {
      // Calculate yesterday's date (pure date arithmetic to avoid timezone issues)
      const todayParts = sydneyDates.today.split('-').map(Number)
      const todayDateObj = new Date(
        Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2])
      )
      todayDateObj.setUTCDate(todayDateObj.getUTCDate() - 1)
      targetDateString = todayDateObj.toISOString().split('T')[0]
    }

    const yesterdayString = targetDateString

    // Calculate week start for yesterday's week (using UTC to avoid timezone shifts)
    const yesterdayParts = yesterdayString.split('-').map(Number)
    const yesterdayDateObj = new Date(
      Date.UTC(yesterdayParts[0], yesterdayParts[1] - 1, yesterdayParts[2])
    )
    const dayOfWeek = yesterdayDateObj.getUTCDay()
    const daysToMonday = (dayOfWeek + 6) % 7
    yesterdayDateObj.setUTCDate(yesterdayDateObj.getUTCDate() - daysToMonday)
    const yesterdayWeekStartString = yesterdayDateObj
      .toISOString()
      .split('T')[0]

    // Get user's weekly target
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('weekly_target')
      .eq('user_id', user.id)
      .maybeSingle()

    const weeklyTarget = userPrefs?.weekly_target || 4

    // Calculate points - base only (no streak bonuses for retroactive)
    // Retroactive workouts get base points only
    const pointsEarned = 10 // Base points only

    logger.debug('Retroactive Workout API - Calling transaction with:', {
      userId: user.id,
      yesterdayString,
      yesterdayWeekStartString,
      pointsEarned,
      weeklyTarget,
    })

    // Call retroactive transaction function
    const { data: result, error: transactionError } = await supabase.rpc(
      'log_retroactive_workout_transaction',
      {
        p_user_id: user.id,
        p_workout_date: yesterdayString,
        p_week_start_date: yesterdayWeekStartString,
        p_points_earned: pointsEarned,
        p_target_workouts: weeklyTarget,
      }
    )

    if (transactionError) {
      logger.error('Retroactive transaction error:', transactionError)

      // Handle specific errors
      if (transactionError.message?.includes('already logged a workout')) {
        return NextResponse.json(
          { error: 'You already logged a workout for yesterday!' },
          { status: 400 }
        )
      }

      if (transactionError.message?.includes('Can only log yesterday')) {
        return NextResponse.json(
          { error: "Can only log yesterday's workout" },
          { status: 400 }
        )
      }

      if (
        transactionError.message?.includes('Weekly goal was already complete')
      ) {
        return NextResponse.json(
          { error: 'Weekly goal was already complete for that week!' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to log retroactive workout' },
        { status: 500 }
      )
    }

    logger.debug('Retroactive transaction result:', result)

    // Format milestones
    const milestones = result.newMilestones.map((m: any) => {
      if (m.type === 'total_sessions') {
        return {
          type: m.type,
          value: m.value,
          message: `${m.value} times locked in 🔥`,
        }
      }
      return m
    })

    return NextResponse.json({
      success: true,
      pointsEarned,
      workout: { id: result.workoutId },
      streak: result.currentStreak,
      milestones,
      message: `Yesterday's workout logged! Streak: ${result.currentStreak} days`,
      debug: {
        yesterdayWeekStartString,
        goalCompleted: result.goalCompleted,
        goalId: result.goalId,
        totalWorkouts: result.totalWorkouts,
      },
    })
  } catch (error: any) {
    logger.error('Error logging retroactive workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
