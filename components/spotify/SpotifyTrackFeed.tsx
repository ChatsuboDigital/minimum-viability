'use client'

import { useSharedTracks } from '@/hooks/useSharedTracks'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Music, Share2, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function SpotifyTrackFeed() {
  const { user } = useAuth()
  const { tracks, isLoading, shareTrack, deleteTrack, isSharing } =
    useSharedTracks()
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [trackName, setTrackName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleShare = async () => {
    if (!spotifyUrl || !trackName || !artistName) {
      return
    }

    shareTrack(
      { spotifyUrl, trackName, artistName },
      {
        onSuccess: () => {
          setSpotifyUrl('')
          setTrackName('')
          setArtistName('')
          setShowForm(false)
        },
      }
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5" />
          Track of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Share Form */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share a Track
          </Button>
        )}

        {showForm && (
          <div className="space-y-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Share a Spotify track</p>
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                size="sm"
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Spotify track URL"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Track name"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleShare}
              disabled={isSharing || !spotifyUrl || !trackName || !artistName}
              size="sm"
              className="w-full"
            >
              {isSharing ? 'Sharing...' : 'Share Track'}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-zinc-800" />
            ))}
          </div>
        ) : tracks && tracks.length > 0 ? (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
              >
                {/* Spotify Embed */}
                <iframe
                  src={`https://open.spotify.com/embed/track/${track.spotify_track_id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded mb-2"
                  title={`${track.track_name} by ${track.artist_name}`}
                />

                {/* Footer with user and delete */}
                <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                  <span>
                    {track.users?.username || 'Unknown'} •{' '}
                    {formatDistanceToNow(new Date(track.created_at), {
                      addSuffix: true,
                    })}
                  </span>

                  {/* Delete button - only show for own tracks */}
                  {user?.id === track.user_id && (
                    <Button
                      onClick={() => deleteTrack(track.id)}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              No tracks shared yet. Be the first!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
