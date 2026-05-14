import type * as ToneType from 'tone'

export interface DrumKit {
  kick: ToneType.MembraneSynth
  snare: ToneType.NoiseSynth
  hihat: ToneType.MetalSynth
  clap: ToneType.NoiseSynth
  dispose: () => void
}

export async function createDrumKit(Tone: typeof ToneType): Promise<DrumKit> {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
    },
  }).toDestination()
  kick.volume.value = 0

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.2,
    },
  }).toDestination()
  snare.volume.value = -6

  const hihat = new Tone.MetalSynth({
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    envelope: {
      attack: 0.001,
      decay: 0.1,
      release: 0.01,
    },
    volume: -12,
  }).toDestination()

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.2,
    },
  }).toDestination()
  clap.volume.value = -8

  return {
    kick,
    snare,
    hihat,
    clap,
    dispose: () => {
      kick.dispose()
      snare.dispose()
      hihat.dispose()
      clap.dispose()
    },
  }
}

export const DEFAULT_PATTERN: boolean[][] = [
  // Kick:  X . . . X . . . X . . . X . . .
  [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  // Snare: . . . . X . . . . . . . X . . .
  [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  // Hi-Hat: X X X X X X X X X X X X X X X X
  [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  // Clap:   . . . . . . . . X . . . . . . .
  [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
]

export const TRACK_NAMES = ['KICK', 'SNARE', 'HI-HAT', 'CLAP']
export const TRACK_COLORS = [
  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
]
export const TRACK_COLORS_DIM = [
  'bg-red-900/40',
  'bg-blue-900/40',
  'bg-amber-900/40',
  'bg-purple-900/40',
]
