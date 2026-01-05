'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { useEffect } from 'react'

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
  const queryClient = useQueryClient()

  const query = useQuery({
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

  // Real-time subscription for workout changes
  useEffect(() => {
    const channel = supabase
      .channel('recent-workouts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'workouts',
        },
        () => {
          // Refetch recent workouts when any workout changes
          queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, queryClient])

  return query
}
