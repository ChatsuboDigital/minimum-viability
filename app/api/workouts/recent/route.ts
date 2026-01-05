import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
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

    // Calculate 7 days ago
    const todayParts = sydneyDates.today.split('-').map(Number)
    const todayDateObj = new Date(
      Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2])
    )
    const sevenDaysAgo = new Date(todayDateObj)
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
    const sevenDaysAgoString = sevenDaysAgo.toISOString()

    // Fetch recent workouts (last 7 days)
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, completed_at, points_earned, is_retroactive, created_at')
      .eq('user_id', user.id)
      .gte('completed_at', sevenDaysAgoString)
      .order('completed_at', { ascending: false })

    if (workoutsError) {
      logger.error('Error fetching recent workouts:', workoutsError)
      return NextResponse.json(
        { error: 'Failed to fetch workouts' },
        { status: 500 }
      )
    }

    // Format workouts with Sydney timezone dates
    const formattedWorkouts = workouts.map((workout) => {
      const completedAt = new Date(workout.completed_at)

      // Format date in Sydney timezone
      const dateParts = workout.completed_at.split('T')[0].split('-')
      const dateObj = new Date(Date.UTC(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
      ))

      const displayDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })

      return {
        id: workout.id,
        date: workout.completed_at.split('T')[0],
        displayDate,
        points: workout.points_earned,
        isRetroactive: workout.is_retroactive || false,
        completedAt: workout.completed_at,
      }
    })

    return NextResponse.json({
      workouts: formattedWorkouts,
    })
  } catch (error: any) {
    logger.error('Error fetching recent workouts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
