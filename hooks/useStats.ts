'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export function useUserStats(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
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

  return useQuery({
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
}
