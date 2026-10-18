/**
 * What the Contact section's FAQ says.
 *
 * Nine clips on three tracks, written as answers and not as a pitch: the React
 * Native line is a no, because a page that hedges on what it cannot do wastes
 * the reader's time and the writer's. Nothing here promises a date, a rate or a
 * client. The one promise is the one the page always made: replies usually land
 * within a couple of days.
 *
 * Nine is deliberate. The launcher is a 3 × 3 grid, and a track with a hole in
 * it reads as a missing clip, not as a short track.
 */

export const TRACKS = ['Scope', 'Process', 'Practical'] as const
export type Track = (typeof TRACKS)[number]

export type FaqEntry = {
  /** Stable id, used for the #hash deep link. */
  id: string
  track: Track
  question: string
  answer: string
}

export const FAQ_ITEMS: readonly FaqEntry[] = [
  {
    id: 'what-kind-of-work',
    track: 'Scope',
    question: 'What kind of work do you take on?',
    answer:
      'Frontend work where the hard part is the state or the edge cases rather than the styling: internal tools, content-heavy public sites, and products that have to work on a phone or on a bad connection.',
  },
  {
    id: 'existing-backends',
    track: 'Scope',
    question: 'Do you work with existing backends?',
    answer:
      'Mostly. Most of the shipped work is a frontend over a service that already exists. Running the infrastructure too is something I do when the product genuinely needs it.',
  },
  {
    id: 'native-mobile',
    track: 'Scope',
    question: 'Do you do React Native or native mobile?',
    answer:
      'No. The mobile work here is responsive web. The habits transfer, the stack does not, and I would rather say so now than take it and hand it back.',
  },
  {
    id: 'how-we-start',
    track: 'Process',
    question: 'How do we start?',
    answer:
      'Send a short brief. I reply with the questions that change the plan, then a plan small enough to disagree with.',
  },
  {
    id: 'first-message',
    track: 'Process',
    question: 'What should the first message say?',
    answer:
      'The problem, who it is for, and the constraint that hurts: a date, a budget, a stack you cannot change. A link helps if there is one. Two paragraphs beat a deck.',
  },
  {
    id: 'how-it-runs',
    track: 'Process',
    question: 'How do you work once it starts?',
    answer:
      'In small increments, with a working build you can click at every step instead of a deck about one. It ends with code someone else can run and notes that outlive the project.',
  },
  {
    id: 'reply-time',
    track: 'Practical',
    question: 'How fast do you reply?',
    answer:
      'Usually within a couple of days. If there is a date that matters, put it in the first line so it is the first thing I read.',
  },
  {
    id: 'time-zone',
    track: 'Practical',
    question: 'Which time zone do you work in?',
    answer:
      'Jakarta, UTC+7. The European morning and the whole Asia-Pacific day fall inside ordinary hours; the Americas mean an early or a late call.',
  },
  {
    id: 'see-the-work',
    track: 'Practical',
    question: 'Where can I see the work?',
    answer:
      'On this page, and in the repositories behind the GitHub pad on the deck above. Anything under NDA I describe rather than show.',
  },
]
