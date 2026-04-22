import { NextResponse } from 'next/server'
import { NowPlayingResponse, SpotifyNowPlayingData } from '@/types'
import { getNowPlaying } from '@/features/landing-page/spotify/spotify'

export const revalidate = 0 // disable cache

export async function GET() {
  // Quick check for env vars
  if (
    !process.env.SPOTIFY_CLIENT_ID ||
    !process.env.SPOTIFY_CLIENT_SECRET ||
    !process.env.SPOTIFY_REFRESH_TOKEN
  ) {
    return NextResponse.json(
      {
        isPlaying: false,
        error:
          'Spotify environment variables are not fully configured in .env.local',
      },
      { status: 500 },
    )
  }

  try {
    const response = await getNowPlaying()

    if (response.status === 204) {
      return NextResponse.json({ isPlaying: false })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Spotify API Error:', {
        status: response.status,
        data: errorData,
      })

      // Extract message from Spotify's nested error object if it exists
      const message =
        errorData.error?.message || errorData.error || 'Spotify API error'

      return NextResponse.json(
        { isPlaying: false, error: message },
        { status: response.status },
      )
    }

    const song: SpotifyNowPlayingData = await response.json()

    if (!song || !song.item) {
      return NextResponse.json({ isPlaying: false })
    }

    const isPlaying = song.is_playing
    const title = song.item.name
    const artist = song.item.artists.map((_artist) => _artist.name).join(', ')
    const album = song.item.album.name
    const albumImageUrl = song.item.album.images[0].url
    const songUrl = song.item.external_urls.spotify

    const nowPlayingResponse: NowPlayingResponse = {
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
    }

    return NextResponse.json(nowPlayingResponse)
  } catch (error) {
    console.error('Error fetching now playing:', error)
    return NextResponse.json({ isPlaying: false }, { status: 500 })
  }
}
