import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, handleAuthError, handleSuccess, handleValidationError } from '@/lib/error-handler'
import { validateRequest } from '@/lib/schemas'

const updateProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name too long').trim(),
})

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

    const { data, error } = await supabase
      .from('users')
      .select('display_name, username, email')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return handleSuccess({ profile: data })
  } catch (error) {
    return handleApiError(error, 'GET /api/profile')
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

    const body = await request.json()
    const validation = validateRequest(updateProfileSchema, body)

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { display_name } = validation.data

    const { data, error } = await supabase
      .from('users')
      .update({ display_name })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return handleSuccess({ success: true, profile: data })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/profile')
  }
}
