# Contact: the scene launcher

The 16-pad performance controller is unchanged (its GSAP coupling, its audio
indices and its sweep order are untouched), and so is the section heading.
Under it sits one new unit, the FAQ, built as a second piece of the same
hardware.

## Why it looks like this

The FAQ used to be a full-bleed dark band with its own language. The section is
a cream sheet carrying a graphite deck with orange and multicolour pads, so the
FAQ is now a unit **on that deck's own materials**: the graphite chassis and its
inset highlights, the green-phosphor LCD with scanlines, the pad colours
(`CONTACT_PAD_COLORS`), the same mono silkscreen, and the same 780px width so the
eye finds one column and not two.

## What it does

Each question is a **clip** on one of three tracks (Scope, Process, Practical),
with its own waveform. **A clip does not start when you press it; it starts on
the next beat** of a live 120 BPM clock, which is what makes a press feel
performed.

- Press a clip: it blinks (queued), the next beat launches it, and its answer
  *plays*: a playhead crosses the clip, the answer types out on the LCD in step
  with it, the waveform lights as the playhead passes, and the whole unit
  pulses on the beat while it plays. Four LEDs count the beat.
- Press the playing clip again, or Stop: it ends and shows the whole answer.
- Auto: the next clip queues itself when one finishes.
- The unit powers on as it arrives (the LCD flickers up, clips drop in along a
  diagonal), and shortly after, the first clip queues itself, unless the visitor
  has already acted or came in on a `#hash`.
- A light on the chassis follows the pointer.

## Structure

| File | Role |
| --- | --- |
| `scene-logic.ts` | Pure: the beat clock, clip length, progress, waveforms, transport readout, 2-D focus movement |
| `scene-engine.ts` | The playback machine: one rAF loop, the queue, the playhead. Plain module, tested against a fake clock |
| `scene-launch.tsx` | The unit: wiring only |
| `scene-launch.module.css` | The look |
| `contact-content.ts` | The nine questions and answers (edit copy here) |
| `contact-status.tsx` | The status strip under the heading |

React is told only what happened (a press, a stop, the unit arriving) and
commits only transitions (queued, playing, finished). A playing clip is a few
custom-property and text writes per frame and no renders. The loop runs only
while the unit is on screen or something is playing, so an idle page costs
nothing.

## Accessibility

Real buttons in a labelled group per track, in a roving-tabindex grid: arrows
move between tracks and clips, Enter or Space launches, Escape stops. The answer
is announced once, whole, in a polite live region; the typed copy is
`aria-hidden`. A `#hash` deep link per question (and Copy link on the LCD).
Without JavaScript every question and answer is plain text.

Reduced motion is a complete alternative: no loop, no beat, no sweep; a press
selects a clip and its whole answer appears.

## Removed

The signal-path and brief-builder panels (the `.desk` block), the slit-type
title, and the first FAQ band. The section heading is back to
"Bring me the difficult part."
