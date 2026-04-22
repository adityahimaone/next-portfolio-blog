const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

const basic = Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
).toString('base64')

const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  error?: string
}

const getAccessToken = async (): Promise<TokenResponse> => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    console.error('Spotify environment variables are missing')
    return {
      access_token: '',
      token_type: '',
      expires_in: 0,
      error: 'Missing environment variables',
    }
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN!,
      }),
      cache: 'no-store',
    })

    const data = await response.json()
    // console.log('Access token response:', data)

    if (!response.ok) {
      console.error('Spotify token error:', data)
      return {
        access_token: '',
        token_type: '',
        expires_in: 0,
        error: data.error_description || data.error || 'Token fetch failed',
      }
    }

    return data
  } catch (err) {
    console.error('Failed to fetch Spotify access token:', err)
    return {
      access_token: '',
      token_type: '',
      expires_in: 0,
      error: String(err),
    }
  }
}

export const getNowPlaying = async (): Promise<Response> => {
  const { access_token, error } = await getAccessToken()

  if (error || !access_token) {
    return new Response(
      JSON.stringify({ error: error || 'Failed to get access token' }),
      { status: 500 },
    )
  }

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  })
}
