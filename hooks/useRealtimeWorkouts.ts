'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useRealtimeWorkouts(currentUserId: string | undefined) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!currentUserId) return

    // Subscribe to workout inserts
    const workoutsChannel = supabase
      .channel('workouts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workouts',
        },
        (payload) => {
          // Only show notification if it's not the current user
          if (payload.new.user_id !== currentUserId) {
            toast.success('Your partner just completed a workout! 💪')
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          queryClient.invalidateQueries({ queryKey: ['comparison'] })
          queryClient.invalidateQueries({ queryKey: ['workouts'] })
        }
      )
      .subscribe()

    // Subscribe to notifications for current user
    const notificationsChannel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          // Show toast for new notification
          toast.info(payload.new.message)

          // Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    return () => {
      workoutsChannel.unsubscribe()
      notificationsChannel.unsubscribe()
    }
  }, [currentUserId, queryClient, supabase])
}
