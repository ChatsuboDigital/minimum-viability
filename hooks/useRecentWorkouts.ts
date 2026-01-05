'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

interface Workout {
  id: string
  date: string
  displayDate: string
  points: number
  isRetroactive: boolean
  completedAt: string
}

export function useRecentWorkouts() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recent-workouts'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/workouts/recent')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch workouts')
      }

      const data = await response.json()
      logger.debug('Recent workouts:', data)

      return data.workouts as Workout[]
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}
