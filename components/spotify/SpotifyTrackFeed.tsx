'use client'

import { useSharedTracks } from '@/hooks/useSharedTracks'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Music, Share2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function SpotifyTrackFeed() {
  const { user } = useAuth()
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const tracksPerPage = 5

  const { tracks, pagination, isLoading, shareTrack, deleteTrack, isSharing } =
    useSharedTracks(currentPage, tracksPerPage)

  const handleShare = async () => {
    if (!spotifyUrl) {
      return
    }

    shareTrack(spotifyUrl, {
      onSuccess: () => {
        setSpotifyUrl('')
        setShowForm(false)
        // Reset to page 1 to see the new track
        setCurrentPage(1)
      },
    })
  }

  const goToNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
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
              <p className="text-sm font-medium">Paste Spotify track link</p>
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
              placeholder="https://open.spotify.com/track/..."
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <Button
              onClick={handleShare}
              disabled={isSharing || !spotifyUrl}
              size="sm"
              className="w-full"
            >
              {isSharing ? 'Fetching track info...' : 'Share Track'}
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
          <>
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

                {/* Footer with timestamp and delete */}
                <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                  <span>
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
              <Button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-zinc-500">
                Page {currentPage} of {pagination.totalPages} ({pagination.total} tracks)
              </span>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === pagination.totalPages}
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
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
