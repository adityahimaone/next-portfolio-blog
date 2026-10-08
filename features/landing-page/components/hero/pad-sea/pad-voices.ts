/**
 * The pad sea's voices.
 *
 * These are the *same* voices the Contact controller plays, not a new set:
 * `section-contact.tsx` triggers WebAudio oscillators and one noise buffer with
 * a fixed index -> pitch map, so the hero follows that map rather than
 * re-inventing it. (Contact does not use Tone.js, despite the dependency
 * sitting in package.json — copying what the module actually does is the point.)
 *
 * Lazy by construction: the AudioContext is only constructed inside `unlock()`,
 * which is only ever called from a real pointer event. Nothing here runs on
 * load, and nothing autoplays. A hero that makes noise before being asked would
 * be the single worst thing on this page.
 */

/**
 * Index -> note, in the same order as Contact's sixteen pads:
 * Email, LinkedIn, GitHub, Resume, Kick, Snare, Chord, Tone, Sub, Rim, Fifth,
 * Pluck, Bass, Hat, Minor, Bell.
 */
export const PAD_NOTES = [
  261.63, 329.63, 392, 523.25, 82.41, 196, 261.63, 659.25, 65.41, 880, 392,
  783.99, 110, 1200, 220, 1046.5,
] as const

/** Indices that are struck noise rather than pitched tone, as in Contact. */
const NOISE_INDICES = new Set([5, 13])

export const PAD_BPM = 120

/**
 * What the LCD calls each pad. The first four are Contact's link pads, which in
 * the hero are just the four pitched notes above the kit, so they are labelled
 * by pitch rather than by "Email".
 */
export const PAD_VOICE_NAMES = [
  'C4',
  'E4',
  'G4',
  'C5',
  'KICK',
  'SNARE',
  'CHORD',
  'TONE',
  'SUB',
  'RIM',
  'FIFTH',
  'PLUCK',
  'BASS',
  'HAT',
  'MINOR',
  'BELL',
] as const

export type PadAudio = {
  /** Resume/create the context. Must be called from a user gesture. */
  unlock: () => void
  play: (index: number) => void
  /** True once a gesture has happened; drives beat-synced LED pulse. */
  isEnabled: () => boolean
  /** Milliseconds since the transport started, or null when it has not. */
  startedAt: () => number | null
  dispose: () => void
}

/**
 * The transport is visual only. There is no sequencer running in the hero, so
 * the honest thing is a 120 BPM phase locked to the first pad hit — enough to
 * pulse the LEDs in time with About's sequencer without pretending to play.
 */
export function createPadAudio(): PadAudio {
  let context: AudioContext | null = null
  let startedAtMs: number | null = null

  const unlock = () => {
    if (context) {
      void context.resume()
      return
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return
    context = new Ctor()
    void context.resume()
    startedAtMs = window.performance.now()
  }

  const play = (index: number) => {
    const audio = context
    if (!audio) return

    const now = audio.currentTime
    const gain = audio.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26)
    gain.connect(audio.destination)

    const voice =
      ((index % PAD_NOTES.length) + PAD_NOTES.length) % PAD_NOTES.length

    if (NOISE_INDICES.has(voice)) {
      const buffer = audio.createBuffer(
        1,
        audio.sampleRate * 0.16,
        audio.sampleRate,
      )
      const data = buffer.getChannelData(0)
      for (let sample = 0; sample < data.length; sample += 1) {
        data[sample] = Math.random() * 2 - 1
      }
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.connect(gain)
      source.start(now)
      return
    }

    const frequencies =
      voice === 6
        ? [261.63, 329.63, 392]
        : voice === 10
          ? [261.63, 392]
          : voice === 14
            ? [220, 261.63, 329.63]
            : [PAD_NOTES[voice]]

    frequencies.forEach((frequency) => {
      const oscillator = audio.createOscillator()
      oscillator.type =
        voice === 4 || voice === 8
          ? 'sine'
          : voice === 12
            ? 'square'
            : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, now)
      // The kick drops its pitch the way Contact's does, so the low pads read
      // as a kick drum rather than as a beep.
      if (voice === 4) {
        oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.2)
      }
      oscillator.connect(gain)
      oscillator.start(now)
      oscillator.stop(now + 0.28)
    })
  }

  return {
    unlock,
    play,
    isEnabled: () => context !== null,
    startedAt: () => startedAtMs,
    dispose: () => {
      void context?.close()
      context = null
      startedAtMs = null
    },
  }
}

/** 1 on the beat, decaying to 0 before the next one. */
export function beatPulse(elapsedMs: number): number {
  const beats = (elapsedMs / 1000) * (PAD_BPM / 60)
  const phase = beats - Math.floor(beats)
  return Math.exp(-phase * 5)
}
