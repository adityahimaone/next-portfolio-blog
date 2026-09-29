export { default as LandingPage } from './views/landing-page'

// Spotify. MusicPlayer and the audio provider are mounted by the root layout
// so the track keeps playing across navigations; NowPlaying renders inside the
// rack.
export { MusicPlayer } from './spotify/music-player'
export { default as NowPlaying } from './spotify/now-playing'
export { AudioProvider, useAudio } from './spotify/audio-context'
