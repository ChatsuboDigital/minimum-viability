import { createClient } from '@/lib/supabase/server'
import { handleApiError, handleAuthError, handleSuccess, handleValidationError } from '@/lib/error-handler'
import { updatePreferencesSchema, validateRequest } from '@/lib/schemas'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Get user preferences, create default if doesn't exist
    let { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    // If no preferences exist, create default
    if (!preferences) {
      const { data: newPreferences, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          weekly_target: 4,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      preferences = newPreferences
    }

    return handleSuccess({ preferences })
  } catch (error) {
    return handleApiError(error, 'GET /api/preferences')
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Validate request body
    const body = await request.json()
    const validation = validateRequest(updatePreferencesSchema, body)

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { weekly_target } = validation.data

    // Upsert preferences (update if exists, insert if not)
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        weekly_target,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return handleSuccess({ success: true, preferences: data })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/preferences')
  }
}
