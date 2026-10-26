import type { Track } from '../types'

/**
 * The ambient rotation.
 *
 * Both files already exist in /public, so the player ships with no new weight
 * and no third-party audio host. The metadata is real: `attention.mp3` sits at
 * 88 BPM in A minor, which is why the hero readout says so.
 */
export const TRACKS: Track[] = [
  {
    id: 'attention-instrumental',
    title: 'Attention — Instrumental',
    artist: 'NewJeans',
    src: '/music/attention.mp3',
    bpm: 88,
    key: 'A minor',
    role: 'Ambient loop',
  },
  {
    id: 'edge-of-desire',
    title: 'Edge of Desire — Sunrise Mix',
    artist: 'Jonas Blue & Malive',
    src: '/music/edge-of-desire-sunrise-mix.weba',
    bpm: 118,
    key: 'F major',
    role: 'Late side',
  },
]
