// Shape of You (Ed Sheeran) — Melody transcription
// .Note = octave 3 (lower), Note = octave 4, Note-Note = two quick notes
// Each note is mapped to a dummy pad ID for visual feedback on the launchpad grid

const shapeOfYouText = `
.B        E     E-E     E      E         E      E    E    E   E-E
The club isn't the best place to find a lover

E       E     E    E    F#   G# G#
So the bar is where I go

.B      G#  G#    G#    G#   G#  F#-F#  F#-F# F#
Me and my friends at the table doing shots

F#-F#       F#    F#     G#    F#   E    C#
Drinking fast and then we talk slow

C#     C#    C#   F#-G#  G#  G#  G#
And you come over and start up

G#  G#-G#-G#-G#  G#  G#  G#
A conversation with just me

G#        B     G#   G#  F#  F#  E  G#
And trust me I'll give it a chance

F#-E      E     E       E        B
Now take my hand, stop

F#    G#  G#   F#   F#   F#   F#-F#
Put Van the Man on the jukebox

F#      F#    F#     F#    E     C#
And then we start to dance

.G#    .G#  C#  C#-C# C#
And now I'm singing like...

C#     C#     C#   .B   C#    G#    F#
Girl, you know I want your love

F#        F#    G#      F#-E
Your love was handmade

C#    E-G#-F#    F#  C#
For somebody like me

B          F#    G#    G#-F#  E   C#
Come on now, follow my lead

F#  F# G#   F#-E   F#     E    C#
I may be crazy, don't mind me...

C#     C#   C#    .B     C#   G#   F#
Say, boy, let's not talk too much

F#      F#   G#   F#     E     C#    E  G#-F#  F#  C#
Grab on my waist and put that body on me

B           G#   G#   F#-E    E     C#
Come on now, follow my lead

C#             B      G#   G#   F#-E     E    C#
Come, come on now, follow my lead

.G#-.B-C#
Hmmmm ~

E    F#    G#   F#    E       E     F#   F#
I'm in love with the shape of you

E        E       F#   G#    F#  E   E-F#   C#
We push and pull like a magnet do

C# - E      F#     G#    E    E-F#   F#
Although my heart is falling too

E    F#  G#   F#     E      F#-C#
I'm in love with your body

F#       G#     B      G#    F#   E    F#
Last night you were in my room

C#      E     F#     G# - F#      E       F#    C#
And now my bedsheets smell like you

C#-C#  C#   C#-E-F#-G#    C#- E       F#      F#
Every day discovering something brand new

E      F#  G#   F#     E    F#-C#
I'm in love with your body

C#  C#   E   E   F# F#   G# G#
Ooh I,   ooh I,  ooh I,  ooh I

E     F#    G#  F#    E     F#-C#
I'm in love with your body

C#  C#   E   E   F# F#   G# G#
Ooh I,   ooh I,  ooh I,  ooh I

E   F#  G#   F#      E    F#-C#
I'm in love with your body

C#  C#   E   E   F# F#   G# G#
Ooh I,   ooh I,  ooh I,  ooh I

E     F#   G#   F#    E     F#-C#
I'm in love with your body

C#-C#  C#  C#-E-F#-G#    C#-E      F#      F#
Every day discovering something brand new

E     F#   G#   F#     E      E      F#   C#
I'm in love with the shape of you
`

// Map each note to a dummy pad ID on the launchpad grid
// Desktop grid (8×4): row 3 (y=3) is fully free, row 1 (y=1) is fully free
// Lower notes at bottom (row 3), higher notes at top (row 1)
const NOTE_TO_PAD: Record<string, string> = {
  'B3': 'dummy-0-3',
  'C4': 'dummy-1-3',
  'C#4': 'dummy-2-3',
  'D4': 'dummy-3-3',
  'D#4': 'dummy-4-3',
  'E4': 'dummy-5-3',
  'F4': 'dummy-6-3',
  'F#4': 'dummy-7-3',
  'G4': 'dummy-0-1',
  'G#4': 'dummy-1-1',
  'A4': 'dummy-2-1',
  'A#4': 'dummy-3-1',
  'B4': 'dummy-4-1',
  'C5': 'dummy-5-1',
}

const NOTE_TOKEN_REGEX = /^\.?[A-G]#?$/

function isNoteLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return false
  return tokens.every((t) => {
    if (t.includes('-')) {
      return t.split('-').every((n) => NOTE_TOKEN_REGEX.test(n))
    }
    return NOTE_TOKEN_REGEX.test(t)
  })
}

export interface NoteEvent {
  time: number
  note: string
  duration: string
  padId: string | null
}

export function parseShapeOfYou(): NoteEvent[] {
  const events: NoteEvent[] = []
  let beat = 0

  const lines = shapeOfYouText.trim().split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (!isNoteLine(trimmed)) continue // skip lyric lines

    const tokens = trimmed.split(/\s+/).filter(Boolean)
    for (const token of tokens) {
      const notes = token.split('-')
      const timePerNote = 0.5 / notes.length
      const duration = notes.length === 1 ? '8n' : notes.length === 2 ? '16n' : '32n'

      for (let i = 0; i < notes.length; i++) {
        let note = notes[i]
        if (note.startsWith('.')) note = note.slice(1) + '3'
        else note = note + '4'
        events.push({
          time: beat + i * timePerNote,
          note,
          duration,
          padId: NOTE_TO_PAD[note] ?? null,
        })
      }
      beat += 0.5
    }
  }

  return events
}
