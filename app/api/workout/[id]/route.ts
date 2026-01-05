import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      )
    }

    logger.debug('Delete Workout API - Calling transaction with:', {
      userId: user.id,
      workoutId: id,
    })

    // Call delete transaction function
    const { data: result, error: transactionError } = await supabase.rpc(
      'delete_workout_transaction',
      {
        p_user_id: user.id,
        p_workout_id: id,
      }
    )

    if (transactionError) {
      logger.error('Delete transaction error:', transactionError)

      // Handle specific errors
      if (
        transactionError.message?.includes('not found') ||
        transactionError.message?.includes('do not have permission')
      ) {
        return NextResponse.json(
          { error: 'Workout not found or access denied' },
          { status: 404 }
        )
      }

      if (
        transactionError.message?.includes(
          'Can only delete workouts from the last 7 days'
        )
      ) {
        return NextResponse.json(
          { error: 'Can only delete workouts from the last 7 days' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to delete workout' },
        { status: 500 }
      )
    }

    logger.debug('Delete transaction result:', result)

    return NextResponse.json({
      success: true,
      streak: result.currentStreak,
      message: result.message,
    })
  } catch (error: any) {
    logger.error('Error deleting workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
