import { createClient } from '@/lib/supabase/server'
import {
  handleApiError,
  handleAuthError,
  handleSuccess,
  handleValidationError,
} from '@/lib/error-handler'
import {
  shareSpotifyTrackSchema,
  extractSpotifyTrackId,
  validateRequest,
} from '@/lib/schemas'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Fetch recent tracks (limit 20 for performance)
    const { data: tracks, error } = await supabase
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

    if (error) {
      logger.error('Error fetching tracks:', error)
      throw error
    }

    return handleSuccess({ tracks })
  } catch (error) {
    return handleApiError(error, 'GET /api/tracks')
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Validate request body
    const body = await request.json()
    const validation = validateRequest(shareSpotifyTrackSchema, body)

    if (!validation.success) {
      return handleValidationError(validation.error)
    }

    const { spotifyUrl, trackName, artistName } = validation.data

    // Extract track ID from URL
    const trackId = extractSpotifyTrackId(spotifyUrl)
    if (!trackId) {
      return handleValidationError('Could not extract Spotify track ID from URL')
    }

    // Insert track
    const { data: newTrack, error: insertError } = await supabase
      .from('shared_tracks')
      .insert({
        user_id: user.id,
        spotify_track_id: trackId,
        track_name: trackName,
        artist_name: artistName,
        spotify_url: spotifyUrl,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error inserting track:', insertError)
      throw insertError
    }

    return handleSuccess(
      {
        success: true,
        track: newTrack,
        message: 'Track shared!',
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, 'POST /api/tracks')
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return handleAuthError()
    }

    // Get track ID from URL params
    const url = new URL(request.url)
    const trackId = url.searchParams.get('id')

    if (!trackId) {
      return handleValidationError('Track ID is required')
    }

    // Verify ownership before deleting (RLS will also enforce this)
    const { data: track, error: fetchError } = await supabase
      .from('shared_tracks')
      .select('user_id')
      .eq('id', trackId)
      .single()

    if (fetchError || !track) {
      return handleValidationError('Track not found')
    }

    if (track.user_id !== user.id) {
      return handleAuthError('Can only delete your own tracks')
    }

    // Delete track
    const { error: deleteError } = await supabase
      .from('shared_tracks')
      .delete()
      .eq('id', trackId)

    if (deleteError) {
      logger.error('Error deleting track:', deleteError)
      throw deleteError
    }

    return handleSuccess({ success: true, message: 'Track deleted' })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/tracks')
  }
}
