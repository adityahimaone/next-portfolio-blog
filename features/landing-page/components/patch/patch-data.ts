import { MIXER_DATA } from '../../constants'
import { ABOUT_TRACKS, type AboutTrack } from '../../rack-01/about-copy'
import {
  ARRANGEMENT_BARS,
  ARRANGEMENT_CLIPS,
  GROUP_COLORS,
} from '../arrangement/arrangement-data'
import { PATCH_STAGGER } from './patch-timeline'

/**
 * The three modules, derived — never typed in twice.
 *
 * Group, label, control type and every level come from `MIXER_DATA`. The take
 * (heading, story, credits) comes from `ABOUT_TRACKS`, index for index. The
 * stage names are the hero ruler's last three, so the dive never renames
 * anything on the way in.
 */
export const PATCH_STAGES = ['COMPOSE', 'CONNECT', 'SHIP'] as const

export type PatchControl = { name: string; level: number }

export type PatchModule = {
  id: string
  index: number
  stage: (typeof PATCH_STAGES)[number]
  label: string
  /** `MIXER_DATA[].type` — FRONTEND is faders, the other two are knobs. */
  control: 'fader' | 'knob'
  color: string
  controls: readonly PatchControl[]
  /** Inline `--room`: the share of a sweep left once the stagger is spent. */
  room: number
  take: AboutTrack
}

export const PATCH_MODULE_LIST: readonly PatchModule[] = MIXER_DATA.map(
  (group, index) => ({
    id: group.id,
    index,
    stage: PATCH_STAGES[index],
    label: group.label,
    control: group.type === 'fader' ? 'fader' : 'knob',
    color: GROUP_COLORS[group.id],
    controls: group.channels.map((channel) => ({
      name: channel.name,
      level: channel.level / 100,
    })),
    room: 1 - (group.channels.length - 1) * PATCH_STAGGER,
    take: ABOUT_TRACKS[index],
  }),
)

/**
 * The nameplate's loop brace: the PROFILE clip's own start and end, as the bars
 * the hero's ruler already counts. Same formula as the toolbar's readout
 * (`floor(bars) + 1`), so a bar number means one thing across the page.
 */
const profile = ARRANGEMENT_CLIPS.find((clip) => clip.kind === 'profile')!
export const PATCH_LOOP = {
  label: profile.label,
  color: profile.color,
  from: Math.floor(profile.start * ARRANGEMENT_BARS) + 1,
  to: Math.floor(profile.end * ARRANGEMENT_BARS) + 1,
} as const
