# About Redesign: Concept

Brainstorm and recommendation for the About section. No code until a direction is approved.

Companion to `docs/AUDIT_HERO_ABOUT_IMMERSIVE_SCROLL.md`, which found two problems this concept is designed to solve at the same time: the read has nothing to do, and About is a text rail rather than a device.

---

## The brief, restated

- About must stop being simple.
- It must use the music and device language the rest of the page already speaks.
- It must connect to the Hero transition, not sit after it.

---

## What the page already owns

Before inventing anything, the real data spine. From `docs/arrangement-descent.md` §0.1, these already exist and already thread the page:

| Source | Values | Already drives |
| --- | --- | --- |
| `MIXER_DATA` groups | `frontend`, `app-data`, `delivery-infra` | the mixer's 85 strips |
| Group labels | `FRONTEND`, `APP + DATA`, `DELIVERY + INFRA` | mixer strip heads |
| `GROUP_COLORS` | `#c07352`, `#7d97ab`, `#4e91a8` | strip and clip colour |
| `RULER_LABELS` | `DISCOVER → DEFINE → COMPOSE → CONNECT → SHIP` | the Hero's ruler |
| `ARRANGEMENT_BARS` | `32` | bar grid and ruler ticks |
| PROFILE clip | `start 0.42`, `end 0.92`, colour `#d7b36f` | the dive target |
| `PROOF_READOUTS` | `4+ YEARS`, `3 PRODUCT TEAMS`, `15K+ USERS`, each with a `ratio` | the Hero's proof meters |

**The rule from `design.md` §0.0 is not negotiable: every music motif encodes something real.** Everything below is built from the table above. Nothing new is invented.

---

## The problem with the current build

The rail that shipped is the right instinct executed as a list. Three headers, one open body. It reads as an accordion wearing monospace.

Two consequences:

1. **It is not a device.** The Hero is a console: lanes, clips, bars, a ruler, a playhead, a mixer, faders, meters, LEDs. About is text on a cream panel with one orange hairline. The two do not look like the same machine.
2. **It gave the read nothing to do.** One open body fits the window, so the measured overflow is zero and the last 18% of the scroll window is dead (audit HIGH-2).

There is also a third, older problem that `arrangement-descent.md` names: **the seam is optical, not structural.** The camera dives into the PROFILE clip, and what it reveals shares no object with what revealed it. About brings its own playhead and its own hairlines.

---

## The concept: "Inside the clip"

In a DAW, a clip is not a container you look at. It is a container you **open**. Open it and you get the take lanes: each recorded pass at the same part, stacked, one per pass.

The PROFILE clip has three takes, because the practice was recorded in three passes. They are the three `MIXER_DATA` groups.

So the dive is not a page transition. It is the reader opening a clip. What they find inside is the record.

### Why this is the right metaphor

- It explains why the dive targets a clip specifically. Any other target would be arbitrary.
- It makes the three channels structural rather than editorial: they are the same three groups that colour the mixer strips below the Hero.
- It gives the read three takes to walk, so the second half of the window does real work again.
- It is a device. Take lanes, lane headers, clips, bars, LEDs, a meter bridge, an inspector. The same vocabulary as the Hero at one magnification down.

---

## The composition

Four zones inside the clip, top to bottom.

```
┌───────────────────────────────────────────────────────────────────────┐
│ PROFILE  ▌0.42 ───────────── cycle region ───────────── 0.92 ▌        │  A
├───────────────────────────────────────────────────────────────────────┤
│ ▎01  FRONTEND           ●  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  B
│ ▎02  APP + DATA         ○  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓             │
│ ▎03  DELIVERY + INFRA   ○  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                  │
├───────────────────────────────────────────────────────────────────────┤
│  TAKE 01 / FRONTEND                              [ inspector readout ]│  C
│  Start with the user.                                                 │
│  <story>                                                              │
│  Bisadaya  Job platform · 15K users                                   │
│  80&Company  HR management · Kyoto                                    │
├───────────────────────────────────────────────────────────────────────┤
│  4+ YEARS ▮▮▮▮▯▯   3 PRODUCT TEAMS ▮▮▮▯▯   15K+ USERS ▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯ │  D
└───────────────────────────────────────────────────────────────────────┘
```

### A. The clip header strip (continuity object)

The one element that crosses the seam unchanged.

In the Hero it is the PROFILE clip's own header: the same `#d7b36f` strip, the same label, the same height and type. During the dive it is the thing that grows. Inside About it is the top strip.

It carries the cycle region, drawn as the `0.42` to `0.92` span. That is the clip's own `start` and `end`, printed. Real data, no invention.

**This is the fix for "optical, not structural".** The reader watched this strip grow. It is still there, at the top, when the growth stops.

### B. The take lanes

Three lanes, one per `MIXER_DATA` group. Each lane:

| Element | Value | Source |
| --- | --- | --- |
| Lane header colour | `#c07352` / `#7d97ab` / `#4e91a8` | `GROUP_COLORS` |
| Lane label | `FRONTEND` / `APP + DATA` / `DELIVERY + INFRA` | `MIXER_DATA[].label` |
| Take number | `01` / `02` / `03` | group index |
| Clip width | share of the stack, from `channels.length` | `MIXER_DATA` |
| Bars in the clip | one per technology | `MIXER_DATA[].channels` |
| LED | lit on the active take, standby otherwise | selection state |
| Channel count | `6` / `4` / `4` | `channels.length` |

Same rules as the Hero's clips: **width means quantity, bar count means the data.** The clip is not a picture of a waveform. It is six bars because React, Next.js, TypeScript, Tailwind, TanStack Query and jQuery are six things.

This is what makes it a device instead of a list. The rail had a title and a note; the lane has a title, a count, a proportional clip and a meter.

### C. The inspector

The selected take's readout, in the panel the Hero's mixer already uses for its proof numbers. It carries exactly the content the About has today:

- `TAKE 0n / <GROUP>` silkscreen header
- the heading (`Start with the user.`)
- the story paragraph
- the credits list
- the availability line on the last take only
- the résumé link, as a sibling of the take button, never inside it

No copy changes. No new claims. This is the record, rehoused.

### D. The meter bridge

The three `PROOF_READOUTS`, as three meters. The `ratio` field already exists and is already used by the Hero's proof strip:

| Readout | Meter |
| --- | --- |
| `4+` `YEARS` | `ratio: 4/6` |
| `3` `PRODUCT TEAMS` | `ratio: 3/5` |
| `15K+` `USERS` | `ratio: 15/20` |

It closes the section with a real measurement instead of a decorative rule, and it gives the dive's overshoot somewhere to land.

---

## The transition

Four continuity objects. Each exists once and is reused. This is what turns the seam structural.

| Object | Today | After |
| --- | --- | --- |
| **Clip header strip** | Hero only | Hero and About, same element, same colour, same label |
| **Ruler** | Hero only, painted over by the seam | stays visible through the dive and becomes About's ruler |
| **Playhead** | Hero only, plus a second hairline in About | one, driven by `--arr-playhead`, walking the three takes |
| **Lane headers** | Hero says `COMPOSE / CONNECT / SHIP` | same labels as the takes, so nothing renames itself mid-dive |

### The ruler handoff

The ruler is already outside `.camera`, so it does not scale with the dive. The seam paints over it because the seam is a sibling of `.trackArea` at a higher z-index.

Two ways to keep it:

- **Cheap:** give the seam a top inset equal to `--arr-ruler-h`, so the ruler sits above the opening window and stays legible throughout.
- **Honest:** move the ruler out of `.trackArea` and into `.stage`, above the seam, so it is structurally outside the thing being covered.

The second is the descent doc's "one ruler" rule and is the correct fix.

### The playhead handoff

The Hero's playhead parks on the profile centre at `rail`. Through the read it should walk the three takes, which is what `--arr-read-travel` was supposed to drive before it collapsed to zero.

Concretely: the playhead's fraction becomes `readT` across the take lanes, and About's own `.aboutSignal` column is **deleted**. That removes the duplicate and gives the read a visible job in the same move.

### The lane label decision

This is the one open question with real scope.

The Hero's lanes are `name`, `profile`, `compose`, `connect`, `ship`, `practice`. The takes are `FRONTEND`, `APP + DATA`, `DELIVERY + INFRA`. They do not match, so the dive lands somewhere that does not look like where it came from.

- **Option 1, accept it.** Keep the Hero as it is. The dive crosses from process lanes to practice takes. Cheapest, and the mismatch is survivable because the clip header carries the continuity.
- **Option 2, align it.** Make the Hero's practice lanes the three `MIXER_DATA` groups, so the lanes the reader saw are the takes they land in. This is step 1 of `arrangement-descent.md`'s build order. Larger change, and it makes the whole descent honest.

**Recommendation: Option 2, later.** Ship the About first with the clip header carrying continuity, then align the Hero's lanes as a separate change with its own verification. Doing both at once makes a bad bisect.

---

## Motion

| Moment | Motion | Purpose |
| --- | --- | --- |
| Seam opens | clip header strip holds, lanes rise 12px with a 40ms stagger | the clip's contents settling into place |
| Take selected | inspector crossfades, 180ms | state change |
| Take selected | active lane's LED lights, clip brightens | which take is live |
| Read walks takes | playhead travels the lane stack | reading position |
| Read walks takes | inspector follows | the read drives the selection |
| Section exits | meter bridge needles settle | the overshoot lands |

Rules held:

- Transform, opacity and filter only. No layout animation.
- No perpetual loops. Every animation is a state change or a scroll position.
- The lane stagger is the only entrance animation, and it is 12px over 40ms.
- Reduced motion, phones and no-JS get all three takes open, stacked, with the inspector inline under each. Nothing hidden, nothing behind a script.

---

## What this fixes

| Audit finding | Fixed by |
| --- | --- |
| HIGH-1, the chapter retime is dead code | not fixed here; still needs the chapter tree deleted or wired |
| HIGH-2, the read has nothing to do | the read walks three takes and drives the playhead |
| MEDIUM-2, selection fights the reader | the read drives the playhead and the inspector, and a click still wins |
| MEDIUM-3, two thirds of the record is hidden | the lanes are visible as lanes, with counts and clips, so the reader can see there are three |
| LOW-1, dead card CSS | the rail's CSS is replaced wholesale; the card CSS is deleted in the same pass |
| LOW-2, `will-change` on a zero travel | the travel is no longer zero |
| descent doc §0.2 problem 2, optical seam | clip header, ruler and playhead cross the seam |

---

## What is deliberately not included

- No new dependency.
- No new asset, image or icon.
- No fabricated number, employer, testimonial or claim.
- No horizontal scroll hijack.
- No second device metaphor. It is a DAW clip, opened, and nothing else.
- No decorative waveform. Every bar is a technology that exists in `MIXER_DATA`.

---

## Open questions for you

1. **Hero lanes.** Option 1 or Option 2 above. Recommended: Option 2 as a follow-up change.
2. **Ruler handoff.** Cheap top inset, or the structural move of the ruler out of `.trackArea`. Recommended: the structural move, since the descent doc already commits to one ruler.
3. **Take lanes vs a different device.** If the take lanes still read as "three rows", the alternative is the **analyzer**: three traces with the proof readouts as the measurement grid, and the prose in a readout block. It is more device and less readable, and I would not choose it for an About.
4. **The inspector's position.** Right column on desktop, or a full-width band under the lanes. The right column keeps the Hero's mixer layout; the band gives the prose more room.
