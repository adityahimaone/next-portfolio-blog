'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Track } from '../types'
import { TRACKS } from '../data/tracks'
import { clamp } from '../lib/format'

/**
 * The audio graph.
 *
 * Lives in the root layout, above the router, for one reason: the player must
 * not restart when the visitor moves between the hero, the shelf and a note.
 * A provider inside a page would be torn down on every navigation, and the
 * sound would cut — the most common way a music-led portfolio ends up feeling
 * cheap.
 *
 * Graph:
 *
 *   <audio> ──▶ MediaElementSource ──▶ Analyser ──▶ Gain ──▶ destination
 *
 * The analyser sits *before* the gain node so muting silences the room without
 * flattening the visualiser. Muting a record does not stop it spinning.
 *
 * Nothing is created until the first play intent — `AudioContext` construction
 * before a user gesture produces a suspended context and a console warning, and
 * fetching 3MB of audio on page load is a cost most visitors should not pay.
 */

export interface SignalFrame {
  /** 0..1, smoothed overall loudness. */
  level: number
  /** 0..1, low band (roughly 40–250Hz). */
  bass: number
  /** 0..1, mid band. */
  mid: number
  /** 0..1, high band. */
  high: number
  /** Raw byte frequency data, already smoothed. Empty until the graph exists. */
  bins: Uint8Array
  playing: boolean
}

type Subscriber = (frame: SignalFrame) => void

interface AudioApi {
  tracks: Track[]
  track: Track
  trackIndex: number
  isPlaying: boolean
  isMuted: boolean
  volume: number
  currentTime: number
  duration: number
  /** True once the Web Audio graph exists (i.e. after the first play). */
  isReady: boolean
  error: string | null
  play: () => Promise<void>
  pause: () => void
  toggle: () => Promise<void>
  next: () => void
  previous: () => void
  selectTrack: (index: number) => void
  toggleMute: () => void
  setVolume: (value: number) => void
  seek: (ratio: number) => void
  /** Per-frame signal feed. Returns an unsubscribe function. */
  subscribe: (subscriber: Subscriber) => () => void
  getFrame: () => SignalFrame
}

const noopFrame: SignalFrame = {
  level: 0,
  bass: 0,
  mid: 0,
  high: 0,
  bins: new Uint8Array(0),
  playing: false,
}

const AudioApiContext = createContext<AudioApi | null>(null)

function readSmoothingCache() {
  if (typeof window === 'undefined') return 0.55
  const stored = window.localStorage.getItem('side-two:volume')
  const parsed = stored ? Number.parseFloat(stored) : Number.NaN
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : 0.55
}

export function AudioEngineProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const subscribersRef = useRef(new Set<Subscriber>())
  const frameRef = useRef<SignalFrame>({ ...noopFrame })
  const dataRef = useRef<Uint8Array | null>(null)

  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [volume, setVolumeState] = useState(readSmoothingCache)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const tracks = TRACKS
  const track = tracks[trackIndex] ?? tracks[0]

  /* ---------------------------------------------------------------- graph */

  const ensureGraph = useCallback(() => {
    const element = audioRef.current
    if (!element || contextRef.current) return

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!Ctor) {
      setError('This browser does not expose the Web Audio API.')
      return
    }

    const context = new Ctor()
    const analyser = context.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.82

    const gain = context.createGain()
    gain.gain.value = isMuted ? 0 : volume

    // A MediaElementSource can be created exactly once per element, so it is
    // cached on the ref and reused for every track change afterwards.
    if (!sourceRef.current) {
      sourceRef.current = context.createMediaElementSource(element)
    }

    sourceRef.current.connect(analyser)
    analyser.connect(gain)
    gain.connect(context.destination)

    contextRef.current = context
    analyserRef.current = analyser
    gainRef.current = gain
    dataRef.current = new Uint8Array(analyser.frequencyBinCount)
    setIsReady(true)
  }, [isMuted, volume])

  /* -------------------------------------------------------------- signal */

  const emit = useCallback((frame: SignalFrame) => {
    subscribersRef.current.forEach((subscriber) => subscriber(frame))
  }, [])

  useEffect(() => {
    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    if (!isPlaying) {
      stop()
      frameRef.current = { ...noopFrame, bins: frameRef.current.bins }
      const root = document.documentElement
      root.style.setProperty('--lg-level', '0')
      root.style.setProperty('--lg-bass', '0')
      root.style.setProperty('--lg-mid', '0')
      emit(frameRef.current)
      return stop
    }

    const analyser = analyserRef.current
    const data = dataRef.current

    const tick = () => {
      if (!analyser || !data) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>)

      // Band edges are in bins, not Hz, because that is what the analyser
      // hands over. At 48kHz with fftSize 1024 each bin is ~47Hz.
      const band = (from: number, to: number) => {
        let sum = 0
        const end = Math.min(to, data.length)
        for (let index = from; index < end; index += 1) sum += data[index]
        return end > from ? sum / (end - from) / 255 : 0
      }

      const nextBass = band(0, 6)
      const nextMid = band(6, 40)
      const nextHigh = band(40, 120)
      const nextLevel = clamp(
        nextBass * 0.55 + nextMid * 0.35 + nextHigh * 0.1,
        0,
        1,
      )

      // Asymmetric smoothing: snap up, fall away slowly. Symmetric smoothing
      // makes a kick drum look like a suggestion.
      const previous = frameRef.current
      const smooth = (current: number, target: number) =>
        target > current
          ? current + (target - current) * 0.55
          : current + (target - current) * 0.14

      const frame: SignalFrame = {
        level: smooth(previous.level, nextLevel),
        bass: smooth(previous.bass, nextBass),
        mid: smooth(previous.mid, nextMid),
        high: smooth(previous.high, nextHigh),
        bins: data,
        playing: true,
      }

      frameRef.current = frame

      const root = document.documentElement
      root.style.setProperty('--lg-level', frame.level.toFixed(3))
      root.style.setProperty('--lg-bass', frame.bass.toFixed(3))
      root.style.setProperty('--lg-mid', frame.mid.toFixed(3))

      emit(frame)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return stop
  }, [emit, isPlaying])

  /* --------------------------------------------------------------- player */

  const play = useCallback(async () => {
    const element = audioRef.current
    if (!element) return

    try {
      ensureGraph()
      // A context created during a gesture is running, but one resumed after a
      // route change may be suspended by the browser.
      if (contextRef.current?.state === 'suspended') {
        await contextRef.current.resume()
      }
      await element.play()
      setError(null)
    } catch {
      setError('Playback was blocked — press play once more.')
      setIsPlaying(false)
    }
  }, [ensureGraph])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause()
      return
    }
    await play()
  }, [isPlaying, pause, play])

  const selectTrack = useCallback(
    (index: number) => {
      const bounded = (index + tracks.length) % tracks.length
      setTrackIndex(bounded)
      setCurrentTime(0)
    },
    [tracks.length],
  )

  const next = useCallback(
    () => selectTrack(trackIndex + 1),
    [selectTrack, trackIndex],
  )
  const previous = useCallback(
    () => selectTrack(trackIndex - 1),
    [selectTrack, trackIndex],
  )

  const toggleMute = useCallback(() => setIsMuted((value) => !value), [])

  const setVolume = useCallback((value: number) => {
    setVolumeState(clamp(value, 0, 1))
  }, [])

  const seek = useCallback((ratio: number) => {
    const element = audioRef.current
    if (!element || !Number.isFinite(element.duration)) return
    element.currentTime = clamp(ratio, 0, 1) * element.duration
  }, [])

  const subscribe = useCallback((subscriber: Subscriber) => {
    subscribersRef.current.add(subscriber)
    subscriber(frameRef.current)
    return () => {
      subscribersRef.current.delete(subscriber)
    }
  }, [])

  const getFrame = useCallback(() => frameRef.current, [])

  /* --------------------------------------------------------------- effects */

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(
        isMuted ? 0 : volume,
        contextRef.current?.currentTime ?? 0,
        0.08,
      )
    }
    try {
      window.localStorage.setItem('side-two:volume', `${isMuted ? 0 : volume}`)
    } catch {
      /* private mode */
    }
  }, [isMuted, volume])

  // Changing `src` makes the browser run its own load algorithm, so there is
  // deliberately no `element.load()` here. Calling it explicitly — and doing so
  // on mount — reset the element to zero *after* a fast click had already
  // started playback, which looked like a player that reported "playing" while
  // sitting at 0:00. The effect now only resumes intent, and only once a real
  // source change has happened.
  const firstSource = useRef(true)
  const playingRef = useRef(isPlaying)

  // Mirror the transport state into a ref from an effect, so the source-change
  // effect below can read the latest intent without re-subscribing to it.
  useEffect(() => {
    playingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (firstSource.current) {
      firstSource.current = false
      return
    }
    if (playingRef.current) {
      void audioRef.current?.play().catch(() => setIsPlaying(false))
    }
  }, [track.src])

  useEffect(() => {
    const element = audioRef.current
    if (!element) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTime = () => setCurrentTime(element.currentTime)
    const onLoaded = () => setDuration(element.duration || 0)
    const onEnded = () => {
      // The rotation is an ambient loop, so it advances rather than stopping.
      selectTrack(trackIndex + 1)
      void element.play().catch(() => setIsPlaying(false))
    }

    element.addEventListener('play', onPlay)
    element.addEventListener('pause', onPause)
    element.addEventListener('timeupdate', onTime)
    element.addEventListener('loadedmetadata', onLoaded)
    element.addEventListener('durationchange', onLoaded)
    element.addEventListener('ended', onEnded)

    return () => {
      element.removeEventListener('play', onPlay)
      element.removeEventListener('pause', onPause)
      element.removeEventListener('timeupdate', onTime)
      element.removeEventListener('loadedmetadata', onLoaded)
      element.removeEventListener('durationchange', onLoaded)
      element.removeEventListener('ended', onEnded)
    }
  }, [selectTrack, trackIndex])

  // Media Session gives the loader a title, an artist and working hardware keys
  // on Android and iOS lock screens.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: 'Side Two — Selected Works',
    })
    navigator.mediaSession.setActionHandler('play', () => void play())
    navigator.mediaSession.setActionHandler('pause', () => pause())
    navigator.mediaSession.setActionHandler('nexttrack', () => next())
    navigator.mediaSession.setActionHandler('previoustrack', () => previous())
  }, [next, pause, play, previous, track.artist, track.title])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      void contextRef.current?.close().catch(() => undefined)
    }
  }, [])

  const api = useMemo<AudioApi>(
    () => ({
      tracks,
      track,
      trackIndex,
      isPlaying,
      isMuted,
      isReady,
      volume,
      currentTime,
      duration,
      error,
      play,
      pause,
      toggle,
      next,
      previous,
      selectTrack,
      toggleMute,
      setVolume,
      seek,
      subscribe,
      getFrame,
    }),
    [
      currentTime,
      duration,
      error,
      getFrame,
      isMuted,
      isPlaying,
      isReady,
      next,
      pause,
      play,
      previous,
      seek,
      selectTrack,
      setVolume,
      subscribe,
      toggle,
      toggleMute,
      track,
      trackIndex,
      tracks,
      volume,
    ],
  )

  return (
    <AudioApiContext.Provider value={api}>
      <audio ref={audioRef} src={track.src} preload="metadata" loop={false} />
      {children}
    </AudioApiContext.Provider>
  )
}

export function useAudioEngine(): AudioApi {
  const api = useContext(AudioApiContext)
  if (!api) {
    throw new Error('useAudioEngine must be used inside <AudioEngineProvider>')
  }
  return api
}

/**
 * Subscribe to the analyser without re-rendering React.
 *
 * Every consumer on this site is a canvas-free visual that writes transforms or
 * CSS variables, so 60 frames per second must not become 60 renders per second.
 * The callback is the only thing that runs.
 */
export function useAudioSignal(
  onFrame: (frame: SignalFrame) => void,
  enabled = true,
) {
  const { subscribe } = useAudioEngine()
  const callbackRef = useRef(onFrame)

  // The callback is replaced on every render; keep the ref current in an effect
  // rather than during render (writing a ref during render is exactly the kind
  // of side effect the compiler rules exist to catch).
  useEffect(() => {
    callbackRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    if (!enabled) return
    return subscribe((frame) => callbackRef.current(frame))
  }, [enabled, subscribe])
}
