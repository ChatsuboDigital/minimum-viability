'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { useEffect } from 'react'

export function useUserStats(userId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required')

      // Use optimized RPC function (1 query instead of 6+)
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId,
      })

      if (error) {
        logger.error('Error fetching user stats:', error)
        throw error
      }

      return data
    },
    enabled: !!userId,
  })

  // Real-time subscription for workout/goal changes
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
        },
        () => {
          // Refetch stats when any workout is logged
          queryClient.invalidateQueries({ queryKey: ['stats', userId] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
        },
        () => {
          // Refetch stats when goals update
          queryClient.invalidateQueries({ queryKey: ['stats', userId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, queryClient])

  return query
}

export function useAllUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*')

      if (error) throw error

      return data
    },
  })
}

export function useComparisonStats() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['comparison'],
    queryFn: async () => {
      // Use optimized RPC function (1 query instead of 8)
      const { data, error } = await supabase.rpc('get_comparison_stats')

      if (error) {
        logger.error('Error fetching comparison stats:', error)
        throw error
      }

      return data || []
    },
  })

  // Real-time subscription for workout/goal changes (both users)
  useEffect(() => {
    const channel = supabase
      .channel('comparison-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
        },
        () => {
          // Refetch comparison when any user logs workout
          queryClient.invalidateQueries({ queryKey: ['comparison'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
        },
        () => {
          // Refetch comparison when goals update
          queryClient.invalidateQueries({ queryKey: ['comparison'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, queryClient])

  return query
}
