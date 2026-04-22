import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Get credentials from query (passed during setup) or env
  const clientId = searchParams.get('client_id') || process.env.SPOTIFY_CLIENT_ID
  const clientSecret = searchParams.get('client_secret') || process.env.SPOTIFY_CLIENT_SECRET

  // Check if user denied authorization
  if (error) {
    return NextResponse.json(
      {
        error: 'Authorization denied',
        message: 'You need to authorize the app to use Spotify integration',
      },
      { status: 400 },
    )
  }

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  // If no credentials in query and not in env, use the client-side bridge
  if (!clientId || !clientSecret) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Completing Spotify Setup...</title>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #050505; color: #fff; }
            .container { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top-color: #f59e0b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            h1 { font-size: 14px; letter-spacing: 0.2em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>ESTABLISHING SECURE CONNECTION...</h1>
          </div>
          <script>
            const cid = sessionStorage.getItem('spotify_client_id');
            const cse = sessionStorage.getItem('spotify_client_secret');
            if (cid && cse) {
              const url = new URL(window.location.href);
              url.searchParams.set('client_id', cid);
              url.searchParams.set('client_secret', cse);
              window.location.href = url.toString();
            } else {
              document.body.innerHTML = '<h1>ERROR: MISSING CREDENTIALS</h1><p>Please start the setup from /spotify-setup</p>';
            }
          </script>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  try {
    const origin = request.nextUrl.origin.replace('localhost', '127.0.0.1')
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: `${origin}/api/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (data.error) {
       return NextResponse.json(data, { status: 400 })
    }

    // Return HTML response with the credentials to display
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Setup Complete!</title>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #050505; color: #fff; }
            .container { background: #111; border: 1px solid #222; padding: 40px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            h1 { color: #f59e0b; font-size: 24px; margin-bottom: 8px; font-style: italic; font-weight: 900; }
            p { color: #666; font-size: 14px; margin-bottom: 24px; }
            .code-block { background: #000; color: #f59e0b; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; margin-bottom: 20px; word-break: break-all; border: 1px solid #333; }
            button { background: #fff; color: #000; border: none; padding: 12px; border-radius: 6px; font-weight: 900; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; width: 100%; text-transform: uppercase; }
            button:hover { background: #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ SETUP COMPLETE</h1>
            <p>Add these to your .env.local file and restart the server:</p>
            <div class="code-block" id="creds">
SPOTIFY_CLIENT_ID=${clientId}
SPOTIFY_CLIENT_SECRET=${clientSecret}
SPOTIFY_REFRESH_TOKEN=${data.refresh_token}
            </div>
            <button onclick="copy()">Copy to Clipboard</button>
          </div>
          <script>
            function copy() {
              const text = document.getElementById('creds').textContent.trim();
              navigator.clipboard.writeText(text).then(() => {
                alert('Copied! Now update your .env.local and restart the server.');
                window.location.href = '/';
              });
            }
          </script>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return NextResponse.json(
      { error: 'Failed to get refresh token' },
      { status: 500 },
    )
  }
}
