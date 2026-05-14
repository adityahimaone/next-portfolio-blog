import { parseShapeOfYou, type NoteEvent } from './shape-of-you'

export interface Preset {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly isMelody?: boolean
  readonly bpm?: number
  readonly pads?: ReadonlyArray<{
    readonly id: string
    readonly note: string
    readonly type: string
    readonly rhythm?: string
    readonly delay: number
    readonly duration?: string
  }>
  readonly events?: ReadonlyArray<NoteEvent>
}

const shapeOfYouEvents = parseShapeOfYou()

export const presets: readonly Preset[] = [
  {
    id: 'preset1',
    name: 'Shape of You',
    description: 'Ed Sheeran melody — C# minor / 96 BPM',
    isMelody: true,
    bpm: 96,
    events: shapeOfYouEvents,
  },
  {
    id: 'preset2',
    name: 'Energetic EDM',
    description: 'Upbeat electronic dance music',
    pads: [
      { id: 'dummy-0-0', note: 'C5', type: 'synth', rhythm: '8n', delay: 0 },
      { id: 'dummy-2-0', note: 'E5', type: 'synth', rhythm: '8n', delay: 100 },
      { id: 'dummy-4-0', note: 'G5', type: 'synth', rhythm: '8n', delay: 200 },
      { id: 'dummy-6-0', note: 'C6', type: 'synth', rhythm: '8n', delay: 300 },
      { id: 'dummy-1-3', note: 'C2', type: 'bass', rhythm: '4n', delay: 400 },
      { id: 'dummy-3-3', note: 'A2', type: 'bass', rhythm: '4n', delay: 500 },
      { id: 'dummy-0-2', note: 'C1', type: 'kick', rhythm: '4n', delay: 600 },
      { id: 'dummy-2-2', note: 'D1', type: 'snare', rhythm: '4n', delay: 700 },
      { id: 'dummy-4-2', note: 'F#1', type: 'hihat', rhythm: '8n', delay: 800 },
      { id: 'dummy-6-2', note: 'A1', type: 'clap', rhythm: '2n', delay: 900 },
    ],
  },
  {
    id: 'preset3',
    name: 'Que Sera Sera',
    description: 'Classic song — 3 verses',
    isMelody: true,
    bpm: 80,
    pads: [
      { id: 'dummy-0-0', note: 'C4', type: 'melody', duration: '4n', delay: 0 },
      { id: 'dummy-1-0', note: 'D4', type: 'melody', duration: '4n', delay: 400 },
      { id: 'dummy-2-0', note: 'E4', type: 'melody', duration: '4n', delay: 800 },
      { id: 'dummy-4-0', note: 'G4', type: 'melody', duration: '4n', delay: 1200 },
      { id: 'dummy-2-1', note: 'E4', type: 'melody', duration: '4n', delay: 1600 },
      { id: 'dummy-4-1', note: 'G4', type: 'melody', duration: '4n', delay: 2000 },
      { id: 'dummy-2-2', note: 'E4', type: 'melody', duration: '4n', delay: 2400 },
      { id: 'dummy-4-2', note: 'G4', type: 'melody', duration: '4n', delay: 2800 },
      { id: 'dummy-2-3', note: 'E4', type: 'melody', duration: '4n', delay: 3200 },
      { id: 'dummy-4-3', note: 'G4', type: 'melody', duration: '4n', delay: 3600 },
      { id: 'dummy-2-4', note: 'E4', type: 'melody', duration: '4n', delay: 4000 },
      { id: 'dummy-5-0', note: 'A4', type: 'melody', duration: '4n', delay: 4400 },
      { id: 'dummy-4-4', note: 'G4', type: 'melody', duration: '4n', delay: 4800 },
      { id: 'dummy-5-1', note: 'A4', type: 'melody', duration: '4n', delay: 5200 },
      { id: 'dummy-4-5', note: 'G4', type: 'melody', duration: '4n', delay: 5600 },
      { id: 'dummy-2-5', note: 'E4', type: 'melody', duration: '4n', delay: 6000 },
      { id: 'dummy-3-0', note: 'F4', type: 'melody', duration: '4n', delay: 6400 },
      { id: 'dummy-5-2', note: 'A4', type: 'melody', duration: '4n', delay: 6800 },
      { id: 'dummy-6-0', note: 'B4', type: 'melody', duration: '4n', delay: 7200 },
      { id: 'dummy-0-2', note: 'C5', type: 'melody', duration: '4n', delay: 7600 },
      { id: 'dummy-6-1', note: 'B4', type: 'melody', duration: '4n', delay: 8000 },
      { id: 'dummy-5-3', note: 'A4', type: 'melody', duration: '4n', delay: 8400 },
      { id: 'dummy-4-6', note: 'G4', type: 'melody', duration: '4n', delay: 8800 },
      { id: 'dummy-5-4', note: 'A4', type: 'melody', duration: '4n', delay: 9200 },
      { id: 'dummy-6-2', note: 'B4', type: 'melody', duration: '4n', delay: 9600 },
      { id: 'dummy-5-5', note: 'A4', type: 'melody', duration: '4n', delay: 10000 },
      { id: 'dummy-1-1', note: 'D4', type: 'melody', duration: '4n', delay: 10400 },
      { id: 'dummy-2-6', note: 'E4', type: 'melody', duration: '4n', delay: 10800 },
      { id: 'dummy-3-1', note: 'F4', type: 'melody', duration: '4n', delay: 11200 },
      { id: 'dummy-2-7', note: 'E4', type: 'melody', duration: '4n', delay: 11600 },
      { id: 'dummy-6-3', note: 'B4', type: 'melody', duration: '4n', delay: 12000 },
      { id: 'dummy-0-3', note: 'C4', type: 'melody', duration: '4n', delay: 12400 },
      { id: 'dummy-0-4', note: 'C5', type: 'melody', duration: '4n', delay: 12800 },
      { id: 'dummy-6-4', note: 'B4', type: 'melody', duration: '4n', delay: 13200 },
      { id: 'dummy-5-6', note: 'A4', type: 'melody', duration: '4n', delay: 13600 },
      { id: 'dummy-3-2', note: 'F4', type: 'melody', duration: '4n', delay: 14000 },
      { id: 'dummy-5-7', note: 'A4', type: 'melody', duration: '4n', delay: 14400 },
      { id: 'dummy-6-5', note: 'B4', type: 'melody', duration: '4n', delay: 14800 },
      { id: 'dummy-1-2', note: 'D5', type: 'melody', duration: '4n', delay: 15200 },
      { id: 'dummy-0-5', note: 'C5', type: 'melody', duration: '4n', delay: 15600 },
      { id: 'dummy-5-8', note: 'A4', type: 'melody', duration: '4n', delay: 16000 },
      { id: 'dummy-4-7', note: 'G4', type: 'melody', duration: '4n', delay: 16400 },
      { id: 'dummy-2-8', note: 'E4', type: 'melody', duration: '4n', delay: 16800 },
      { id: 'dummy-4-8', note: 'G4', type: 'melody', duration: '4n', delay: 17200 },
      { id: 'dummy-4-9', note: 'G4', type: 'melody', duration: '4n', delay: 17600 },
      { id: 'dummy-5-9', note: 'A4', type: 'melody', duration: '4n', delay: 18000 },
      { id: 'dummy-4-10', note: 'G4', type: 'melody', duration: '4n', delay: 18400 },
      { id: 'dummy-2-9', note: 'E4', type: 'melody', duration: '4n', delay: 18800 },
      { id: 'dummy-4-11', note: 'G4', type: 'melody', duration: '4n', delay: 19200 },
      { id: 'dummy-1-3', note: 'D4', type: 'melody', duration: '4n', delay: 19600 },
      { id: 'dummy-4-12', note: 'G4', type: 'melody', duration: '4n', delay: 20000 },
      { id: 'dummy-1-4', note: 'D4', type: 'melody', duration: '4n', delay: 20400 },
      { id: 'dummy-2-10', note: 'E4', type: 'melody', duration: '4n', delay: 20800 },
      { id: 'dummy-3-3', note: 'F4', type: 'melody', duration: '4n', delay: 21200 },
      { id: 'dummy-6-6', note: 'B3', type: 'melody', duration: '4n', delay: 21600 },
      { id: 'dummy-0-6', note: 'C4', type: 'melody', duration: '4n', delay: 22000 },
      { id: 'dummy-1-5', note: 'D4', type: 'melody', duration: '4n', delay: 22400 },
      { id: 'dummy-2-11', note: 'E4', type: 'melody', duration: '4n', delay: 22800 },
      { id: 'dummy-3-4', note: 'F4', type: 'melody', duration: '4n', delay: 23200 },
      { id: 'dummy-6-7', note: 'B4', type: 'melody', duration: '4n', delay: 23600 },
      { id: 'dummy-0-7', note: 'C5', type: 'melody', duration: '2n', delay: 24000 },
    ],
  },
  {
    id: 'preset4',
    name: 'Drum Solo',
    description: 'Live drum kit jam session',
    pads: [
      { id: 'dummy-0-0', note: 'C1', type: 'kick', rhythm: '4n', delay: 0 },
      { id: 'dummy-2-0', note: 'D1', type: 'snare', rhythm: '4n', delay: 150 },
      { id: 'dummy-4-0', note: 'F#1', type: 'hihat', rhythm: '8n', delay: 300 },
      { id: 'dummy-6-0', note: 'A1', type: 'clap', rhythm: '2n', delay: 450 },
      { id: 'dummy-1-1', note: 'C2', type: 'bass', rhythm: '4n', delay: 600 },
      { id: 'dummy-3-1', note: 'E2', type: 'bass', rhythm: '4n', delay: 750 },
    ],
  },
] as const
