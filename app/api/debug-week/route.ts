import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // JavaScript calculation (same as workout route)
  const now = new Date()
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dayOfWeek = utcDate.getUTCDay()
  const daysToMonday = (dayOfWeek + 6) % 7
  const weekStartDate = new Date(Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate() - daysToMonday
  ))
  const jsWeekStart = weekStartDate.toISOString().split('T')[0]

  // Get what SQL calculates
  const { data: sqlResult } = await supabase.rpc('debug_week_calculation')

  // Get all goal records for this user
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start_date', { ascending: false })

  // Get what the stats query returns
  const { data: stats } = await supabase.rpc('get_user_stats', { p_user_id: user.id })

  return NextResponse.json({
    debug: {
      now: now.toISOString(),
      utcDate: utcDate.toISOString(),
      dayOfWeek,
      daysToMonday,
      jsWeekStart,
      sqlWeekStart: sqlResult,
      goals,
      stats,
    }
  })
}
