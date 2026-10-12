# Arrangement hero — the session is the career

> **Content mode override (added at build time).** The default timeline is no  
> longer the career. The hero ships a **making** session: the ruler's unit is a  
> *workflow stage* (DISCOVER → SHIP), a lane is a kind of frontend production  
> work (COMPOSE / CONNECT / SHIP / PRACTICE), and the bars on a clip are one per  
> technology actually listed for that stage in `MIXER_DATA`. Employers and  
> schools are deliberately **absent** — they are the Experience section's job,  
> and printing them here said the same thing twice.
>
> The career reading described throughout this document is kept whole behind one  
> switch, `ARRANGEMENT_MODE` in  
> `features/landing-page/components/arrangement/arrangement-data.ts`. Set it to  
> `'career'` and the same geometry, seam and About interior load the year axis  
> (2018 → 2026.75), the role clips and the education lane. Nothing else changes,  
> because nothing else reads the mode. See §13 for what was built.

The landing hero is a full-bleed DAW arrangement window. The name is a clip in  
that arrangement, at display scale. The scroll is a camera move: settle on the  
session, travel the timeline, zoom into one clip, and the clip's own rail  
reveals — which is the About section.

This document is the source of truth for the build. Implementation follows §7.

### Implementation override

The shipped default is **making**, not a fictional employment timeline. `ARRANGEMENT_MODE` in `features/landing-page/components/arrangement/data.ts` is the single switch: `'making'` renders workflow stages and shipped frontend outputs; `'career'` restores the `EXPERIENCES`-backed role and education axis from 2018 through 2026.75. The default remains `'making'`, with no employers or education in the initial view.

The implementation uses one sticky arrangement stage and one DOM instance each for the ruler, playhead and lane rail. `arrangementFrame(progress, geometry)` owns the five-phase pure geometry; `use-arrangement-hero.ts` measures once per refresh and writes animated custom properties to `.trackArea`. GSAP and ScrollTrigger load only after phone/reduced-motion guards, and the ScrollTrigger targets the tall `#home` section rather than the sticky stage. The About seam is inert and `aria-hidden` until the rail is fully revealed; phones and reduced motion use the static flow. Its read reproduces the original page animation — the heading and the card rail travel up, the timeline panel holds still (§13.7).

About is three selectable clips — FOCUS, SYSTEMS and RANGE — with one inspector containing the actual practice prose, availability and résumé link. Delivery language names Cloudflare Workers; no VPS claim is part of the shipped arrangement.

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

| Progress    | Phase      | Camera                                           | Playhead                          | Name clip                        | Lane rail |
| ----------- | ---------- | ------------------------------------------------ | --------------------------------- | -------------------------------- | --------- |
| 0.00 – 0.10 | **Open**   | scale 1.28, focused on the NAME lane             | parked at 2022.4                  | full saturation, display type    | hidden    |
| 0.10 – 0.30 | **Settle** | scale → 1.00, focus → arrangement centre         | begins travelling                 | holds                            | hidden    |
| 0.30 – 0.52 | **Travel** | holds 1.00, 3% drift                             | 2022.4 → 2024.6                   | holds                            | hidden    |
| 0.52 – 0.72 | **Zoom**   | scale 1.00 → `zoomScale`, focus → PROFILE centre | decelerates onto the PROFILE clip | falls to 0.16 opacity            | hidden    |
| 0.72 – 0.82 | **Rail**   | holds `zoomScale`                                | parks at the PROFILE clip centre  | persists as the silkscreen label | slides in |
| 0.82 – 1.00 | **Read**   | holds                                            | parked                            | is the panel                     | in        |

The last row is the hold, split in two. §3.2 has the reason and §13.5 the  
measurements: About is taller than the window it is revealed in, so the final  
stretch translates the panel up by exactly its overflow.

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

| Component         | Open                                               | Settle                   | Travel                             | Zoom                                                  | Rail                             |
| ----------------- | -------------------------------------------------- | ------------------------ | ---------------------------------- | ----------------------------------------------------- | -------------------------------- |
| **Stage**         | pinned; holds every layer                          | —                        | —                                  | —                                                     | —                                |
| **TitleBar**      | visible — project name, BPM, clock                 | —                        | —                                  | —                                                     | fades to 0.4                     |
| **Transport**     | visible — tempo, pattern, play/stop                | —                        | position counter runs              | —                                                     | —                                |
| **NameLane**      | camera focused here; full saturation, display type | camera releases          | —                                  | falls to 0.16 opacity                                 | persists as the silkscreen label |
| **CareerLanes**   | visible below, held back to 62%                    | camera settles on centre | clips light as the playhead passes | non-target lanes → 0.12                               | hidden                           |
| **Ruler**         | pinned to the top edge                             | —                        | years advance                      | scales with the camera; quarter ticks reveal past 1.4 | becomes About's ruler            |
| **Playhead**      | parked at 2022.4                                   | begins travelling        | 2022.4 → 2024.6                    | decelerates onto PROFILE                              | parks on the PROFILE clip centre |
| **ProofStrips**   | visible, meters idle                               | meters begin             | meters peak as the playhead passes | hidden                                                | hidden                           |
| **LaneRail**      | hidden                                             | hidden                   | hidden                             | hidden                                                | **slides in from the left**      |
| **ClipInspector** | hidden                                             | hidden                   | hidden                             | hidden                                                | fades in, reads clip `01`        |


Read as a sequence of events rather than a grid:

1. **Open.** Stage pins. TitleBar and Transport are already there — the session  
   is simply *open*. The camera is close on the NameLane, so the title is the  
   largest thing on screen. CareerLanes sit below, held back. Ruler pinned.  
   Playhead parked at 2022.4. ProofStrips idle. Rail and Inspector absent.
2. **Settle.** The camera releases and pulls to the arrangement centre. The  
   playhead starts moving. ProofStrips' meters come alive.
3. **Travel.** The playhead walks the record and each clip lights as it passes.  
   The ruler advances. The reader is being walked through the career.
4. **Zoom.** Non-target lanes fall away, the NameLane drops back, and the ruler  
   re-renders with fewer ticks as the camera dives onto the PROFILE clip.  
   ProofStrips go. The clip's border becomes the frame.
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
  |    --arr-clip-interior
  |
  |  per frame — but to the SEAM, which does not inherit from the track
  |  area because it is a sibling of it, not a child:
  |    --arr-seam-opacity --arr-read-travel
  |    --arr-seam-top      --arr-seam-right  --arr-seam-bottom  --arr-seam-left
  |
  |  on change only — writes datasets, never per frame:
  |    data-phase="open|settle|travel|zoom|rail"       (on <section id="home">)
  |    data-seam="open|closed"                         (on <section id="home">)
  |    data-detail="true|false"                        (on .trackArea)
  v
<div class="stage">
  |- header.chrome        hidden while data-seam="open"
  |- div.trackArea                          the property host
  |    |- * Ruler         left: calc(--year-frac * --arr-world-w * --arr-zoom + --arr-camera-x)
  |    |- .camera         the single scaled node
  |    |    |- transform: translate3d(--arr-camera-x, --arr-camera-y, 0) scale(--arr-zoom)
  |    |    |- lanes      per-lane opacity, from data-phase
  |    |    \- clips      fill crossfade at --arr-clip-interior
  |    \- .pinned         unscaled, sibling of .camera
  |         |- * Playhead translate3d(--arr-playhead, 0, 0)
  |         \- * LaneRail translate3d(calc((1 - var(--arr-rail)) * -100%), 0, 0)
  |- footer.proof         hidden while data-seam="open"
  \- .seam                the clip's interior — a stage overlay, not a track-area child
       |- clip-path: inset(--arr-seam-top --arr-seam-right --arr-seam-bottom --arr-seam-left)
       |- opacity: var(--arr-seam-opacity)
       \- About           the read moves the COLUMN, never the panel
            |- .sectionHeading  translate3d(0, var(--arr-read-travel), 0)
            |- .aboutCardStack  translate3d(0, var(--arr-read-travel), 0)
            |    \- .aboutCardRail   the cards
            \- .timelinePanel   position: relative — does not move
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

| Value                      | Written by                     | Node                  | Read by                                         |
| -------------------------- | ------------------------------ | --------------------- | ----------------------------------------------- |
| `--arr-zoom`               | ScrollTrigger `onUpdate`       | `.trackArea`          | `.camera` scale, ruler tick x                   |
| `--arr-camera-x` / `-y`    | ScrollTrigger `onUpdate`       | `.trackArea`          | `.camera` translate, ruler tick x               |
| `--arr-world-w`            | ScrollTrigger, on measure only | `.trackArea`          | ruler tick x                                    |
| `--arr-playhead`           | ScrollTrigger `onUpdate`       | `.trackArea`          | `Playhead` translate                            |
| `--arr-rail`               | ScrollTrigger `onUpdate`       | `.trackArea`          | `LaneRail` translate                            |
| `--arr-clip-interior`      | ScrollTrigger `onUpdate`       | `.trackArea`          | clip fill crossfade, ruler fade                 |
| `--arr-seam-opacity`       | ScrollTrigger `onUpdate`       | `.seam`               | `.seam` fade-in across the dive                 |
| `--arr-seam-top/-right/-bottom/-left` | ScrollTrigger `onUpdate` | `.seam`             | `.seam` clip-path window                        |
| `--arr-read-travel`        | ScrollTrigger `onUpdate`       | `.seam`               | `.aboutSeam`'s heading and card stack — the read |
| `--arr-about-at`           | ScrollTrigger, on measure only | `<section id="home">` | where `#about` resolves to                      |
| `data-detail`              | ScrollTrigger, on change only  | `.trackArea`          | switches the static fallbacks to the live rules |
| `data-phase`               | ScrollTrigger, on change only  | `<section id="home">` | chrome fade, `ProofStrips`, lane dimming        |
| `data-seam`                | ScrollTrigger, on change only  | `<section id="home">` | hides the chrome and the proof, clears `inert`  |
| selected clip              | React state, on click          | `About`               | `ClipInspector`                                 |

**The seam's properties go on `.seam`, not on `.trackArea`.** This is the one
place the "write to the smallest node that reads the value" rule is not just a
performance note. The seam is a **sibling** of the track area — it has to be, or
it could never paint over the chrome and the proof — so custom properties set on
the track area do not inherit to it. Writing them there left every inset at its
`0` fallback and `--arr-seam-opacity` at `0`: a panel that was fully open and
completely invisible. It is also the smallest node that reads any of them.

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

### 3.1 Zoom (0.52 → 0.72)

- Camera scale rises `1.00 → zoomScale`, where **`zoomScale` is derived, never  
  tuned**: `worldWidth / profileClipWidth`. That is exactly the scale at which  
  the clip's two vertical edges land on the frame's two vertical edges, which is  
  the seam's whole premise — and it is what makes the rail reveal's horizontal  
  insets already zero when it opens, so only the verticals have to move.  
  At 1440×900 against the real axis it comes to about **2.00**. The `6.50`  
  quoted in earlier drafts was an illustration; treating it as the number  
  overshoots the frame and takes the ruler out of alignment with the clips.
- The camera is expressed as a **translate in world coordinates**, not as a  
  `transform-origin` on the focus point — §1.4 and §9 say why that difference is  
  load-bearing for the fallbacks.
- Grid pitch spreads. The ruler's ticks ride the same transform as the clips, so  
  they spread with them; what changes is only which ticks exist (quarter ticks  
  reveal past scale 1.4) — see §6.2.
- Non-target lanes fall to `0.12` opacity; the name clip to `0.16`.
- The dive brings the PROFILE clip's **left edge onto the lane area's left  
  edge** — the rail's right edge — not onto the frame's left edge. The rail is  
  the track-header column, and in a real DAW a clip never slides underneath it.  
  Landing the clip on the frame edge instead parks its label behind the rail,  
  which is what the first build did. The camera target is therefore  
  `-profileStart * zoomScale`, not `-gutter - profileStart * zoomScale`.
- **The clip's border does *not* become the whole frame, and that is the honest  
  reading.** It is true horizontally at the derived scale; vertically a 58px lane  
  would need a scale near 13 to reach the bottom of a 792px band. The clip reads  
  as a wide band across the frame. Inventing a scale to make the earlier sentence  
  literally true would take the ruler out of alignment with the clips, which is  
  worse than the sentence being approximate.

### 3.2 Rail reveal (0.72 → 0.82), then the read (0.82 → 1.00)

This is the moment the transition pays off, and the part that makes About feel  
like the *interior* of the clip rather than the next section:

- The **lane rail** — the track-header column — slides in from the left edge  
  (`x: -100% → 0`). This is the DAW's own idiom: you always zoom with the rail  
  present, and revealing it is what turns a rectangle into a track.
- The **clip-path window opens.** The seam is a panel laid out at its real size  
  for the whole window and uncovered by `clip-path: inset(...)`, which starts as  
  the PROFILE clip's own rectangle and mixes to `0` across `0.72 → 0.82`. A  
  `clip-path` reveal rather than a `transform: scale()` one on purpose: at the  
  start of the dive the clip is 58px tall, so anything that scaled the panel to  
  fit that box would render About's heading at a fraction of its size. Revealing  
  keeps the type at real size and grows the window around it.
- The **chrome and the proof step aside.** The window's insets are measured from  
  the *stage's* edges, not the track area's, so at the end it is the whole  
  viewport: the title bar and the footer are painted over, and `data-seam="open"`  
  takes them out of the tab order. During the dive they are untouched — the  
  window is still inside the track area — so the instrument's own furniture  
  recedes only once the panel has arrived.
- The playhead parks on the PROFILE clip centre — the year §3.3 fixes.

The hold is split in two rather than spent in one, because **About's card column  
does not fit the window it is revealed in.** Measured across six viewports, the  
rail's overflow against the deck runs from **0px (1728×1117 and 1512×982) to  
211px (1280×720)** — it is a function of the viewport, not a constant. So the  
last stretch is *the read*: the heading and the card rail translate up by exactly  
the measured overflow, ending flush with the bottom of the deck, while the  
timeline panel beside them holds still. That is the page section's own animation  
— a sticky panel beside a scrolling column — transplanted into the seam, and the  
reason the panel is no longer translated as a whole. Splitting the phases matters  
too: overlapping them would slide the column while the window was still half  
clipped, which reads as the layout breaking rather than as the page settling.  
See §13.5 and §13.7.

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
| `.../arrangement/arrangement-camera.ts`                             | `arrangementFrame`, the phase consts. Pure. Retime here.    |
| `.../arrangement/arrangement-data.ts`                               | `Lane[]`, `Clip[]`, `YEAR_MIN/MAX`, the year→x helper       |
| `.../arrangement/arrangement-clip.tsx`                              | The one clip component, used by hero and About              |
| `.../arrangement/arrangement-ruler.tsx`                             | The one ruler component, used by hero and About             |
| `.../arrangement/arrangement-playhead.tsx`                          | The one playhead instance                                   |
| `.../arrangement/arrangement-rail.tsx`                              | The lane rail (track headers)                               |
| `.../arrangement/use-arrangement-hero.ts`                           | One ScrollTrigger → CSS custom properties + the frame flags |
| `.../arrangement/arrangement.module.css`                            | All visual maths                                            |
| `features/landing-page/rack-01/section-about.tsx`                   | Re-cut: cards merge into the arrangement (§4)               |

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

The seam goes back **into the flow** here: the stage is unpinned by the media  
query, so the panel is the block below the arrangement and reads normally. It  
must be reachable, because `inert` is set by the hook and the hook never runs  
under reduced motion. An earlier draft kept it at `opacity: 0` — correct while  
About was a sibling section that could be scrolled to anyway, but now the seam  
*is* About, and hiding it would hide the page's entire profile. Revealing it  
un-clipped is only safe *because* it is back in the flow: as an `inset: 0`  
overlay its fallback geometry is the whole track area, so revealing it without  
the clip-path the hook computes would paint one flat rectangle of panel over the  
entire arrangement.

**No JavaScript.** The same server-rendered frame, plus About as a normal  
section below it in the flow. Nothing is hidden behind a script. The ruler keeps  
its plain percentage grid, which is why the first paint has a working scale  
rather than every tick stacked at one point.

This needs an explicit escape hatch, because the pin is **CSS-only**  
(`position: sticky` inside a 460svh section) and would otherwise apply with  
scripting off, leaving 460svh of arrangement with About at `opacity: 0` behind  
it. A `@media (scripting: none)` block un-pins the stage and returns the seam to  
the flow. It is evaluated only when scripting is genuinely disabled, so it can  
never fight the hook — and it needs no `data-live` flip, which would make the  
server render one layout and the client another. Browsers too old to know the  
feature drop the block and keep the animated default.

**Both halves of the unpin have to agree.** Un-pinning the stage is only half of
it: `.aboutSeam` is `position: absolute; inset: 0` so that it can be a pinned
interior, and once the seam around it is `position: relative` it has no sized
ancestor and contributes **no height at all**. Measured: the hero collapsed to
108px and the panel to 40px under reduced motion and with scripting off. The rule
that puts the panel back in the flow therefore has to fire on the same three
conditions as the one that un-pins the stage — a phone, reduced motion, and
scripting off — which it does in a single comma-separated media query, since
those are OR'd. Any future condition added to one list must be added to the
other.

**Phones (`max-width: 768px`).** No zoom, no camera. A single-column *session  
view*: the name clip full width at the top, career clips stacked vertically in  
lane order, and the seam becomes a normal block in the flow. The hero's own hook  
returns before the dynamic import, so the arrangement contributes **no GSAP or  
Lenis request** on a phone. (The rack's chapter animations still load both —  
`use-rack-animations` guards on reduced motion only, not on width. The earlier  
"no GSAP request" claim was true of the arrangement and was wrongly written up  
as true of the whole page.)

**Tablets (`769px – 1180px`).** The rail collapses to lane icons; the camera  
still runs.

**No WebGL needed.** The whole scene is DOM. `three` and `@react-three/fiber`  
are not imported by anything here — see §11.

---

## 10. QA checklist (not run in CI)

- [ ] 1440×900: open → settle → travel → zoom → rail → seam-open → read, smooth in  
  both directions.
- [ ] The name clip is legible at **every** zoom level, including 1.28 and the  
  derived `zoomScale` (~2.00 at 1440×900).
- [ ] The playhead's year is identical either side of the seam — no jump.
- [ ] The ruler is on screen for the entire window, at every zoom level.
- [ ] Resize mid-scroll: the year→x scale re-measures and the camera re-focuses.
- [ ] 769–1180: the rail collapses; the camera still reads.
- [ ] **The read reaches the last About card at every viewport.** The travel is the  
  rail's overflow against the deck: 0px at 1728×1117 and 1512×982 (nothing should  
  translate), 103px at 1440×900, 136px at 1280×800, 205px at 1440×792, 211px at  
  1280×720. The last card's bottom should land flush with the deck's.
- [ ] **The timeline panel does not move during the read.** Its bounding rect  
  should be identical at `seam-open` and at the end — measured 142.3 → 694.8 at  
  1440×900, unchanged at every progress point. Only the heading and the cards  
  travel.
- [ ] **The chrome and the proof disappear once About owns the frame.** Untouched
  through the dive, gone by the time the window is fully open — painted over by
  the seam, and out of the tab order.
- [ ] **`#about` lands on an open window**, not a closed strip: the clip-path  
  insets are all `0` and the heading is inside the visible window.
- [ ] Phone and reduced motion: session view, working links. The *arrangement*  
  makes no GSAP or Lenis request on a phone and none at all under reduced motion;  
  the rack's chapter animations still load both on a phone (see §9).
- [ ] No-JS (DevTools → disable JavaScript, desktop width): the stage is not  
  pinned, About is a readable block below the arrangement, and the page is not  
  460svh of empty scroll.
- [ ] Phone, reduced motion and no-JS: the hero is **taller than its content**
  rather than collapsed — measured 1874px at 390×844, and 1153px under reduced
  motion and with scripting off at 1440×900. A hero of ~108px means `.aboutSeam`
  has lost its containing block (see §9).
- [ ] Tab through the page: no focus lands on anything off-screen without the  
  scroll following it. While the window is closed, nothing inside the seam is  
  reachable.
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

---

## 13. Implementation record

Built. What follows is what actually shipped, and where it departs from the
sections above. The departures are deliberate and each one is a decision, not a
shortfall.

### 13.1 Files, as built

| File | What it is |
| --- | --- |
| `features/landing-page/components/arrangement/arrangement-hero.tsx` | Stage, chrome, camera container, the seam, proof readouts |
| `.../arrangement/arrangement-camera.ts` | `arrangementFrame`, `arrangementPhase`, the phase consts. Pure. Retime here. |
| `.../arrangement/arrangement-data.ts` | Both datasets, `ARRANGEMENT_MODE`, the period parser, `layoutLanes` |
| `.../arrangement/arrangement-clip.tsx` | The one clip component, used by hero and About |
| `.../arrangement/arrangement-ruler.tsx` | The one ruler component, used by hero and About |
| `.../arrangement/arrangement-playhead.tsx` | The one playhead instance |
| `.../arrangement/arrangement-rail.tsx` | The lane rail, `hero` and `panel` variants |
| `.../arrangement/use-arrangement-hero.ts` | One ScrollTrigger → CSS custom properties + two datasets |
| `.../arrangement/arrangement.module.css` | All visual maths |
| `rack-01/section-about.tsx` | **Restored from `HEAD`** — the About panel, rendered as the seam's interior |
| `rack-01/rack-01.module.css` | `.aboutSeam` — what turns a section into a pinned interior |
| `tests/arrangement-camera.test.ts` | 27 pure-function tests, no browser |

`rack-01/section-hero.tsx` is **deleted**; its replacement is the arrangement  
directory, and `rack-01.tsx` composes it. `rack-01/section-about.tsx` was  
deleted in an earlier pass and has been **restored** — see §13.5.

### 13.2 The two deviations that matter

**1. About *is* the sticky stage's interior — reversed from the first build.**
The first build made About a sibling `<section>` below the hero, on the grounds
that an `#about` living inside a `position: sticky` stage resolves to the hero's
scroll origin, so the skip link and every `href="#about"` would land on the top
of the hero instead of on About. That reasoning is still correct, and it is still
the reason the first build was wrong about the fix: the answer is not to move
About out of the stage, it is to put the anchor *where the window opens* rather
than on the panel. `#about` is now a 1×1 anchor at `ARRANGEMENT_SEAM_OPEN ×
travel`, written in px by the hook from the trigger's own range so it cannot
drift when the phases are retimed. Not at `rail` — that is where the window
*starts* opening, so an anchor there lands on a closed strip. Verified: after a
jump to `#about` the clip-path insets are all `0` and the heading is inside the
visible window.

The reason to reverse it: a sibling section can only be *reached* by scrolling,
and the whole request was that the transition be a zoom into About rather than a
scroll to it. Two copies of the panel — one revealed by the dive, one waiting
below — would have been the alternative, and the seam's continuity (same ruler,
same rail, same clip component, same parked playhead) only holds if there is
exactly one.

**2. The playhead opens at the axis start.** §1 left this open, naming the two
honest options. The first was taken: the playhead begins at the axis start — just
outside the frame's left edge while the camera is close on the name — and walks
to the profile clip's centre through the travel and the dive. It is the cheaper
of the two and it reads correctly, because a playhead that starts off-frame and
arrives is a playhead that has *travelled*, whereas one that opens mid-axis and
creeps 2.2 years reads as a nudge.

### 13.3 Corrections to the numbers above

- **`zoomScale` is `worldWidth / profileClipWidth`, as §3.1 says, and the making
  dataset is sized so it lands near 2.0.** The PROFILE clip spans 42%–92% of the
  world, so the derived scale is `1 / 0.5 = 2.0`. The `2.5` sharpness guard in
  §6.2 is therefore never reached, as predicted. The career dataset's longest
  role spans 2018-relative 0.54–1.00 and derives 2.19 — still under the guard,
  which is why one geometry serves both modes.
- **Both camera axes are `0` at the overview.** §9's claim that the fallbacks
  *are* the settled frame only holds if that is true, and the first build did not
  make it true: the camera's own origin sits at the rail gutter, so a
  `viewportWidth / 2 - focusX * scale` translate landed the world 48px off and
  the dive landed the profile clip 96px right of centre. The frame now returns
  `0` at the overview on both axes and mixes to the dive target, and the gutter
  is subtracted from the horizontal target. `arrangementFrame(0.5, fixture)`
  returning `{ cameraX: 0, cameraY: 0 }` is asserted in the test.
- **The static frame anchors the world to the frame's top-left**, which is where
  a DAW puts the start of an arrangement. §9's `matrix(1, 0, 0, 1, 0, 0)` under
  reduced motion is now literally true.
- **The ruler's ticks are positioned, not re-rendered.** As §6.2 argued, ticks
  outside the frame simply are outside it; the quarter ticks are always in the
  DOM and revealed by `[data-detail='true']` past scale 1.4, so the reveal costs
  no render.
- **The name clip's display size is `clamp(34px, 8.2vw, 124px)`.** The clip sits
  inside the camera, so at the open (scale ≈ 1.33) it renders near 157px and
  settles at 118px at 1440px wide. `HIMAWAN` at 118px is ≈976px against a 1344px
  world, and at the open ≈1299px against the 1440px frame — both inside, which is
  the headroom §2 asks for.
- **Clip bars encode a count, not a duration.** Each clip's bar row has one bar
  per channel in its `MIXER_DATA` group, with an envelope over that count. The
  count is the data; the heights are the clip's waveform. This is what lets a
  music motif pass §0.0's rule without inventing a number.
- **About's clip widths are shares of the skill set.** FOCUS / SYSTEMS / RANGE
  cover 6 / 4 / 4 of the 14 channels listed across `MIXER_DATA`, so their clips
  span 43% / 29% / 29% of the world, laid end to end. FOCUS is widest because it
  covers the most of what is actually in the rack.
- **`use-rack-animations` no longer touches the hero.** It drives the section
  headings, the skills sequence, the contact deck and the Experience→Work seam,
  and its hero and About blocks are gone. `rack-01.tsx` no longer owns
  `aboutProgress`; the only About state left is the selected track, and it
  changes on click.


- **Overlapping clips are stacked in rows, not painted over each other.** A DAW
  never draws two clips on top of each other, and the career dataset needs the
  rule: `PT Fatiha Sakti` runs through `80&Company`, and the degree runs through
  all three academies. `layoutLanes` does a greedy first-fit over clips sorted
  by start — exact for interval graphs, so it gives the fewest rows the lane can
  be drawn in — and writes `top` / `height` per clip. Both datasets go through
  it, because the rule belongs to the arrangement rather than to one dataset.
- **The name clip is two lines and its lane is 204px, not 2.6× a normal lane.**
  §2 derives the ceiling from the widest word and then quotes `2.6×`, which
  cannot both hold: two lines at the §2 display size need ~200px, and one line
  holding both words is wider than any frame this hero supports. The lane height
  follows the type, and the type is `clamp(40px, 6.5vw, 96px)`.
- **Clip padding scales with the clip.** `clamp(3px, 6%, 12px)` horizontally and
  `max(3px, height × 8px)` vertically. A seven-month course against an eight-year
  axis is a ~64px box; a fixed 12px gutter each side leaves it no room for its
  own name, and a stacked row is 23px tall.
- **Career clips carry a short label.** `shortLabel` takes the first distinctive
  word — `PT Fatiha Sakti` → `FATIHA`, `Universitas AMIKOM Yogyakarta` →
  `AMIKOM` — because the full name of an institution is four words of which the
  first is a generic prefix. The full name and the role go in the clip's detail
  line. The narrowest education clips still ellipsise at the overview zoom, which
  is what a real DAW does at that zoom level; their full text is one click away
  in the Experience section.
- **There is no tab row on About.** An earlier build put three tabs above the
  arrangement as a second control for the same three tracks, carrying the same
  labels. The clips are buttons; the clip is the selector. One accessory removed,
  per `design.md` §0.1's fifth principle.

### 13.4 Not done

- **`three` and `@react-three/fiber`** are still in `package.json` with the
  pad-sea hero now unreferenced. Remove with the lockfiles in a separate commit,
  as §11 said.
- **The retired `main` hero's dead files** (`components/hero/*`, `signal-field`,
  `lib/hero-sweep-order.ts`, and the hero and about rules inside
  `rack-01.module.css`) are still on disk. Nothing imports them; deleting 11k
  lines of CSS is its own commit.
- **No e2e run**, by request. The unit suite is 135 tests across 7 suites and all
  of them pass; `tsc --noEmit` is clean.

### 13.5 The seam rework — restored About, clip-path reveal, the read

Requested: use the **previous** About component, and make the transition to About
a timeline **zoom-in** rather than a scroll to a section below.

- **`rack-01/section-about.tsx` restored from `HEAD`** and adapted rather than
  rewritten: `scrollProgress` dropped (nothing scrubs it now), the playhead
  parked at `PARKED_PLAYHEAD = 0.62`, and the wrapper changed from
  `<section id="about">` to `<div className={`${styles.about} ${styles.aboutSeam}`}>`.
  The 384 lines of card, transport and timeline markup are the original.
- **The reveal is a `clip-path`, not a `transform: scale()`.** The seam is
  `position: absolute; inset: 0` inside the track area, laid out at its real size
  for the whole window, uncovered by an inset that starts as the PROFILE clip's
  own rectangle. Scaling was rejected because the clip is 58px tall when the dive
  starts, so a panel scaled to fit it would render About's heading at a fraction
  of its size.
- **The ground lives on the window, not on the content that travels.** `.seam`
  carries `background: var(--chassis-hi)`, because the read translates the
  heading and the card rail up and a ground that travelled with them would leave a
  strip of the dark arrangement along the bottom edge — the exact seam the reveal
  exists to close. (§13.5 was written when the whole panel moved; §13.7 narrowed
  what travels, and the reason is unchanged.)
- **`inert` was never being applied.** `render(0)` ran while
  `section.dataset.phase` was already `"open"` (it ships as an initial JSX
  attribute), so the change-only guard made the first frame a no-op and the whole
  clipped panel stayed in the tab order behind the arrangement. The hook now
  tracks the phase it last *applied* in a local, starting from `null`, and
  `cleanup` clears `inert` — without which a resize across the 768px breakpoint
  tears the trigger down and leaves the panel unreachable by keyboard.
- **The read exists because About does not fit.** The panel used to translate as a
  whole, so the quantity was the *panel's* overflow against the window. It is now
  the **card rail's** overflow against the deck — the heading and the cards travel,
  the timeline does not (§13.7) — and that is a different measurement with
  different numbers:

  | viewport  | rail  | deck  | `readOverflow` |
  | --------- | ----- | ----- | -------------- |
  | 1728×1117 | 1003  | 1003  | **0**          |
  | 1512×982  | 876   | 876   | **0**          |
  | 1440×900  | 904   | 801   | **103**        |
  | 1440×792  | 904   | 699   | **205**        |
  | 1280×800  | 847   | 711   | **136**        |
  | 1280×720  | 847   | 636   | **211**        |

  A constant cannot cover that range, so `readOverflow` is measured in
  `measure()` and the frame returns `readTravel = readT × readOverflow`. Verified
  end to end: at `p=1` the rail's bottom lands flush with the deck's
  (879.8 against 880.2 at 1440×900 — a 0.4px rounding gap, from `offsetHeight`
  being integral), and at 1728×1117 and 1512×982 nothing translates at all.
  The rail's `offsetHeight` is `max(content, deck)` because the rail stretches to
  fill the stack, so a viewport with room to spare reports exactly `0` rather than
  a negative travel — the guard is belt and braces, not the mechanism.

  The **timeline never needed to travel**: it is 553px at every viewport above,
  against a deck of 636–1003. It fits everywhere, which is why holding it still
  costs nothing.
- **`justify-content: flex-start` on the stage**, so the overflow falls off the
  bottom where the read can pull it in. Centred, it splits — cutting the heading
  at the top, which no amount of scrolling past the end can recover.
- **The RANGE card's stack claim was stale and is corrected.** It read "This site
  runs on a VPS behind Nginx, watched by Prometheus and Grafana".
  `.github/workflows/deploy.yml` builds with `opennextjs-cloudflare` and deploys
  via `cloudflare/wrangler-action`, and its own comment says the SSH-to-PM2 path
  "no longer exists"; `ecosystem.config.js` is checked in as `.vps-retired`. The
  card now reads `EDGE / DEPLOY TARGET` with "runs on Cloudflare Workers via
  OpenNext with an R2 cache". A card whose whole argument is "I stay close to
  production" cannot be the one place the stack is out of date.
  **Note:** `arrangement-data.ts` had *already* been corrected to say Cloudflare
  Workers, while the restored component still said VPS — the two copies had
  silently diverged, which is how the stale claim survived. `ABOUT_TRACKS` in
  `arrangement-data.ts` is now referenced only by its test, so that test asserts
  on data that renders nowhere. It is left in place for the scaffolding cleanup
  in §13.4 rather than deleted here.

### 13.6 The chrome and the proof step aside for the panel

Requested: once About is showing, the title bar and the footer should not be.

- **The seam became an overlay on the stage, not on the track area.** This is the
  whole change. `.trackArea` is `overflow: hidden` — the camera's transformed
  lanes have to be clipped to it — so a seam inside it could never paint over the
  furniture above and below. As a stage overlay with `z-index: 5` it covers both.
- **Its window is therefore measured from the stage's edges.** `ArrangementGeometry`
  gained `chromeHeight` (42) and `proofHeight` (66); the frame adds them to
  `clipTop` / `clipBottom` and mixes them away with everything else. Without that
  the window would sit one chrome-height too high and the dive would reveal the
  wrong part of the panel. Verified: at `rail` the window is still inside the
  track area (so the chrome and the proof are untouched through the dive), and by
  `seamOpen` all four insets are exactly `0`.
- **`data-seam="open"` sets `visibility: hidden` on the chrome and the proof.**
  They are already *painted* over by then, so this is not a visual change — it is
  what takes the nav and the "Open profile" link out of the tab order. Leaving
  them focusable behind an opaque panel is how a keyboard user tabs into nothing.
  Verified: `focus()` on a chrome nav link is a no-op while About is open.
  `visibility` rather than `display`, because collapsing the chrome would move
  every lane out from under a camera whose geometry is measured once per refresh.
- **A second instance of the inheritance trap.** The seam's custom properties
  were being written on `.trackArea`. That worked while the seam was a child of
  it; as a sibling the seam inherits nothing, so every inset fell back to `0` and
  `--arr-seam-opacity` to `0` — a panel that was fully open and completely
  invisible. They are now written on `.seam` itself, which is also the smallest
  node that reads them. **The first verification missed this** because it read
  the properties off `.trackArea` — the source, not the consumer. Read the values
  off the element that uses them.
- **`.aboutSeam` needed a containing block in the fallbacks.** With the seam
  `position: relative` under reduced motion and with scripting off, an absolutely
  positioned `.aboutSeam` has no sized ancestor and contributes no height:
  measured, the hero collapsed to **108px** and the panel to **40px**. The rule
  that puts it back in the flow — previously phone-only — now covers all three
  conditions in one comma-separated query, since `(max-width: 768px)`,
  `(prefers-reduced-motion: reduce)` and `(scripting: none)` are OR'd. Verified:
  hero 1153px, panel 1045px, in flow, under both.
- **A latent 19px camera error was fixed on the way.** `measure()` was passing
  `viewportHeight = clientHeight - rulerHeight` while `clipBottom` assumed it had
  *not* been subtracted, so the profile clip sat 19px above the band's centre —
  half the ruler. `viewportHeight` now means the track area's full height, the
  same as its doc comment always said, and a test pins the vertical centring.
  The fixture also states the measured geometry (stage 900 = 42 + 792 + 66)
  rather than a rounded one, so the two cannot drift apart again.

### 13.7 The read moves the column, not the panel

Requested: reproduce the previous animation inside the About panel — the timeline
stays put while the card rail moves up.

The old About was a page section, and its animation was pure CSS:
`.timelinePanel { position: sticky; top: clamp(24px, 7vh, 72px) }` beside a
scrolling column of cards inside a grid `.aboutDeck`. The read had been
translating the whole panel as one piece, which is not that animation — it slid
the timeline along with everything else.

- **The travelling set is the heading and the card stack.** Not the panel, and
  not the rail alone. Nothing wraps exactly those two: the deck between them also
  holds the timeline, which must not move. So both elements take the transform
  individually. Transforms do not affect layout, so this is equivalent to moving
  a wrapper — and it leaves the deck's grid row, which the travel is measured
  against, completely undisturbed.
- **The heading travels because it is the top of the column.** As a section it
  scrolled off with the cards. It is clipped by the seam's `clip-path` — the
  stage box — so it exits cleanly rather than bleeding over the arrangement.
- **`.timelinePanel` is `position: relative` inside the seam.** Sticky would
  resolve against the nearest scrollport, which inside a pinned stage is the page
  itself: inert during the read and unpredictable after it. The panel is 553px
  against a deck of 636–1003, so it fits at every viewport and holding it still
  costs nothing. `relative`, not `static`, because its screws are absolutely
  positioned against it.
- **`readOverflow` is now the rail's overflow, not the panel's.** Measured as
  `rail.offsetHeight - deck.offsetHeight`, both layout boxes — see the table in
  §13.5. The rail's top sits flush with the deck's top (the stack is the deck's
  first grid item, the rail the stack's only child) and the deck's bottom is the
  stage's content bottom (the deck is the `flex: 1` child of a `height: 100%`
  stage), so the difference is exactly the travel that lands the last card flush.
- **Two hooks were added for the measurement**, because the boxes have to be
  found without a second ref: `data-about-rail` on `.aboutCardRail` and
  `data-about-read` on `.aboutDeck`. The second is the window the read travels
  inside — it is what "fits" has to mean now that the panel is no longer the
  thing that moves.
- **`offsetHeight`, not a bounding rect.** The stack carries the read's own
  translate, and a rect would measure the moved element — the travel would shrink
  by its own displacement on every re-measure.
- **Verified at 1440×900, p=1:** `--arr-read-travel` is exactly `-103px`, the
  rail's bottom lands at 879.8 against the deck's 880.2, and `.timelinePanel`'s
  rect is `top: 142.3, bottom: 694.8` **at every progress point from 0 to 1** —
  it does not move a pixel. The heading goes 19.8 → -83.2 and the rail 79.3 →
  -23.7.
- **`#about` still lands on a fully open window**: progress 0.82, `data-seam`
  `open`, all four insets `0`, `readTravel ≈ 0` (the read starts there), panel not
  `inert`. Phone, reduced motion and scripting-off all keep the panel in flow with
  `transform: none` and all three cards visible; the phone hero is 1874px, the
  other two 1153px.
