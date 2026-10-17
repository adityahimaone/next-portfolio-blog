/**
 * What the Contact section says, and the small pieces of logic behind how it
 * says it. No React, no DOM, so all of it is testable.
 *
 * The performance controller (the 16-pad deck) is untouched and is still the
 * way in. Everything *around* it is rebuilt as the rest of one session desk:
 *
 * - a **recall console** (the old FAQ): five channels, each a question, and an
 *   LCD monitor that plays the answer;
 * - a **signal path**: how a project actually flows, as four patched stages;
 * - a **brief builder**: pick the kind of work and the timing, add a line, and
 *   it composes the email for you.
 *
 * Copy is written to be useful and checkable. There is no availability claim
 * with a date on it, no rate, no client list: the only promise is the one the
 * old page already made (replies usually land within a couple of days), and the
 * "no" on native mobile is kept, because a no saves both people a week.
 */

export type Channel = {
  /** Silkscreen label on the strip. */
  tag: string
  question: string
  answer: string
}

export const CHANNELS: readonly Channel[] = [
  {
    tag: 'SCOPE',
    question: 'What kind of work do you take on?',
    answer:
      'Frontend work where the hard part is the state or the edge cases rather than the styling: internal tools, content-heavy public sites, and products that have to work on a phone or on a bad connection.',
  },
  {
    tag: 'BACKEND',
    question: 'Do you work with existing backends?',
    answer:
      'Mostly. Most of the shipped work is a frontend over a service that already exists. Running the infrastructure too is something I do when the product genuinely needs it.',
  },
  {
    tag: 'MOBILE',
    question: 'Do you do React Native or native mobile?',
    answer:
      'No. The mobile work here is responsive web. The habits transfer, the stack does not, and I would rather say so now than take it and hand it back.',
  },
  {
    tag: 'REPLY',
    question: 'How fast do you reply?',
    answer:
      'Usually within a couple of days. If there is a date that matters, put it in the first line so it is the first thing I read.',
  },
  {
    tag: 'FIRST MAIL',
    question: 'What should the first message say?',
    answer:
      'The problem, who it is for, and the constraint that hurts: a date, a budget, a stack you cannot change. A link helps if there is one. Two paragraphs beat a deck.',
  },
]

export type Stage = { step: string; title: string; copy: string }

/** The signal path: input to output, left to right. */
export const PATH: readonly Stage[] = [
  {
    step: 'IN',
    title: 'Brief',
    copy: 'You send the problem, the constraint and the date. I read it properly, not in a queue.',
  },
  {
    step: '01',
    title: 'Scope',
    copy: 'I reply with the questions that change the plan, and a plan small enough to disagree with.',
  },
  {
    step: '02',
    title: 'Build',
    copy: 'Small increments, a working build you can click at every step instead of a deck about one.',
  },
  {
    step: 'OUT',
    title: 'Hand off',
    copy: 'Code someone else can run, tests where they earn their keep, and notes that outlive the project.',
  },
]

export type Choice = { id: string; label: string; line: string }

export const PROJECT_TYPES: readonly Choice[] = [
  { id: 'build', label: 'New build', line: 'a new frontend build' },
  { id: 'rescue', label: 'Fix a UI', line: 'a frontend that needs untangling' },
  { id: 'design', label: 'Design eng.', line: 'design engineering work' },
  { id: 'talk', label: 'Just talk', line: 'a conversation about a problem' },
]

export const TIMELINES: readonly Choice[] = [
  { id: 'soon', label: 'Soon', line: 'as soon as possible' },
  { id: 'month', label: 'This quarter', line: 'within the next few months' },
  { id: 'open', label: 'No rush', line: 'with no fixed date' },
]

export const NOTE_LIMIT = 480

/** The longest `mailto:` link composed. Outlook-class clients refuse past ~2000. */
export const MAX_HREF = 1900

export type BriefInput = {
  type: string | null
  timeline: string | null
  note: string
}

export type Brief = { subject: string; body: string; href: string }

const find = (list: readonly Choice[], id: string | null) =>
  list.find((choice) => choice.id === id) ?? null

/** Collapse whitespace runs and cap the length, so a pasted wall of text cannot
 * produce a `mailto:` link too long for a mail client to open. */
export function cleanNote(note: string, limit = NOTE_LIMIT): string {
  const flat = note
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
  return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat
}

/**
 * The email the builder composes. Pure: the same input is the same brief.
 *
 * Nothing selected is still a valid brief ("a frontend project"), so the
 * Compose button is never dead; picking things only makes it more specific.
 */
export function composeBrief(input: BriefInput, to: string): Brief {
  const type = find(PROJECT_TYPES, input.type)
  const timeline = find(TIMELINES, input.timeline)

  const subject = type
    ? `Brief: ${type.label.toLowerCase()}`
    : 'Brief: a frontend project'

  const build = (note: string) => {
    const lines = [
      'Hi Aditya,',
      '',
      `I am looking for ${type ? type.line : 'help with a frontend project'}${
        timeline ? `, ${timeline.line}` : ''
      }.`,
    ]
    if (note) lines.push('', 'About it:', note)
    lines.push('', 'Thanks,')
    const body = lines.join('\n')
    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    return { subject, body, href }
  }

  // The cap that matters is on the *encoded* link, not the typed note: a
  // character outside ASCII becomes up to nine characters of percent-escapes,
  // so a note well under `NOTE_LIMIT` can still make a link some mail clients
  // refuse to open. Shrink the note, not the browser's patience.
  let note = cleanNote(input.note)
  let brief = build(note)
  while (brief.href.length > MAX_HREF && note.length > 0) {
    note = cleanNote(note, Math.floor(note.length * 0.85))
    brief = build(note)
  }
  return brief
}

/** The first `progress` (0–1) of `text`, for the monitor's typed answer. */
export function typedSlice(text: string, progress: number): string {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return text.slice(0, Math.round(text.length * p))
}

/**
 * The next channel for a key press on the strip list, or `null` for a key that
 * is not navigation. Arrow keys wrap, Home and End jump; both axes work because
 * the strips are a column on desktop and a grid on a phone.
 */
export function nextChannel(
  key: string,
  index: number,
  count: number,
): number | null {
  if (count <= 0) return null
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return (index + 1) % count
    case 'ArrowUp':
    case 'ArrowLeft':
      return (index - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}
