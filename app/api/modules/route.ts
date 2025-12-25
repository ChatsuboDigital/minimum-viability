import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { handleApiError, handleAuthError, handleSuccess, handleValidationError } from '@/lib/error-handler'
import { createModuleSchema, updateModuleSchema, deleteModuleSchema, validateRequest } from '@/lib/schemas'

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
      .from('habit_modules')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      throw error
    }

    return handleSuccess({ modules: data || [] })
  } catch (error) {
    return handleApiError(error, 'GET /api/modules')
  }
}

export async function POST(request: Request) {
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
    const validation = validateRequest(createModuleSchema, body)

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { title, description } = validation.data

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from('habit_modules')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = (maxOrder?.order_index ?? -1) + 1

    const { data, error } = await supabase
      .from('habit_modules')
      .insert({
        title,
        description: description || null,
        order_index: nextOrder,
        active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return handleSuccess({ success: true, module: data })
  } catch (error) {
    return handleApiError(error, 'POST /api/modules')
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
    const validation = validateRequest(updateModuleSchema, body)

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { id, title, description } = validation.data

    const { data, error } = await supabase
      .from('habit_modules')
      .update({
        title,
        description: description || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return handleSuccess({ success: true, module: data })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/modules')
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('id')

    // Validate module ID
    const validation = validateRequest(deleteModuleSchema, { id: moduleId })

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { error } = await supabase
      .from('habit_modules')
      .delete()
      .eq('id', validation.data.id)

    if (error) {
      throw error
    }

    return handleSuccess({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/modules')
  }
}
