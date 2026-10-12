# Arrangement hero — the session is the career

The landing hero is a full-bleed DAW arrangement window. The name is a clip in  
that arrangement, at display scale. The scroll is a camera move: settle on the  
session, travel the timeline, zoom into one clip, and the clip's own rail  
reveals — which is the About section.

This document is the source of truth for the build. Implementation follows §7.

---

## 0. Premise

The reference is an FL Studio playlist: a dark ground, a hairline grid,  
horizontal clips whose **length means something**, a bar ruler, a playhead, a  
transport strip, and mixer channel strips. Five of those six elements carry data  
natively — which is why this works where a decorative "music theme" would not.

The rule from `design.md` §0.0 applies unchanged:

> **Every music motif encodes something real. No data, no motif.**

So the arrangement is not a picture of music software. It is the career,  
rendered as a session. Every clip is a role or a project; every lane is a  
discipline; the ruler is years; the playhead is today.

### Relationship to prior work

Two hero attempts already exist on branches and both are superseded by this one:

- `hero-section-riddim` / `riddim-zoom-story-2` — a flat-vector clone of a  
  hardware DAP with a zoom-out → press → zoom-in camera. Superseded because its  
  continuity is optical (a screen becomes a screen) rather than structural.
- The `main` pad-sea hero — a WebGL field with a neon name plate over it.  
  Superseded because the name is a label on a scene rather than part of it.

What this design keeps from them: `riddim-hero.md`'s *"two surfaces, one  
picture"* contract (here: one timeline, two zoom levels), its pure-function  
choreography (`riddimFrame`), and its "layout by media query alone" fallback  
strategy.

---

## 1. The story

Five phases as fractions of one scroll window, `ARRANGEMENT_SCROLL_SVH`.

| Progress    | Phase      | Camera                                         | Playhead                          | Name clip                        | Lane rail |
| ----------- | ---------- | ---------------------------------------------- | --------------------------------- | -------------------------------- | --------- |
| 0.00 – 0.12 | **Open**   | scale 1.28, focused on the NAME lane             | parked at 2022.4                  | full saturation, display type    | hidden    |
| 0.12 – 0.35 | **Settle** | scale → 1.00, focus → arrangement centre         | begins travelling                 | holds                            | hidden    |
| 0.35 – 0.62 | **Travel** | holds 1.00, 3% drift                             | 2022.4 → 2024.6                   | holds                            | hidden    |
| 0.62 – 0.85 | **Zoom**   | scale 1.00 → `zoomScale`, focus → PROFILE centre | decelerates onto the PROFILE clip | falls to 0.16 opacity            | hidden    |
| 0.85 – 1.00 | **Rail**   | holds `zoomScale`                                | parks at the PROFILE clip centre  | persists as the silkscreen label | slides in |

**An open question the table exposes.** The playhead's two endpoints are both
forced, and together they are much shorter than the axis. It opens at
`PLAYHEAD_START_YEAR` — the axis midpoint, `2022.4` — because the camera opens
centred on the NAME clip, which spans the whole axis, so the midpoint is the one
year that sits on the centre line at the open. And it must *arrive* at
`PROFILE_YEAR`, `2024.6`, because that is where the camera lands (§3.3). So it
travels 2.2 years, not 8.75 — it reads as a playhead walking a section of the
record rather than the whole career, which is weaker than §1.1's "each clip
lights as it passes" describes.

The fix is a real decision, not a tweak: either the playhead opens at `YEAR_MIN`
and accepts sitting at the frame's left edge during the open, or the walk is
extended by giving the camera a longer travel before the dive. The first is
honest and cheap; the second is better and needs a retime. **Left open
deliberately** — the numbers in the table are what the first build produced, not
a recommendation.

Three beats read through those five phases:

1. **NAME** — you arrive inside the session with the name clip dominant.
2. **CAREER** — the camera settles and the playhead walks the timeline.
3. **PROFILE** — the camera dives into one clip, whose rail opens onto About.

### Why the ruler and the playhead never leave

In a real DAW zoom, the ruler and the playhead are the two things that do not  
move. They are the anchors. Keeping both on screen for the entire window is what  
makes the viewer read *we zoomed* instead of *we cut* — it is the single most  
load-bearing detail in the seam. Both are pinned through every phase.

### 1.1 Component storyline

The story told component by component. Rows are the ten components; columns are  
the five phases. A cell is what that component does during that phase — `—`  
means it is unchanged and simply holds.

| Component         | Open                                               | Settle                   | Travel                             | Zoom                        | Rail                             |
| ----------------- | -------------------------------------------------- | ------------------------ | ---------------------------------- | --------------------------- | -------------------------------- |
| **Stage**         | pinned; holds every layer                          | —                        | —                                  | —                           | —                                |
| **TitleBar**      | visible — project name, BPM, clock                 | —                        | —                                  | —                           | fades to 0.4                     |
| **Transport**     | visible — tempo, pattern, play/stop                | —                        | position counter runs              | —                           | —                                |
| **NameLane**      | camera focused here; full saturation, display type | camera releases          | —                                  | falls to 0.16 opacity       | persists as the silkscreen label |
| **CareerLanes**   | visible below, held back to 62%                    | camera settles on centre | clips light as the playhead passes | non-target lanes → 0.12     | hidden                           |
| **Ruler**         | pinned to the top edge                             | —                        | years advance                      | scales with the camera; quarter ticks reveal past 1.4 | becomes About's ruler            |
| **Playhead**      | parked at 2022.4                                   | begins travelling        | 2022.4 → 2024.6                    | decelerates onto PROFILE    | parks on the PROFILE clip centre |
| **ProofStrips**   | visible, meters idle                               | meters begin             | meters peak as the playhead passes | hidden                      | hidden                           |
| **LaneRail**      | hidden                                             | hidden                   | hidden                             | hidden                      | **slides in from the left**      |
| **ClipInspector** | hidden                                             | hidden                   | hidden                             | hidden                      | fades in, reads clip `01`        |

Read as a sequence of events rather than a grid:

1. **Open.** Stage pins. TitleBar and Transport are already there — the session  
   is simply *open*. The camera is close on the NameLane, so the title is the  
   largest thing on screen. CareerLanes sit below, held back. Ruler pinned.  
   Playhead parked at 2022.4. ProofStrips idle. Rail and Inspector absent.
2. **Settle.** The camera releases and pulls to the arrangement centre. The  
   playhead starts moving. ProofStrips' meters come alive.
3. **Travel.** The playhead walks the record and each clip lights as it passes.  
   The ruler advances. The reader is being walked through the career.
4. **Zoom.** Non-target lanes fall away, the NameLane drops back, and the ruler's  
   ticks spread with the clips as the camera dives onto the PROFILE clip  
   (quarter ticks appear past scale 1.4). ProofStrips go. The clip's border  
   becomes the frame.
5. **Rail.** The LaneRail slides in — the moment the rectangle becomes a track.  
   The clip's interior resolves into About's content and its fill crossfades to  
   `--chassis-hi`. ClipInspector fades in reading clip `01`. The playhead parks  
   on the PROFILE clip centre. The NameLane survives as the silkscreen label.

Note what never leaves: **Ruler** and **Playhead** are present in all five  
columns. That is the seam's contract expressed as a row in a table, which is  
also how it should be tested.

---

### 1.2 Component skeleton

The tree, with the four shared components marked `◆`. Those four must exist once
and be used twice — if any of them is duplicated between the hero and About, the
seam's continuity breaks.

```
<main class="root">                       existing — unchanged
  <section id="home">                     ArrangementHero
    <div class="stage">                   sticky · 100svh · overflow hidden
      <div class="chrome">
        <TitleBar />                      project name · BPM · clock
        <Transport />                     tempo · pattern · play / stop · position
        <BrowserRail />                   site nav — Projects, Blog, Bookmarks, About
      </div>

      <div class="trackArea">             ← the property host (§1.3)
        ◆ <Ruler />                       OUTSIDE the camera: it must not scale
        <div class="camera">              the only scaled node
          <div class="lanes">
            <Lane id="name">              tall lane · 2.6x
              <Clip kind="name" />        ADITYA HIMAWAN @ display scale
            </Lane>
            <Lane id="profile">   <Clip kind="profile" /> </Lane>
            <Lane id="frontend">  <Clip /> <Clip /> </Lane>
            <Lane id="appdata">   <Clip /> </Lane>
            <Lane id="infra">     <Clip /> </Lane>
            <Lane id="education"> <Clip /> <Clip /> <Clip /> <Clip /> </Lane>
          </div>
        </div>
        <div class="pinned">              outside the camera, inside the host
          ◆ <Playhead />                  one instance; survives the seam
          ◆ <LaneRail />                  hidden until railReveal > 0
        </div>
      </div>

      <div class="proof">
        <ProofStrips />                   channel strips = the three proof numbers
      </div>
    </div>
  </section>

  <section id="about">                    About — re-cut (§4)
    <div class="aboutStage">
      <SectionHeading index="02" />
      <div class="panel">                 the SAME four shared components
        ◆ <Ruler />                       above BOTH columns, not inside one
        <div class="panelBody">           grid: --arr-rail-w | 1fr
          ◆ <LaneRail />                  first row level with the first lane
          <div class="arrangement">       relative — the playhead's containing block
            ◆ <Playhead />                same element, continued in time
            <Lane id="focus">   <Clip /> </Lane>
            <Lane id="systems"> <Clip /> </Lane>
            <Lane id="range">   <Clip /> </Lane>
          </div>
        </div>
        <ClipInspector />                 replaces .clipDetail + the card prose
      </div>
    </div>
  </section>
</main>
```

### 1.3 Data flow

Strictly one-way, and nothing on the scroll path touches React state — the same
rule `use-hero-motion.ts` already follows.

```
scrollY
  |
  v
ScrollTrigger  (use-arrangement-hero.ts)
  |  per frame — writes to the TRACK AREA, and never to the camera.
  |  The track area is the smallest node that reads them, which is NOT
  |  the camera: the ruler is the camera's sibling and reads the same
  |  three numbers to place its ticks.
  |    --arr-zoom          --arr-camera-x   --arr-camera-y
  |    --arr-world-w       --arr-playhead   --arr-rail
  |    --arr-clip-interior --arr-seam-shift
  |
  |  on change only — writes datasets, never per frame:
  |    data-phase="open|settle|travel|zoom|rail"      (on <section id="home">)
  |    data-live="true", data-detail="true|false"     (on .trackArea)
  v
<div class="trackArea">                  the property host
  |- * Ruler              left: calc(--year-frac * --arr-world-w * --arr-zoom + --arr-camera-x)
  |- .camera              the single scaled node
  |    |- transform: translate3d(--arr-camera-x, --arr-camera-y, 0) scale(--arr-zoom)
  |    |- lanes           per-lane opacity, from data-phase
  |    \- clips           fill crossfade at --arr-clip-interior
  \- .pinned              unscaled, sibling of .camera
       |- * Playhead      translate3d(--arr-playhead, 0, 0)
       |- * LaneRail      translate3d(calc((1 - var(--arr-rail)) * -100%), 0, 0)
       \- .seam           clip-path: inset(...), from the frame's seamInset
```

Two rules this encodes, both measured in the RIDDIM hero:

- **Write to the smallest node that reads the value.** Writing a custom property
  on the hero root invalidates the whole subtree, and the cost scales with
  subtree size — 1613 ms against 166 ms on a smaller node, and an *unused*
  property still cost 1588 ms. So the properties go on `.trackArea` — which
  holds the camera and the ruler and nothing else — and not on `<section>`,
  which also holds the chrome, the proof strips and the transport.

  The distinction between `.trackArea` and `.camera` is not cosmetic and was
  got wrong on the first build. The ruler is **outside** the camera (it must not
  scale, §3), so it is the camera's *sibling* — which means a property written
  on `.camera` is invisible to it. Both the ruler's live tick rule and its
  quarter-tick reveal then resolve to nothing, and the ruler silently prints an
  unzoomed 2018–2026 across the full width while the clips beneath it are at
  scale 2. Measured, not theorised: the ruler contradicted the clips for the
  entire dive.
- **Datasets are written on change, never per frame.** `radio-flip.ts` already
  does this with its `setLayers` / `lastLayer` pair; this design reuses the
  shape for `data-phase`.

### 1.4 Ownership

| Value | Written by | Node | Read by |
| --- | --- | --- | --- |
| `--arr-zoom` | ScrollTrigger `onUpdate` | `.trackArea` | `.camera` scale, ruler tick x |
| `--arr-camera-x` / `-y` | ScrollTrigger `onUpdate` | `.trackArea` | `.camera` translate, ruler tick x |
| `--arr-world-w` | ScrollTrigger, on measure only | `.trackArea` | ruler tick x |
| `--arr-playhead` | ScrollTrigger `onUpdate` | `.trackArea` | `Playhead` translate |
| `--arr-rail` | ScrollTrigger `onUpdate` | `.trackArea` | `LaneRail` translate |
| `--arr-clip-interior` | ScrollTrigger `onUpdate` | `.trackArea` | clip fill crossfade, seam fill |
| `--arr-seam-shift` | ScrollTrigger `onUpdate` | `.trackArea` | `.seam` interior offset |
| `data-live`, `data-detail` | ScrollTrigger, on change only | `.trackArea` | switches the static fallbacks to the live rules |
| `data-phase` | ScrollTrigger, on change only | `<section id="home">` | chrome fade, `ProofStrips`, lane dimming |
| selected clip | React state, on click | `About` | `ClipInspector` |

**`--arr-camera-x` / `-y`, not `--arr-focus-x` / `-y`.** An earlier draft had the
frame return the focus point and let CSS subtract it from `50%` / `50svh` via
`transform-origin`. That cannot have meaningful fallbacks: an unset
`transform-origin` is `50% 50%`, which is not the overview, so the
no-JavaScript and reduced-motion frames would need a second set of rules.
Returning the camera translate **in world coordinates** instead —
`cameraX = worldWidth / 2 - focusX * scale` — makes the overview exactly
`(0, 0)`, so the property fallbacks *are* the settled frame. See §9.

Lane opacity is deliberately **not** recomputed per frame. The non-target lanes
dim once, during the zoom, so a CSS transition keyed off `data-phase` is both
cheaper and smoother than driving it from the frame function. The only React
state is the selected clip, which changes on click and never on scroll.

---

## 2. The name

The name lives **inside the timeline**, in its own lane, at display scale.

- **Lane 0** is the `NAME` lane and is `2.6×` the height of a normal lane. The  
  tall lane is what lets the name be both *in* the arrangement and *legible*.
- One clip spans the whole timeline (`YEAR_MIN` → `YEAR_MAX`), labelled
  `ADITYA HIMAWAN`. This is the **one documented exception** to "a clip's width
  is a duration" — the name is not a role, so it spans the record. Saying so out
  loud is what keeps the exception from reading as a bug.
- The label is set at display scale, not at clip-label size — it is a clip whose
  label happens to be the title. Syne 800, tracking `-0.035em`, uppercase.
- **The size is derived from the widest word, not chosen.** Syne 800 runs about
  1.18em per cap, so `HIMAWAN` — seven caps — measures roughly 8.27em, and that
  is the constraint the ceiling has to satisfy. Seven caps at 190px come to
  about 1571px, which is wider than a 1440px viewport, so a ceiling of 190px is
  unreachable at any size that still fits; it was an illustration that survived
  into the spec as if it were a measurement. The working values are
  `clamp(52px, 8.2vw, 124px)` for the hero and `clamp(28px, 9vw, 64px)` for the
  phone session view, where the label wraps to two lines and the room available
  is the viewport less 60px — 14px of lane padding and 16px of clip padding a
  side.
- The clip's note data is a bar row that doubles as the arrangement's intro.

**Focus rule — the name clip is the only full-saturation element in the hero.**  
It carries `--signal-orange` (`#ff5a1f`) at full strength. Every career clip is  
held back to `color-mix(in srgb, {projectColor} 62%, var(--chassis))`. This is  
how the name stays the subject while sharing a frame with fourteen other clips:  
everything else is desaturated toward the ground, so the eye has exactly one  
saturated thing to land on.

Two details that draft got wrong. The mix target is the **hero's own ground**
(`--arr-ground`, `#14171a`), not `--chassis`: the hero is the session at night in
both themes, so mixing toward the chassis would lift the career clips instead of
holding them back. And the hold is scoped to the hero — About sets it to `100%`,
because by then the name clip is no longer in the frame competing with them, so
there is nothing to hold them back *from*. That scoping has a consequence worth
knowing: the seam's interior (§3.2) must adopt About's palette, not the hero's,
or its clips arrive mixed toward near-black while sitting on `--chassis-hi`.

The name is also what `design.md` calls the one accent per view. There is no  
second accent in this hero.

---

## 3. The seam

The seam has two halves, and the second half is the payoff.

### 3.1 Zoom (0.62 → 0.85)

- Camera scale rises `1.00 → zoomScale`, where **`zoomScale` is derived, never
  tuned**: `worldWidth / profileClipWidth`. That is exactly the scale at which
  the clip's two vertical edges land on the frame's two vertical edges, which is
  the seam's whole premise — and it is what makes the rail reveal's horizontal
  insets already zero when it opens, so only the verticals have to move.
  At 1440×900 against the real axis it comes to about **2.02**. The `6.50`
  quoted in earlier drafts was an illustration; treating it as the number
  overshoots the frame and takes the ruler out of alignment with the clips.
- The camera is expressed as a **translate in world coordinates**, not as a
  `transform-origin` on the focus point — §1.4 and §9 say why that difference is
  load-bearing for the fallbacks.
- Grid pitch spreads. The ruler's ticks ride the same transform as the clips, so  
  they spread with them; what changes is only which ticks exist (quarter ticks  
  reveal past scale 1.4) — see §6.2.
- Non-target lanes fall to `0.12` opacity; the name clip to `0.16`.
- The PROFILE clip's border becomes the viewport frame.

### 3.2 Rail reveal (0.85 → 1.00)

This is the moment the transition pays off, and the part that makes About feel  
like the *interior* of the clip rather than the next section:

- The **lane rail** — the track-header column — slides in from the left edge  
  (`x: -100% → 0`). This is the DAW's own idiom: you always zoom with the rail  
  present, and revealing it is what turns a rectangle into a track.
- The PROFILE clip's interior resolves: heading, then the three `ABOUT_TRACKS`  
  as three clips on three lanes.
- The clip's fill crossfades to `--chassis-hi` — the clip becomes the page.
- The playhead parks on the PROFILE clip centre — the year §3.3 fixes.

### 3.3 The contract that binds it

> **The playhead's year is continuous across the seam.**

The year both sides agree on is the **PROFILE clip's centre**, and that is
geometry rather than taste. At `zoomScale` the clip's two edges land exactly on
the frame's two edges, so a playhead parked on either edge would be parked
off-screen — the earlier draft's "sits at the PROFILE clip's start year" is
unimplementable for that reason. The centre is the only year on that clip
guaranteed to be in frame at both zoom levels, and it is where the camera's
focus already is, so the playhead arrives on the centre line exactly as the
camera does.

In About, the same playhead element sits at the same year, now on About's ruler.
There is no second playhead and no second time axis — there is one timeline,
seen at two zoom levels.

This is the strongest continuity device available on this page, and it is  
strictly stronger than what the radio flip offers, because the radio flip has no  
shared axis. It is also the thing most likely to be broken accidentally: any  
code that resets or re-mounts the playhead destroys the whole illusion.

---

## 4. About, re-cut to match

About is **not** rewritten. Its `.timelinePanel` already renders a ruler, lanes,  
clips, and a playhead. This is an alignment, plus one genuine simplification.

### 4.1 Shared components

| Component       | Shared with the hero                              | Why                                   |
| --------------- | ------------------------------------------------- | ------------------------------------- |
| `Ruler`         | yes — same tick pitch, same type, same year scale | the anchor element                    |
| `Clip`          | yes — same radius, label placement, colour source | the continuity thread                 |
| `Playhead`      | yes — **one instance**, continuing in time        | the seam contract (§3.3)              |
| `LaneRail`      | yes                                               | revealed at the seam, stays for About |
| `ClipInspector` | About only                                        | replaces the duplicated prose         |

### 4.2 The merge, and what it fixes

Today About renders the same content twice: a card stack (`.aboutCardStack`,  
`.aboutCardRail`, three `.aboutCard`s) *and* a timeline panel with three tracks  
and a `.clipDetail` readout. The comments in `section-about.tsx` already record  
this as a known problem — a `body` sentence and a `story` paragraph that restate  
each other, and prose that appears in both the card and the panel.

Merging them into the arrangement removes the duplication at the root:

- **A clip is the summary.** Label, metric, note data. Nothing else.
- **The inspector is the story.** Selecting a clip fills `ClipInspector` with  
  the full prose, credits, aside and résumé link — the content currently split  
  across `.aboutCardStory`, `.aboutCardFoot` and `.clipDetail`.


One place for each thing. The clip keeps its own row geometry, so the  
`RANGE`-card-squeezes-its-own-story bug that `section-about.tsx` documents  
cannot recur: a clip's height is fixed by the lane, not by its content.

### 4.3 Colour

The three About clips use the **same colours as their hero counterparts**. A  
clip the reader saw in the hero overview is the clip they zoomed into. Colour is  
data (§5), not styling, so this is a data requirement rather than a visual one.

---

## 5. Data model

```ts
/**
 * Years are the ruler's unit. `x` is derived, never stored.
 *
 * Both bounds are READ OFF THE DATA rather than chosen, because the ruler is a
 * claim about the career and `design.md` §0.0 forbids a motif without data.
 * `YEAR_MIN` is the earliest start in `EXPERIENCES`; `YEAR_MAX` is the record's
 * last observable change (2026-10-02, `migrate portfolio blog from VPS/PM2 to
 * Cloudflare Workers`, from `git log`). The `2022 → 2026` in earlier drafts was
 * a sketch of the axis, not the axis: it drops four years of the record and
 * would have made the education lane and the first roles fall off the left edge.
 */
export const YEAR_MIN = 2018
export const YEAR_MAX = 2026.75 // October 2026

export type Lane = {
  id: string
  label: string          // silkscreen, uppercase: 'FRONTEND'
  height: 'tall' | 'normal'  // the NAME lane is the only 'tall'
}

export type ClipKind = 'name' | 'role' | 'project' | 'profile'

export type Clip = {
  id: string
  laneId: string
  kind: ClipKind
  label: string          // 'BISADAYA' | 'ADITYA HIMAWAN' | 'PROFILE'
  start: number          // year, e.g. 2022.0
  end: number            // year, e.g. 2024.5 — width is (end - start)
  color: string          // ProjectPalette accent; the name clip uses --signal-orange
  notes?: readonly number[]  // normalised 0..1 — what shipped
  href?: string
}
```

Mapping to meaning:

| Arrangement | Site                                               |
| ----------- | -------------------------------------------------- |
| lane        | a discipline — frontend / backend / design / infra |
| clip        | a project or role                                  |
| clip width  | how long it ran                                    |
| clip colour | the project's own palette                          |
| bar ruler   | years, 2018 → 2026.75 (derived, not chosen)        |
| playhead    | today                                              |
| note data   | what shipped                                       |

`x = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN) * trackWidth`, computed once per  
resize and cached. Never stored in state.

---

## 6. Choreography and rendering

### 6.1 One pure function

Everything the scene needs comes from one pure function, mirroring  
`riddimFrame(progress)` from the RIDDIM hero — that doc calls it the retime  
point, and this one keeps the convention:

```ts
export type ArrangementFrame = {
  scale: number            // 1.28 → 1.00 → geo.zoomScale (derived, §3.1)
  cameraX: number          // world px — a TRANSLATE, not a focus point (§1.4)
  cameraY: number
  focusX: number           // retained: the playhead's offset is measured from it
  focusY: number
  playheadYear: number     // continuous across the seam (§3.3)
  playheadFraction: number
  playheadOffset: number   // px from the centre line, at the current scale
  railReveal: number       // 0 → 1, drives the lane rail's slide
  clipInterior: number     // 0 → 1, the clip's fill crossfade
  seamInset: SeamInset     // the seam's clip-path, in world px
  bandCentreY: number      // where the camera landed, for the interior's offset
  seamShift: number
  phase: ArrangementPhase
}

export function arrangementFrame(
  progress: number,
  geo: ArrangementGeometry,
): ArrangementFrame
```

Three things about that signature.

**Geometry is an argument, not a DOM read.** Every anchor the frame needs —
`worldWidth`, the profile clip's centre, `zoomScale`, the lane height — arrives
in `geo`, measured once per refresh by a separate `measure()` that reads the DOM.
The frame function itself touches nothing. That is what lets the whole camera be
unit-tested against a written-out fixture at 1440×900 with no browser, and it is
why the lane heights and the camera maths cannot silently drift apart.

**The open overshoots by 4%, deliberately.** `scale` at `progress = 0` is
`OPEN_SCALE * 1.04`, not `OPEN_SCALE`. Without it the first paint is a still
frame and the window opens dead — the arrangement is already at rest before the
reader has scrolled a pixel, so the settle reads as a snap rather than a
release. The 4% gives the camera somewhere to travel from. It is small enough
that the name clip stays inside the frame at every viewport the hero supports
(the §2 sizing has ~14% headroom at 1440px), which is the constraint that keeps
this from being a tuneable.

**`laneOpacity` is deliberately not a field.** An earlier draft had the frame
compute per-lane opacity. It should not: lane dimming changes once, during the
zoom, so a CSS transition keyed off `data-phase` is both cheaper and smoother
than driving it from the frame. Putting it in the frame would recompute it on
every scroll tick and re-render nothing.

Phase boundaries live in one exported const block (`ARRANGEMENT_PHASES`,  
`ARRANGEMENT_SCROLL_SVH`) so retiming is a single edit that keeps proportions —  
the same shape `riddim-choreography.ts` uses.

Because the frame is a pure function of progress, scrolling back renders the  
same frame at the same position. No hysteresis, no state to undo.

### 6.2 Zoom and text sharpness

CSS `scale()` softens type at high zoom. Two mitigations, in order — and the
first is the one the design actually needs, applying to the **ruler** rather
than to the clips.

1. **Scale geometry only; position labels from the frame.** The ruler is the
   case that matters. It sits *outside* the scaled camera (§1.3) and each tick's
   x is computed from the camera's own transform —
   `--year-frac * --arr-world-w * --arr-zoom + --arr-camera-x` — so its type is
   always rendered at real size and it cannot drift from the clips beneath it.
   The clips *do* scale, because they are inside the camera; that scaling is
   what sells the dive.
2. **Scale for the motion, snap to real size.** Held in reserve. If a future
   retime pushes the zoom past the point where the name clip's display type
   softens unacceptably, scale during the motion and swap to a real-size DOM
   layout once the scale settles past `~2.5`. The swap is invisible at speed.

The `2.5` threshold is a guard, not a target, and with the real data it is never
reached: `zoomScale` is derived as `worldWidth / profileClipWidth` (§3.1) and
comes to about `2.02` at 1440×900. The "blurry title" failure mode this design is
most exposed to therefore does not arise at this geometry — but it is one retime
away, which is why the threshold is written down rather than assumed. The name
clip also falls to `0.16` opacity through the zoom, so even at the threshold it
would be the least visible thing on screen.

Note that the ruler needs no "re-render with fewer ticks" step. An earlier draft
had the ruler swap to a sparser tick set as the camera closed in; positioning the
same ticks from the transform gets the same result for free, because ticks that
fall outside the frame simply are outside it. What *is* added is the opposite: a
`data-detail` flag past scale `1.4` reveals the quarter-year ticks, so the ruler
shows *more* of its scale as you zoom in — which is what a DAW does.

### 6.3 Performance

Lifted from the RIDDIM hero's measured findings, which apply directly:

- Writing a custom property on the hero root invalidates the whole subtree, and  
  cost scales with subtree size (1613 ms vs 166 ms measured). Write animated  
  values to the **smallest node that reads them**.
- `display: none` subtrees are *not* skipped; `content-visibility: hidden` ones  
  are, at roughly 10× cheaper. Use it on off-screen lanes.
- Animated properties are `transform`, `opacity` and `clip-path` only. The  
  playhead moves with `translate3d`.
- Budget: **6 lanes × ~14 clips ≈ 84 nodes.** Past that, cull lanes that are  
  fully off-screen.
- `will-change: transform` on the camera container **only while the window is  
  active**, removed on `onLeave` / `onLeaveBack` — the pattern `radio-flip.ts`  
  already uses.

---

## 7. Files

| File                                                                | What it is                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `features/landing-page/components/arrangement/arrangement-hero.tsx` | Stage, camera container, chrome regions                     |
| `.../arrangement/arrangement-camera.ts`                             | `arrangementFrame`, `ARRANGEMENT_PHASES`, `ARRANGEMENT_SCROLL_SVH`. Pure. Retime here. |
| `.../arrangement/arrangement-data.ts`                               | `Lane[]`, `Clip[]`, `YEAR_MIN/MAX`, the year→x helper       |
| `.../arrangement/arrangement-clip.tsx`                              | The one clip component, used by hero and About              |
| `.../arrangement/arrangement-ruler.tsx`                             | The one ruler component, used by hero and About             |
| `.../arrangement/arrangement-playhead.tsx`                          | The one playhead instance                                   |
| `.../arrangement/arrangement-rail.tsx`                              | The lane rail (track headers)                               |
| `.../arrangement/use-arrangement-hero.ts`                           | One ScrollTrigger → CSS custom properties + the frame flags |
| `.../arrangement/arrangement.module.css`                            | All visual maths                                            |
| `features/landing-page/rack-01/section-about.tsx`                   | Re-cut: cards merge into the arrangement (§4)               |

---

## 8. Contracts worth knowing

- **One playhead, one time axis.** §3.3. The playhead is a single instance that  
  survives the seam. Do not re-mount it.
- **The ruler and playhead are pinned through every phase.** They never leave  
  the viewport. This is what makes it a zoom rather than a cut.
- **The name clip is the only saturated element.** Career clips are held back to  
  62% toward `--arr-ground` (`#14171a`), not `--chassis` — see §2. Break this and  
  the focus rule dies.
- **Colour is data.** A clip's colour comes from `ProjectPalette`. The same  
  project has the same colour in the hero and in About.
- **Lane height is fixed, never content-driven.** This is what prevents the  
  story-overflow bug `section-about.tsx` documents.
- **One `h1`.** The name clip's display type is decorative; the accessible  
  heading is a visually-hidden `h1`. The scaled label is `aria-hidden`.
- **The seam's interior is non-interactive by construction, not by an `inert`
  flag.** An earlier draft had About's controls stay `inert` until
  `railReveal === 1`. That is unnecessary *and* wrong. The rail's interior is a
  **copy** of About's arrangement, rendered with plain non-interactive elements
  and `aria-hidden`, so it has no focusable descendants to suppress — there is
  nothing for `inert` to do. The real About is a separate section further down
  the document and must stay reachable; marking it `inert` would drop the résumé
  link and every clip out of the tab order. The rule the draft was reaching for
  is simply: **the copy is never interactive, and the original is never hidden.**
- **Hybrid material.** Software structure, hardware surface: `--chassis` ground,  
  hairline grid, `--lcd-bg`/`--lcd-text` ruler, silkscreen clip labels in Geist  
  Mono, `--r-control` radius, `Screw` at the stage corners.

---

## 9. Fallbacks

**The mechanism that makes all of this free.** Every animated property has a CSS
fallback, and the fallbacks together *are* the settled overview: no translate,
scale 1, the world's top-left at the origin, the playhead on the centre line.
That is not a coincidence to be maintained by hand — it falls out of how the
camera is expressed. Because the frame returns a translate in world coordinates,
`cameraX = worldWidth / 2 - focusX * scale` is exactly `0` when the focus point
is the world's centre, and the world's centre is precisely what the overview is.
So the no-JavaScript frame and the reduced-motion frame are not separate
renderings that must be kept in step with the animation; they *are* the
animation's own fallback values. Verified on the built page: under
`prefers-reduced-motion: reduce` the camera computes
`matrix(1, 0, 0, 1, 0, 0)`.

This is the single reason to prefer a world-coordinate translate over a focus
point plus `transform-origin` (§1.4). A `transform-origin` fallback of `50% 50%`
is not the overview, so that design would need a second set of rules for the
static frame — and the two would drift.

**`prefers-reduced-motion: reduce`.** The arrangement at overview zoom. GSAP and
Lenis are never requested at all — measured, not assumed. The frame is
server-rendered, so the first paint is already the composed arrangement rather
than an empty stage.

The seam stays **hidden** here (`opacity: 0`, switched on only by the hook's
`data-live`). An earlier draft said the static frame should show "the rail
already revealed", and that is the one thing it must not do: the seam's fallback
geometry is the whole track area, so revealing it without the clip-path the hook
computes paints one flat rectangle of clip colour over the entire arrangement.

**No JavaScript.** The same server-rendered frame, plus About as a normal
section below it in the flow. Nothing is hidden behind a script. The ruler keeps
its plain percentage grid, which is why the first paint has a working scale
rather than every tick stacked at one point.

**Phones (`max-width: 768px`).** No zoom, no camera. A single-column *session  
view*: the name clip full width at the top, career clips stacked vertically in  
lane order, and the PROFILE clip becomes About's header. The seam degrades to a  
clip frame growing to meet the section boundary.

**Tablets (`769px – 1180px`).** The rail collapses to lane icons; the camera  
still runs.

**No WebGL needed.** The whole scene is DOM. `three` and `@react-three/fiber`  
are not imported by anything here — see §11.

---

## 10. QA checklist (not run in CI)

- [ ] 1440×900: open → settle → travel → zoom → rail, smooth in both directions.
- [ ] The name clip is legible at **every** zoom level, including 1.28 and the
  derived `zoomScale` (~2.02 at 1440×900).
- [ ] The playhead's year is identical either side of the seam — no jump.
- [ ] The ruler is on screen for the entire window, at every zoom level.
- [ ] Resize mid-scroll: the year→x scale re-measures and the camera re-focuses.
- [ ] 769–1180: the rail collapses; the camera still reads.
- [ ] Phone and reduced motion: session view, working links, no GSAP request.
- [ ] Tab through the page: no focus lands on anything off-screen without the  
  scroll following it.
- [ ] Exactly one `h1` in the document.
- [ ] Career clips read as held-back; exactly one saturated element on screen.
- [ ] 60fps through the zoom on a mid-range device; check `content-visibility`  
  is actually skipping off-screen lanes.

---

## 11. Not done / open

- **Scope.** This document covers hero + About. The full expression is the whole  
  page as one arrangement, with every section a clip the playhead travels  
  through. That is a larger change and should be a separate decision after this  
  lands.
- **Browser panel.** Mapped to site nav in the wireframe but not specified here.  
  If it is kept, it needs its own accessibility pass — a folder tree is not a  
  nav landmark by default.
- ~~**The clock and BPM readouts.**~~ **Resolved.** The clock gets the reader's
  own local time — the one readout on this instrument that is true without being
  invented. It is seeded empty and filled in an effect, so the server and the
  client agree on the first render. The `120 BPM / 4-4` readout is **cut**: About
  has no transport any more, because its playhead is parked (§3.3), so there is
  no tempo to report — and a readout for motion that does not happen is exactly
  the decoration §0.0 forbids.
- **The three proof numbers carry their own ceiling.** `4+ YEARS`, `3 PRODUCT
  TEAMS` and `15K+ USERS` are drawn as meters, so each one prints the scale it is
  measured against (`METER 0–6`, `0–5`, `0–20K`). Without that the bar is a
  decoration that happens to sit next to a number; with it, the bar is a reading.
  The bar's *length* stays honest to its number through every phase — only its
  tint changes — because a meter whose fill disagrees with its own printed value
  is worse than no meter.
- **`three` and `@react-three/fiber`.** Still in `package.json` with nothing  
  importing them once the pad-sea hero is removed. Remove with the lockfiles in  
  a separate commit, as `riddim-hero.md` already noted.
- **The retired `main` hero.** `components/hero/*`, `pad-sea/*`,  
  `chapters/hero/hero-chapter.ts` and `lib/hero-sweep-order.ts` all become dead  
  with this change. Note that `heroChapter` already animates  
  `[data-hero-device]` targets that `section-hero.tsx` no longer renders, and  
  `use-landing-chapters.ts` is written but unwired — `rack-01.tsx` still imports
  the legacy `useRackAnimations`. Clean that up before or with this build, or the
  new hero inherits a hook that animates nothing.

  **This is worse than "animates nothing", and it is the first thing to fix.**
  That hook opens its `min-width: 769px` callback with
  `const hero = querySelector('.hero'); if (!hero) return` — an early return from
  the *entire* callback. The new hero carries its own stylesheet's `.hero` class,
  not `rack-01.module.css`'s, so the selector finds nothing, the guard fires, and
  the about scrubber, the section-heading reveals, the skills sequence and the
  experience→work seam all stop running silently, with no error to trace. Scoping
  the legacy hero block into its own function fixes it; deleting it is better.

---

## 12. Appendix — two traps found by building it

Recorded because neither is guessable from the spec above, and both fail
*silently*: the page still renders, nothing throws, and the motion is simply
wrong.

**1. Never trigger a ScrollTrigger on the sticky stage.** The obvious trigger for
"the hero's scroll window" is the stage, since it is the element that appears
pinned for the whole window. But a `position: sticky` element's bounding rect is
a function of scroll position, so measuring `start: 'top top'` and
`end: 'bottom bottom'` against it resolves *both ends to the same scroll offset*
and leaves a zero-length range — progress sits at 0 or 1 with nothing between.
Trigger the tall section that *contains* the sticky stage instead: `top top` is
the first pixel of the window and `bottom bottom` lands exactly where the stage
unsticks, which is why the range covers the whole window and not a pixel more.

A related one: a window that opens at scroll 0 is already active on load, so
`onEnter` never fires and anything it sets — here, `will-change: transform` — is
never applied for the whole first pass. Use `onToggle`, which also reports state
after a refresh.

**2. The ruler must be a sibling of the lane grid, not a cell inside it.** In
About the rail and the tracks are the two columns of a grid. If the ruler is the
first child of the tracks column, then the rail — which starts at the top of the
grid — sits 36px, one ruler's height, above the lanes it labels. The rail's rows
and the lanes have to begin at the same y, so the ruler goes *above* both columns
and insets its own track by `--arr-rail-w` instead. That inset is also what makes
the ruler's scale begin where the lanes begin.
