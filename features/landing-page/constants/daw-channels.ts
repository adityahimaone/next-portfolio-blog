export const CHANNEL_COLORS = [
  '#C84B4B', // 1 – red
  '#D4864A', // 2 – orange
  '#C9A447', // 3 – gold
  '#7ABB5E', // 4 – green
  '#4A9EC9', // 5 – blue
  '#8A5FC9', // 6 – purple
  '#C95FAA', // 7 – pink
  '#5FC9C9', // 8 – teal
  '#C84B4B', // 9 – red (cycles)
  '#D4864A', // 10
  '#C9A447', // 11
  '#7ABB5E', // 12
  '#4A9EC9', // 13
] as const

export interface DawChannel {
  id: number
  label: string        // 6-char max, appears on scribble strip
  color: string        // from CHANNEL_COLORS
  level: number        // 0–100, fader position (skill level)
  soloActive?: boolean
  muteActive?: boolean
}

export const DAW_CHANNELS: DawChannel[] = [
  { id: 1, label: 'NEXT.JS', color: CHANNEL_COLORS[0], level: 92 },
  { id: 2, label: 'TYPSCR', color: CHANNEL_COLORS[1], level: 88 },
  { id: 3, label: 'TAILWND', color: CHANNEL_COLORS[2], level: 85 },
  { id: 4, label: 'FRAMER', color: CHANNEL_COLORS[3], level: 78 },
  { id: 5, label: 'NODE', color: CHANNEL_COLORS[4], level: 72 },
  { id: 6, label: 'PYTHON', color: CHANNEL_COLORS[5], level: 68 },
  { id: 7, label: 'IDX', color: CHANNEL_COLORS[6], level: 80 },
  { id: 8, label: 'HERMES', color: CHANNEL_COLORS[7], level: 75 },
]
