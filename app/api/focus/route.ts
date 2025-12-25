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

    // Get current focus
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('key', 'current_focus')
      .single()

    if (error) {
      console.error('Error fetching focus:', error)
      return NextResponse.json(
        { error: 'Failed to fetch focus' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      focus: data?.value || '4 workouts per week',
      updatedAt: data?.updated_at,
      updatedBy: data?.updated_by,
    })
  } catch (error: any) {
    console.error('Error in focus GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { focus } = await request.json()

    if (!focus || focus.trim().length === 0) {
      return NextResponse.json(
        { error: 'Focus cannot be empty' },
        { status: 400 }
      )
    }

    // Update or insert focus
    const { data, error } = await supabase
      .from('app_config')
      .upsert({
        key: 'current_focus',
        value: focus.trim(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating focus:', error)
      return NextResponse.json(
        { error: 'Failed to update focus: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      focus: data.value,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error in focus POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
