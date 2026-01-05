'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface SpotifyTrack {
  id: string
  name: string
  artists: string
  album: string
  albumArt: string
  url: string
  addedAt: string
}

export function SpotifyPlaylistEmbed() {
  const playlistId = '0vjCeGrHnPnnnQ1n0yhtdR'
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(`/api/spotify/playlist/${playlistId}`)
        if (response.ok) {
          const data = await response.json()
          // Sort newest first
          const sortedTracks = data.tracks.sort((a: SpotifyTrack, b: SpotifyTrack) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          )
          setTracks(sortedTracks)
        }
      } catch (error) {
        console.error('Error fetching playlist:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaylist()
  }, [playlistId])

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5" />
          Workout Playlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-zinc-800" />
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {tracks.map((track) => (
              <a
                key={track.id}
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition group"
              >
                <img
                  src={track.albumArt}
                  alt={track.album}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {track.name}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {track.artists}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">No tracks in playlist</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
