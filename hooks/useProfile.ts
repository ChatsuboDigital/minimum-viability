'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function useProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')

      const result = await response.json()
      return result.profile
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (displayName: string) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['comparison'] })
      toast.success('Display name updated!')
    },
    onError: (error: Error) => {
      logger.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update display name')
    },
  })

  return {
    profile: data,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  }
}
