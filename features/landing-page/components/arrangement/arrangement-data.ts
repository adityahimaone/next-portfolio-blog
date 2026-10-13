import { EXPERIENCES, MIXER_DATA } from '../../constants'

/**
 * Two datasets, one arrangement.
 *
 * `making` (the default) is the frontend process rendered as a session: the
 * ruler's unit is a **workflow stage**, not elapsed time, and each lane is one
 * kind of production work. Nothing here is an employer or a school — those live
 * in the Experience section further down the page, which is where a reader looks
 * for them. Putting them in the hero as well said the same thing twice.
 *
 * `career` is the earlier reading of the same scene: lanes are disciplines,
 * the ruler is calendar years, clips are roles and programmes. It is kept whole
 * and switchable, because the geometry, the seam and the About interior do not
 * care which of the two is loaded — only the labels and the axis change.
 *
 * Switch it by editing `ARRANGEMENT_MODE` below; every consumer reads
 * `ARRANGEMENT_LANES` / `ARRANGEMENT_CLIPS` / `RULER_LABELS`, so nothing else
 * has to know the mode exists.
 */

export type ArrangementMode = 'making' | 'career'

/** Edit this one line to load the career record instead of the making session. */
export const ARRANGEMENT_MODE: ArrangementMode = 'making' as ArrangementMode

export type ArrangementLane = {
  id: string
  label: string
  height: 'tall' | 'normal'
}

export type ArrangementClip = {
  id: string
  laneId: string
  kind: 'name' | 'role' | 'project' | 'profile'
  label: string
  /** Normalised 0..1 against the world width — `x` is derived, never stored. */
  start: number
  end: number
  color: string
  /**
   * The `MIXER_DATA` group whose technologies this clip is drawn from. Present
   * on the three practice clips and absent on everything else, because only
   * those three have a mixer group behind them. The mixer reads it to know
   * which span of the arrangement a strip's channel is live in.
   */
  group?: string
  /** Normalised bar heights. The bar **count** is the data; see below. */
  notes?: readonly number[]
  detail?: string
  /** Fraction of the lane this clip occupies vertically. Set by `layoutLanes`. */
  top?: number
  height?: number
}

export const YEAR_MIN = 2018
export const YEAR_MAX = 2026.75

/**
 * Bars for a clip, one per channel in the matching mixer group.
 *
 * The count is the data: it is the number of technologies actually listed for
 * that stage in `MIXER_DATA`. The heights are an envelope over that count, which
 * is what a clip's waveform is — not decoration, and not a random pattern.
 */
function envelope(count: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1)
    return Math.round((0.25 + 0.75 * Math.sin(Math.PI * t)) * 100) / 100
  })
}

const channels = (id: string) =>
  MIXER_DATA.find((group) => group.id === id)?.channels.length ?? 0

/**
 * A pattern clip's notes, one per technology, each as long as that technology's
 * listed level. A DAW draws a pattern as note blocks, so this is the honest
 * version of the thumbnail: the same numbers the mixer strips below are set to.
 */
const levels = (id: string): readonly number[] =>
  (MIXER_DATA.find((group) => group.id === id)?.channels ?? []).map(
    (channel) => channel.level / 100,
  )

/** Bars across the world. The ruler counts them and the lane grid is drawn on them. */
export const ARRANGEMENT_BARS = 32

/**
 * Stacks overlapping clips inside a lane.
 *
 * A DAW never paints two clips on top of each other: overlapping ones share the
 * lane, split into rows. The career record needs this and the making session
 * does not — `PT Fatiha Sakti` runs through `80&Company`, and the degree runs
 * through all three academies — but the rule belongs to the arrangement rather
 * than to one dataset, so both go through it.
 *
 * Greedy first-fit over clips sorted by start, which is exact for interval
 * graphs and therefore gives the fewest rows the lane can be drawn in.
 */
function layoutLanes(
  clips: readonly ArrangementClip[],
): readonly ArrangementClip[] {
  const byLane = new Map<string, ArrangementClip[]>()
  clips.forEach((clip) => {
    const lane = byLane.get(clip.laneId)
    if (lane) lane.push(clip)
    else byLane.set(clip.laneId, [clip])
  })

  const placement = new Map<string, { row: number; count: number }>()
  byLane.forEach((laneClips) => {
    const ends: number[] = []
    const sorted = [...laneClips].sort((a, b) => a.start - b.start)
    sorted.forEach((clip) => {
      let row = ends.findIndex((end) => end <= clip.start + 1e-9)
      if (row === -1) {
        row = ends.length
        ends.push(clip.end)
      } else {
        ends[row] = clip.end
      }
      placement.set(clip.id, { row, count: ends.length })
    })
    // `ends.length` only settles once the whole lane is placed, so the counts
    // are written in a second pass. Writing them inline gives every clip the
    // row count as it stood when that clip was placed, and the rows then fail
    // to fill the lane.
    const count = ends.length
    sorted.forEach((clip) =>
      placement.set(clip.id, { row: placement.get(clip.id)?.row ?? 0, count }),
    )
  })

  return clips.map((clip) => {
    const { row, count } = placement.get(clip.id) ?? { row: 0, count: 1 }
    return { ...clip, top: row / count, height: 1 / count }
  })
}

export const MAKING_LANES: readonly ArrangementLane[] = [
  { id: 'name', label: 'NAME', height: 'tall' },
  { id: 'profile', label: 'PROFILE', height: 'normal' },
  { id: 'compose', label: 'COMPOSE', height: 'normal' },
  { id: 'connect', label: 'CONNECT', height: 'normal' },
  { id: 'ship', label: 'SHIP', height: 'normal' },
  { id: 'practice', label: 'PRACTICE', height: 'normal' },
]

/** The ruler's five stages. The axis is a process, so the ticks are named. */
export const MAKING_RULER_LABELS = [
  'DISCOVER',
  'DEFINE',
  'COMPOSE',
  'CONNECT',
  'SHIP',
] as const

const MAKING_CLIPS_RAW: readonly ArrangementClip[] = [
  {
    id: 'name',
    laneId: 'name',
    kind: 'name',
    label: 'ADITYA HIMAWAN',
    // The one documented exception to "a clip's width is a duration": the name
    // is not a stage, so it spans the whole record.
    start: 0,
    end: 1,
    color: 'var(--signal-orange)',
  },
  {
    id: 'profile',
    laneId: 'profile',
    kind: 'profile',
    label: 'PROFILE',
    start: 0.42,
    end: 0.92,
    color: '#d7b36f',
    detail: 'The practice behind the screen — how the work is chosen and cut.',
  },
  {
    id: 'compose',
    laneId: 'compose',
    kind: 'project',
    label: 'COMPOSE / INTERACTION → COMPONENTS',
    start: 0.05,
    end: 0.34,
    color: '#c07352',
    group: 'frontend',
    notes: levels('frontend'),
    detail: 'Understand the interaction, then build the pieces it needs.',
  },
  {
    id: 'connect',
    laneId: 'connect',
    kind: 'project',
    label: 'CONNECT / DATA BOUNDARY',
    start: 0.3,
    end: 0.66,
    color: '#7d97ab',
    group: 'app-data',
    notes: levels('app-data'),
    detail: 'Typed data at the boundary, rendering chosen per route.',
  },
  {
    id: 'ship',
    laneId: 'ship',
    kind: 'project',
    label: 'SHIP / OBSERVE',
    start: 0.62,
    end: 0.97,
    color: '#4e91a8',
    group: 'delivery-infra',
    notes: levels('delivery-infra'),
    detail: 'Deploy, watch it, and fix what the meters show.',
  },
  {
    id: 'practice',
    laneId: 'practice',
    kind: 'project',
    label: 'PRACTICE / READ THE BREAKAGE',
    start: 0.1,
    end: 0.88,
    color: '#6f8a6d',
    notes: envelope(MAKING_RULER_LABELS.length),
    detail: 'Write down what broke, so the next build starts further along.',
  },
]

// ─── Career mode ─────────────────────────────────────────

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}

/**
 * `'OCT 2022 - PRESENT'` → `[2022.75, 2026.75]`.
 *
 * Parsed rather than restated, so the career axis cannot drift from the periods
 * the Experience section prints.
 */
function parsePeriod(period: string): [number, number] {
  const [from, to] = period.split('-').map((part) => part.trim())
  const read = (token: string, fallback: number) => {
    const [month, year] = token.split(/\s+/)
    if (token === 'PRESENT' || !year) return fallback
    return Number(year) + (MONTHS[month] ?? 0) / 12
  }
  return [read(from, YEAR_MIN), read(to, YEAR_MAX)]
}

const toFraction = (year: number) => (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)

export const CAREER_LANES: readonly ArrangementLane[] = [
  { id: 'name', label: 'NAME', height: 'tall' },
  { id: 'profile', label: 'PROFILE', height: 'normal' },
  { id: 'work', label: 'WORK', height: 'normal' },
  { id: 'education', label: 'EDUCATION', height: 'normal' },
]

export const CAREER_RULER_LABELS = Array.from({ length: 9 }, (_, index) =>
  String(YEAR_MIN + index),
)

const CAREER_COLORS = ['#d7b36f', '#7d97ab', '#c07352', '#6f8a6d'] as const

/**
 * A label short enough to fit a narrow clip.
 *
 * The education lane's clips are the narrowest in either dataset — a seven-month
 * course against an eight-year axis is 5% of the width — and the full legal name
 * of an institution is four words of which the first is a generic prefix. The
 * first *distinctive* word is what fits and what a reader recognises; the full
 * name and the programme go in the clip's detail line, where there is room.
 */
const GENERIC_NAME_WORDS = new Set([
  'PT',
  'CV',
  'UNIVERSITAS',
  'UNIVERSITY',
  'AKADEMI',
  'ACADEMY',
  'INSTITUT',
  'SEKOLAH',
])

function shortLabel(name: string): string {
  const words = name.split(/\s+/)
  const distinctive = words.find(
    (word) => !GENERIC_NAME_WORDS.has(word.toUpperCase()),
  )
  return (distinctive ?? words[0]).toUpperCase()
}

function buildCareerClips(): ArrangementClip[] {
  const clips: ArrangementClip[] = [
    {
      id: 'name',
      laneId: 'name',
      kind: 'name',
      label: 'ADITYA HIMAWAN',
      start: 0,
      end: 1,
      color: 'var(--signal-orange)',
    },
  ]
  const roles = EXPERIENCES.filter((item) => !item.isGroup)
  const education = EXPERIENCES.flatMap((item) => item.items ?? [])

  roles.forEach((role, index) => {
    const [start, end] = parsePeriod(role.period)
    clips.push({
      id: `role-${role.id}`,
      laneId: 'work',
      kind: 'role',
      label: shortLabel(role.company),
      start: toFraction(start),
      end: toFraction(end),
      color: CAREER_COLORS[index % CAREER_COLORS.length],
      detail: `${role.role} · ${role.location}`,
    })
  })

  education.forEach((item, index) => {
    const [start, end] = parsePeriod(item.period)
    clips.push({
      id: `education-${index}`,
      laneId: 'education',
      kind: 'role',
      label: shortLabel(item.company),
      start: toFraction(start),
      end: toFraction(end),
      color: CAREER_COLORS[(index + 2) % CAREER_COLORS.length],
      detail: `${item.role} · ${item.company}`,
    })
  })

  // The seam target. Its centre is the year both sides of the seam agree on,
  // and it is derived from the longest role rather than chosen.
  const primary = clips
    .filter((clip) => clip.laneId === 'work')
    .reduce((widest, clip) =>
      clip.end - clip.start > widest.end - widest.start ? clip : widest,
    )
  clips.push({
    id: 'profile',
    laneId: 'profile',
    kind: 'profile',
    label: 'PROFILE',
    start: primary.start,
    end: primary.end,
    color: '#d7b36f',
    detail: 'The practice behind the record.',
  })

  return clips
}

export const MAKING_CLIPS: readonly ArrangementClip[] =
  layoutLanes(MAKING_CLIPS_RAW)
export const CAREER_CLIPS: readonly ArrangementClip[] =
  layoutLanes(buildCareerClips())

export const ARRANGEMENT_LANES =
  ARRANGEMENT_MODE === 'career' ? CAREER_LANES : MAKING_LANES
export const ARRANGEMENT_CLIPS =
  ARRANGEMENT_MODE === 'career' ? CAREER_CLIPS : MAKING_CLIPS
export const RULER_LABELS: readonly string[] =
  ARRANGEMENT_MODE === 'career' ? CAREER_RULER_LABELS : MAKING_RULER_LABELS
export const RULER_AXIS_LABEL =
  ARRANGEMENT_MODE === 'career' ? 'YEARS' : 'WORKFLOW STAGE'

// ─── About interior ──────────────────────────────────────

export type AboutTrack = {
  id: string
  title: string
  note: string
  heading: string
  story: string
  color: string
  /** The mixer group whose channels this track covers. */
  group: string
  /** Normalised 0..1, derived from that group's share of the whole skill set. */
  start: number
  end: number
  bars: readonly number[]
}

type AboutSeed = Omit<AboutTrack, 'start' | 'end' | 'bars'>

/**
 * The three tracks the PROFILE clip opens onto.
 *
 * Their clip widths are not decorative: each one is that track's share of the
 * total number of channels listed across `MIXER_DATA`, so FOCUS is the widest
 * because it covers the most of what is actually in the rack. The bars are the
 * same envelope the hero clips use, one per channel.
 *
 * The copy is the About section's own prose, unchanged except for one stale
 * claim: the site no longer runs on a VPS behind Nginx — it is deployed to
 * Cloudflare Workers through OpenNext. That sentence was describing
 * infrastructure that had already been retired, which is the one thing a
 * portfolio cannot afford.
 */
const ABOUT_SEEDS: readonly AboutSeed[] = [
  {
    id: 'focus',
    title: 'FOCUS',
    note: 'REACT / NEXT.JS / TYPESCRIPT / TAILWIND / TANSTACK / JQUERY',
    heading: 'Start with the user.',
    color: '#d7b36f',
    group: 'frontend',
    story:
      'I begin with the interaction, not the component, because the component is the cheap part to get right. Four years of production frontends, most of them React and Next.js on systems where the interface is load-bearing rather than decorative.',
  },
  {
    id: 'systems',
    title: 'SYSTEMS',
    note: 'NODE.JS / GO / POSTGRESQL / PRISMA',
    heading: 'Build the system.',
    color: '#7d97ab',
    group: 'app-data',
    story:
      'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent. The structure underneath the first screen decides whether the next six months are cheap or expensive: typed data at the boundary, rendering chosen per route rather than by default.',
  },
  {
    id: 'range',
    title: 'RANGE',
    note: 'DOCKER / NGINX / GRAFANA / UPTIME KUMA',
    heading: 'Stay close to production.',
    color: '#b68ba5',
    group: 'delivery-infra',
    story:
      'I work across application data, deployment and monitoring when the frontend needs more than a polished screen. This site is built with Next.js and deployed to Cloudflare Workers through OpenNext, with its data and rendering watched end to end — which is why the writing here is about what broke.',
  },
]

const TOTAL_CHANNELS = ABOUT_SEEDS.reduce(
  (total, seed) => total + channels(seed.group),
  0,
)

export const ABOUT_TRACKS: readonly AboutTrack[] = (() => {
  let cursor = 0
  return ABOUT_SEEDS.map((seed) => {
    const count = channels(seed.group)
    const share = count / TOTAL_CHANNELS
    const start = cursor
    cursor = Math.min(1, cursor + share)
    return { ...seed, start, end: cursor, bars: envelope(count) }
  })
})()

/**
 * The three proof readouts, each with the ceiling its meter is drawn against.
 *
 * A bar with no printed scale is a decoration that happens to sit next to a
 * number. With the ceiling printed, the bar is a reading.
 */
export const PROOF_READOUTS = [
  { value: '4+', unit: 'YEARS', meter: '0–6', ratio: 4 / 6 },
  { value: '3', unit: 'PRODUCT TEAMS', meter: '0–5', ratio: 3 / 5 },
  { value: '15K+', unit: 'USERS', meter: '0–20K', ratio: 15 / 20 },
] as const

// ─── Mixer ───────────────────────────────────────────────

export type MixerStrip = {
  id: string
  index: number
  name: string
  /** 0..1 — the technology's listed level; the fader and the meter ceiling. */
  level: number
  group: string
  color: string
}

/**
 * The three groups' colours, exported because they are the one palette the
 * whole page agrees on: a lane header, the clip above it, the mixer strip below
 * it and the Patch's module all take their hue from here. Typed in once.
 */
export const GROUP_COLORS: Record<string, string> = {
  frontend: '#c07352',
  'app-data': '#7d97ab',
  'delivery-infra': '#4e91a8',
}

/**
 * One insert per listed technology, coloured by the stage that uses it, so the
 * strip under a clip is the same colour as the clip above it.
 */
export const MIXER_STRIPS: readonly MixerStrip[] = MIXER_DATA.flatMap((group) =>
  group.channels.map((channel) => ({
    id: `${group.id}-${channel.name}`,
    name: channel.name,
    level: channel.level / 100,
    group: group.id,
    color: GROUP_COLORS[group.id] ?? '#8e928e',
  })),
).map((strip, index) => ({ ...strip, index: index + 1 }))

/**
 * The name clip's waveform: one sample per character of the name, so the shape
 * is the name rendered as audio rather than a random pattern. Deterministic, so
 * the server and the client draw the same path.
 */
export function nameWave(text: string, points = 96): readonly number[] {
  const codes = Array.from(text).map((char) => char.charCodeAt(0))
  return Array.from({ length: points }, (_, i) => {
    const code = codes[i % codes.length]
    const wobble = Math.sin(i * 0.9 + code) * 0.5 + 0.5
    const swell = 0.35 + 0.65 * Math.abs(Math.sin((i / points) * Math.PI * 3))
    return Math.round((0.15 + 0.85 * wobble * swell) * 100) / 100
  })
}
