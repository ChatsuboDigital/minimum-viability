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

    if (workoutsError) {
      console.error('Error deleting workouts:', workoutsError)
      return NextResponse.json(
        { error: 'Failed to delete workouts: ' + workoutsError.message },
        { status: 500 }
      )
    }

    const { error: streaksError } = await supabase
      .from('streaks')
      .delete()
      .eq('user_id', user.id)

    if (streaksError) {
      console.error('Error deleting streaks:', streaksError)
      return NextResponse.json(
        { error: 'Failed to delete streaks: ' + streaksError.message },
        { status: 500 }
      )
    }

    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)

    if (goalsError) {
      console.error('Error deleting goals:', goalsError)
      return NextResponse.json(
        { error: 'Failed to delete goals: ' + goalsError.message },
        { status: 500 }
      )
    }

    const { error: milestonesError } = await supabase
      .from('milestones')
      .delete()
      .eq('user_id', user.id)

    if (milestonesError) {
      console.error('Error deleting milestones:', milestonesError)
      return NextResponse.json(
        { error: 'Failed to delete milestones: ' + milestonesError.message },
        { status: 500 }
      )
    }

    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
      return NextResponse.json(
        { error: 'Failed to delete notifications: ' + notificationsError.message },
        { status: 500 }
      )
    }

    console.log('Successfully deleted all data for user:', user.id)

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
