import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Test calling the RPC function with minimal data
    const { data, error } = await supabase.rpc('log_workout_transaction', {
      p_user_id: user.id,
      p_today_date: '2025-12-25',
      p_week_start_date: '2025-12-22',
      p_new_streak: 1,
      p_longest_streak: 1,
      p_points_earned: 10,
      p_is_weekly_goal_complete: false,
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'RPC call failed',
        errorDetails: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'RPC function exists and works!',
      result: data,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'Caught exception',
      exception: {
        message: err.message,
        stack: err.stack,
      },
    })
  }
}
