import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('habit_modules')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching modules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    return NextResponse.json({ modules: data || [] })
  } catch (error: any) {
    console.error('Error in modules GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }

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
        title: title.trim(),
        description: description?.trim() || null,
        order_index: nextOrder,
        active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating module:', error)
      return NextResponse.json(
        { error: 'Failed to create module: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, module: data })
  } catch (error: any) {
    console.error('Error in modules POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('id')

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('habit_modules')
      .delete()
      .eq('id', moduleId)

    if (error) {
      console.error('Error deleting module:', error)
      return NextResponse.json(
        { error: 'Failed to delete module: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in modules DELETE:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
