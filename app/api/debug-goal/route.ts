import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, startOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the week start date that we should be using
    const weekStart = startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const weekStartString = weekStart.toISOString().split('T')[0]

    // Get ALL goals for this user
    const { data: allGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: false })

    // Get the current week's goal specifically
    const { data: currentWeekGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartString)
      .maybeSingle()

    // Get workouts count
    const { count: totalWorkouts } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get today's workouts
    const today = startOfDay(new Date())
    const { data: todayWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_at', today.toISOString())

    return NextResponse.json({
      debug: {
        currentDate: new Date().toISOString(),
        weekStart: weekStart.toISOString(),
        weekStartString,
        userId: user.id,
      },
      currentWeekGoal,
      allGoals,
      totalWorkouts,
      todayWorkouts,
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error.message || 'Debug failed' },
      { status: 500 }
    )
  }
}
