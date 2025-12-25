import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Delete all user data (cascading delete handles related records)
    const { error: workoutsError } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', user.id)

    const { error: streaksError } = await supabase
      .from('streaks')
      .delete()
      .eq('user_id', user.id)

    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)

    const { error: milestonesError } = await supabase
      .from('milestones')
      .delete()
      .eq('user_id', user.id)

    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (workoutsError || streaksError || goalsError || milestonesError || notificationsError) {
      console.error('Error resetting progress:', {
        workoutsError,
        streaksError,
        goalsError,
        milestonesError,
        notificationsError,
      })
      return NextResponse.json(
        { error: 'Failed to reset progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All progress has been reset. Time for a fresh start! 🔥',
    })
  } catch (error: any) {
    console.error('Error resetting progress:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
