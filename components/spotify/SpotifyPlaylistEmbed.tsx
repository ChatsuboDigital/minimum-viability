'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music } from 'lucide-react'

export function SpotifyPlaylistEmbed() {
  const playlistId = '0vjCeGrHnPnnnQ1n0yhtdR'

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5" />
          Workout Playlist
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
