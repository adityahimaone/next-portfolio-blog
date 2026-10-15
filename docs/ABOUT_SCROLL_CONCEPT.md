# About, second pass — a scroll concept for the interior

Brainstorm. No code until a direction is approved.

Scope: **the inside of About only.** The hero → About transition is signed off
and is not in question. Read against `design.md` §0.0 and
`docs/FRONT_OF_HOUSE_CONCEPT.md`.

---

## 1. The brief

- The dive is good. Keep it. Nothing about the seam, the camera, the clip
  header or the ruler handoff changes.
- What happens *inside* About should be a different idea from the Patch.
- The named direction is **scroll animation and parallax**.

---

## 2. What is inside About today

The Patch is a hardware synth front panel: a nameplate, three modules whose
column widths are the real channel counts (`6fr 4fr 4fr`), a bank of knobs or
faders per module, an LCD carrying the active take's prose, and a meter bridge.

It satisfies §0.0 — every control is a real level. But it has a real weakness
for a section whose job is *reading*:

**It is a static layout with one moving part.** The cursor walks the modules and
the sweep lights the controls. Everything else is fixed. The scroll drives a
sweep and a selection; it does not compose the section. A reader scrolling
through About sees a panel that is mostly already there.

That is the thing to fix. Not the vocabulary — the **composition**.

---

## 3. The content surface, exactly

Everything About has to say, and the numbers available to say it with:

| Content | Values | Source |
| --- | --- | --- |
| Tracks | 3 — `INTERACTION`, `SYSTEMS`, `PRODUCTION` | `ABOUT_TRACKS` |
| Headings | `Start with the user.` / `Build the system.` / `Stay close to production.` | `ABOUT_TRACKS` |
| Stories | one paragraph each | `ABOUT_TRACKS` |
| Credits | 2 per track, 6 total | `ABOUT_TRACKS` |
| Tech notes | `REACT / NEXT.JS / TYPESCRIPT`, `FEATURES / DATA / DELIVERY`, `BACKEND / AUTOMATION / INFRA` | `ABOUT_TRACKS` |
| Availability | one line, last track only | `ABOUT_TRACKS` |
| Résumé link | one | `ABOUT_TRACKS` |
| Stages | `COMPOSE`, `CONNECT`, `SHIP` | `PATCH_STAGES` |
| Colours | `#c07352`, `#7d97ab`, `#4e91a8` | `GROUP_COLORS` |
| Channels | 6 / 4 / 4, with levels 0–100 | `MIXER_DATA` |
| Proof | `4+ YEARS`, `3 PRODUCT TEAMS`, `15K+ USERS`, each with a `ratio` | `PROOF_READOUTS` |
| Loop brace | PROFILE clip as bars | `PATCH_LOOP` |

**Three is the number.** Three tracks, three stages, three colours, three proof
readouts. The section is a triptych and has never been composed as one.

---

## 4. The one craft rule

> **Parallax the data. Pin the prose.**

Parallax on body text is a readability tax with no upside: the reader is trying
to hold a sentence and the sentence is sliding. So the planes that move are the
ones carrying *data* — the tech note, the channel levels, the credits, the
meters, the colour field. The paragraph stays still at the focal plane and the
world moves around it.

This is also what keeps §0.0 honest. A moving layer has to be earning its
movement, and the layers that can earn it are the ones with numbers in them.

---

## 5. The concept space

### A. The Depth Stack — descend through three planes *(recommended)*

About becomes a **descent**. Each track is a plane, and scrolling moves the
reader through them, front to back.

Each plane is a three-layer stack:

| Layer | Rate | Carries | Real source |
| --- | --- | --- | --- |
| **Back** | 0.40× | the tech note at display scale, low contrast | `take.note` |
| **Focal** | 1.00× | the heading and the story, pinned and still | `ABOUT_TRACKS` |
| **Front** | 1.35× | the credits and the proof meters, exiting fast | `ABOUT_TRACKS`, `PROOF_READOUTS` |

The plane's colour is the track's `GROUP_COLORS` value, so the section changes
colour as you descend — a real signal that you have changed track.

**Scroll is the master fader.** The reader's scroll position maps to a level,
and that level is what drives the crossfade between planes. It is one number,
it is real, and it gives the scroll a job beyond "move things".

### B. The Waveform Mask — reveal the prose through a real waveform

The story is revealed through a scrolling waveform whose bar heights are the
**real channel levels** (`MIXER_DATA[].channels[].level`, 0–100), not a
decoration. Scroll drives the waveform past a mask and the prose appears
through it.

- Strongest single image, and the same trick the blog's tracklist already uses
  (waveform = word count), so the page already has the grammar.
- **Risk:** it puts the movement on the text, which is exactly what §4 warns
  against. Readable only if the mask is wide and the travel slow.

### C. The Rail — three stations on a horizontal scrub

Vertical scroll drives a horizontal rail of the three tracks, Selora's archive
move, with each station's layers parallaxing at different rates.

- Most literally "scroll and parallax", and the three tracks read as a sequence.
- **Risk:** it is a second horizontal scrub on a page that already has one (the
  rack), and a horizontal track inside a section that lives inside a pinned
  stage is a lot of nested scroll behaviour to keep honest.

### D. The Crossfade — scroll as a DJ transition

The three tracks are stacked in one viewport and scroll crossfades between them:
the outgoing plane scales down and recedes, the incoming one advances. The proof
meters ride the fader and settle at each track.

- Cheapest, and the most directly "one scroll, one number".
- **Risk:** it is A without the depth. On its own it is a slideshow with
  transform on it.

---

## 6. Recommendation

**A, The Depth Stack, with D's crossfade as the mechanism *between* planes.**

A and D are not alternatives; D is how A gets from one plane to the next. The
stack gives the section depth and the crossfade gives it a transition. What is
left over is B's waveform — worth keeping as the **back layer of the first
plane only**, where the tech note already is, because that is the one place the
waveform is describing the thing it sits behind.

Reasons:

1. **It fixes the actual weakness.** The Patch is a static panel; this is a
   composition the scroll builds. That is what was asked for.
2. **Three is real and was never used.** Three tracks, three planes, three
   colours, three proof readouts. The structure was always there.
3. **It is readable.** Prose pinned at the focal plane, per §4.
4. **The plumbing survives** (§7). This is a composition change, not a rebuild.

---

## 7. What this reuses, and what it retires

This matters more than usual, because the Patch was just built and verified.

**Kept, unchanged**

| Thing | Why it survives |
| --- | --- |
| The seam, the camera, `splitProgress` | the transition is signed off |
| `patch-timeline.ts` | `patchFrame`, `controlSweep`, `splitProgress` — the math is the transition's, not the panel's |
| `patch-data.ts` | `PATCH_MODULE_LIST` is the derived track data; only the rendering changes |
| `about-copy.ts` | the copy does not move |
| `Led`, `Silk`, `Meter` from `patch-kit` | the shared kit, still the right parts for levels and labels |
| The `--patch-*` custom-property contract | the hook already writes them on change only |

**Retired or replaced**

| Thing | Fate |
| --- | --- |
| `Knob`, `Fader` | retired from About — a fader bank is the static panel's idea |
| `patch.module.css` | rewritten; the module grid and the LCD give way to the plane stack |
| `use-arrangement-hero.ts`'s `renderPatch` | the same writes, a different composition |
| The cursor that walks the modules | replaced by the descent itself |

The honest summary: **the plumbing is reusable and the composition is not.** The
scroll wiring, the two-clock split, the derived data and the reduced-motion
contract all survive. What changes is what they draw.

---

## 8. Motion and performance

The guardrails in `docs/perf-baseline.md` bind, and `design.md` §0.2 caps
blended layers at two:

- **Transform and opacity only** in the scrub. No per-frame `filter`.
- **Three rates, one ScrollTrigger.** The three layers are one scrub, not
  three triggers.
- **At most two blended layers on screen.** If the back layer needs a blend, it
  is the only one; the focal and front layers stay opaque.
- **Reduced motion is the settled frame.** All three planes stacked and open,
  all three tracks readable in sequence, no depth, no crossfade. The Patch
  already set this pattern and it should be copied rather than re-derived.
- **No perpetual animation.** Every move is a scroll position or a state
  change. The `meter-bounce` loop stays retired.

---

## 9. Open questions

1. **Planes stacked or sequential?** Three planes the reader descends through
   one at a time, or all three visible at once with only the depth changing?
   The first is more cinematic; the second lets a reader compare tracks.
2. **What the back layer is.** The tech note as display type, or the waveform
   from B, or both in the first plane only?
3. **Does the proof bridge stay a footer?** It is currently a closing meter
   bridge. In a descent it could be the *floor* — the last thing the front
   layer carries before the section ends.
4. **How loud is the colour.** The three `GROUP_COLORS` are close in value. As
   a full plane wash they may be muddy; as an edge or a rule they are sharp.
5. **The knob and fader banks.** Retiring them drops 14 real levels from the
   section. Are they worth keeping as a small strip inside each plane's front
   layer, or is the level data better spent on the proof meters alone?
