# Contact: the setlist

The 16-pad performance controller is unchanged (its GSAP coupling, its audio
indices and its sweep order), and so is the section heading. Under it sits the
FAQ, set straight onto the section's graph paper as a printed setlist and a
lyric sheet. There is no device around it: no chassis, screen, panel or shadow.
What carries it is type, rules, one stage to read on and a lamp on the paper.

## The idea

The questions are songs, listed in running order in three groups (Side A:
Scope, Side B: Process, Encore: Practical), nine in all.

**A song does not start when you press it. It starts on the next beat** of a
live 120 BPM clock, which is what makes a press feel performed (it blinks while
queued, and waits at most 500ms). Its answer then plays as a **lyric sheet**:
the whole answer is set in large type at once, so nothing reflows, and the
words light up one after another as the playhead passes, with a highlighter
block riding the word being sung.

Around that:

- a hand-drawn scribble draws itself under the playing title;
- a giant outlined numeral behind the stage kicks on the beat;
- a lamp follows the pointer and lights the graph paper under it;
- a nine-tick rail with a cursor shows where you are in the setlist;
- the rows write themselves in as the section arrives, then the first song
  queues itself, unless the visitor has already acted or came in on a `#hash`.

Colours are the section's own ink (which flips with the theme) and the
controller's pad colours as the three side accents.

## How it is built

| File | Role |
| --- | --- |
| `setlist.tsx` | The component: wiring only |
| `setlist.module.css` | The look, and the lyric arithmetic |
| `scene-engine.ts` | The playback machine: one rAF loop, the queue, the playhead. Plain module, tested against a fake clock |
| `scene-logic.ts` | Pure: the beat clock, clip length, progress, words, focus movement |
| `contact-content.ts` | The nine questions and answers, and the side names (edit copy here) |
| `contact-status.tsx` | The status strip under the heading |

The engine writes one number, `--p` (0 to 1), onto the stage and the playing
song. Everything visual is `calc()` on it: a word's brightness is
`clamp(0, p*n - i, 1)` for its index `i` of `n` words; the highlighter is a
parabola in the same distance, so it peaks on the current word and is zero on
either side; the scribble is a dash offset. A playing song is custom-property
writes and no React renders. The loop runs only while the setlist is on screen
or something is playing.

## Accessibility

Real buttons in an ordered list per side, in one roving-tabindex column (up and
down walk it, Home and End jump, Enter or Space plays, Escape stops). The answer
is announced once, whole, in a polite live region; the animated lyric is
`aria-hidden`. A `#hash` deep link per question, and Copy link. Without
JavaScript every question and answer is plain text.

Reduced motion is a complete alternative: no clock, no beat, no sweep; a press
selects a song and its whole lyric is lit at once.

## Removed

The signal-path and brief-builder panels (the `.desk` block), the slit-type
title, the full-bleed FAQ band, and the scene-launcher device.
