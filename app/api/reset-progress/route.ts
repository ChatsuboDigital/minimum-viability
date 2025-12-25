import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { handleApiError, handleAuthError, handleSuccess } from '@/lib/error-handler'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Delete all user data (cascading delete handles related records)
    const { error: workoutsError } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', user.id)

    if (workoutsError) {
      throw new Error('Failed to delete workouts')
    }

    const { error: streaksError } = await supabase
      .from('streaks')
      .delete()
      .eq('user_id', user.id)

    if (streaksError) {
      throw new Error('Failed to delete streaks')
    }

    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)

    if (goalsError) {
      throw new Error('Failed to delete goals')
    }

    const { error: milestonesError } = await supabase
      .from('milestones')
      .delete()
      .eq('user_id', user.id)

    if (milestonesError) {
      throw new Error('Failed to delete milestones')
    }

    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (notificationsError) {
      throw new Error('Failed to delete notifications')
    }

    logger.debug('Successfully deleted all data for user:', user.id)

    return handleSuccess({
      success: true,
      message: 'All progress has been reset. Time for a fresh start! 🔥',
    })
  } catch (error) {
    return handleApiError(error, 'POST /api/reset-progress')
  }
}
