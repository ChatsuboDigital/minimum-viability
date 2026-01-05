'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music } from 'lucide-react'

export function SpotifyPlaylistEmbed() {
  // Replace this with your actual Spotify playlist URL
  // To get it: Open Spotify > Your Playlist > Share > Copy Playlist Link
  const playlistUrl = 'YOUR_PLAYLIST_URL_HERE'

  // Extract playlist ID from URL (format: https://open.spotify.com/playlist/PLAYLIST_ID)
  const getPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
    return match?.[1] || null
  }

  const playlistId = getPlaylistId(playlistUrl)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5" />
          Workout Playlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {playlistId ? (
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
            title="Workout Playlist"
          />
        ) : (
          <div className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500 mb-2">
              Add your Spotify playlist URL
            </p>
            <p className="text-xs text-zinc-600">
              Edit SpotifyPlaylistEmbed.tsx and replace YOUR_PLAYLIST_URL_HERE
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
