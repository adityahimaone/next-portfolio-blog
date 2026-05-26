export { default as LandingPage } from './views/landing-page'

// Ravemped 3.0 sections
export { HeroSection } from './components/hero-section'
export { AboutSection } from './components/about-section'
export { SkillsSection } from './components/skills-section'
export { ExperienceSection } from './components/experience-section'
export { ProjectsSection } from './components/projects-section'
export { MusicSection } from './components/music-section'
export { BlogSection } from './components/blog-section'
export { ContactSection } from './components/contact-section'
export { FooterR3 } from './components/footer-r3'

// R3 core
export { Playhead } from './r3/playhead'
export { PreloaderLayer } from './r3/preloader'
export { SectionFrame } from './r3/section-frame'
export { TrackStrip } from './r3/track-strip'
export { useBpmClock } from './r3/use-bpm-clock'

// Mixer header
export { MixerHeader } from './components/mixer-header'

// Spotify (legacy — still usable)
export { MusicPlayer } from './spotify/music-player'
export { MusicMarquee } from './spotify/music-marquee'
export { default as NowPlaying } from './spotify/now-playing'
export { AudioProvider, useAudio } from './spotify/audio-context'

// Animations
export { Preloader } from './animations/preloader'

// Constants
export * from './constants'
