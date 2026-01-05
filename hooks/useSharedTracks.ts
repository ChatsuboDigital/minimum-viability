'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface SharedTrack {
  id: string
  user_id: string
  spotify_track_id: string
  track_name: string
  artist_name: string
  spotify_url: string | null
  created_at: string
  users: { username: string } | null
}

export function useSharedTracks() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch tracks
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['shared_tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_tracks')
        .select(
          `
          id,
          user_id,
          spotify_track_id,
          track_name,
          artist_name,
          spotify_url,
          created_at,
          users:user_id(username)
        `
        )
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as SharedTrack[]
    },
  })

  // Real-time subscription for new tracks
  useEffect(() => {
    const channel = supabase
      .channel('shared_tracks_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_tracks',
        },
        (payload) => {
          // Show toast for new track
          const newTrack = payload.new as SharedTrack
          toast.info('New track shared!', {
            description: `${newTrack.track_name} by ${newTrack.artist_name}`,
          })

          // Refetch tracks when new one arrives
          queryClient.invalidateQueries({ queryKey: ['shared_tracks'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'shared_tracks',
        },
        () => {
          // Refetch when track is deleted
          queryClient.invalidateQueries({ queryKey: ['shared_tracks'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, queryClient])

  // Share track mutation
  const shareTrack = useMutation({
    mutationFn: async (spotifyUrl: string) => {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spotifyUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to share track')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Track shared with your partner!')
      queryClient.invalidateQueries({ queryKey: ['shared_tracks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share track')
    },
  })

  // Delete track mutation
  const deleteTrack = useMutation({
    mutationFn: async (trackId: string) => {
      const response = await fetch(`/api/tracks?id=${trackId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete track')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Track removed')
      queryClient.invalidateQueries({ queryKey: ['shared_tracks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete track')
    },
  })

  return {
    tracks,
    isLoading,
    shareTrack: shareTrack.mutate,
    deleteTrack: deleteTrack.mutate,
    isSharing: shareTrack.isPending,
    isDeleting: deleteTrack.isPending,
  }
}
