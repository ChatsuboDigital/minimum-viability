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

      // Validate 7-day window (accountability safeguard)
      const todayParts = sydneyDates.today.split('-').map(Number)
      const todayDateObj = new Date(
        Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2])
      )
      const sevenDaysAgo = new Date(todayDateObj)
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
      const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0]

      if (workoutDate < sevenDaysAgoString) {
        return NextResponse.json(
          { error: 'Can only log workouts from the last 7 days' },
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

    const workoutDateString = targetDateString

    // Calculate week start for the workout's week (using UTC to avoid timezone shifts)
    const workoutParts = workoutDateString.split('-').map(Number)
    const workoutDateObj = new Date(
      Date.UTC(workoutParts[0], workoutParts[1] - 1, workoutParts[2])
    )
    const dayOfWeek = workoutDateObj.getUTCDay()
    const daysToMonday = (dayOfWeek + 6) % 7
    workoutDateObj.setUTCDate(workoutDateObj.getUTCDate() - daysToMonday)
    const weekStartString = workoutDateObj
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
      workoutDateString,
      weekStartString,
      pointsEarned,
      weeklyTarget,
    })

    // Call retroactive transaction function
    const { data: result, error: transactionError } = await supabase.rpc(
      'log_retroactive_workout_transaction',
      {
        p_user_id: user.id,
        p_workout_date: workoutDateString,
        p_week_start_date: weekStartString,
        p_points_earned: pointsEarned,
        p_target_workouts: weeklyTarget,
      }
    )

    if (transactionError) {
      logger.error('Retroactive transaction error:', transactionError)

      // Handle specific errors
      if (transactionError.message?.includes('already logged a workout')) {
        return NextResponse.json(
          { error: 'You already logged a workout for this date!' },
          { status: 400 }
        )
      }

      if (transactionError.message?.includes('Can only log workouts from the last 7 days')) {
        return NextResponse.json(
          { error: 'Can only log workouts from the last 7 days' },
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

    // Format friendly date for message
    const dateParts = workoutDateString.split('-')
    const dateObj = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])))
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

    return NextResponse.json({
      success: true,
      pointsEarned,
      workout: { id: result.workoutId },
      streak: result.currentStreak,
      milestones,
      message: `Workout logged for ${formattedDate}! Streak: ${result.currentStreak} days`,
      debug: {
        weekStartString,
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
