import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    // Get all user data
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)

    const { data: streaks, error: streaksError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)

    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      userId: user.id,
      workouts: {
        count: workouts?.length || 0,
        data: workouts,
        error: workoutsError?.message,
      },
      streaks: {
        data: streaks,
        error: streaksError?.message,
      },
      goals: {
        count: goals?.length || 0,
        data: goals,
        error: goalsError?.message,
      },
      milestones: {
        count: milestones?.length || 0,
        data: milestones,
        error: milestonesError?.message,
      },
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
