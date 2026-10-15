# arrangement-descent.md — one arrangement, four magnifications

Design spec for the hero → About rework. **This supersedes `arrangement-hero.md`  
§1** (the phase table and the three beats), **§13.5** (the seam rework), **§13.7**  
(the read), and the parts of **§13.11 / §13.12** that describe the seam's  
clip-path window. Everything else in that document — the data model, the pure  
frame function, the fallback strategy, the performance rules — still stands and  
is depended on here.

Nothing in this document is measured yet. Every number marked *(to measure)* is a  
placeholder until a probe replaces it, in the same way §13.x replaced §6's  
estimates.

---

## 0. Premise

The hero is one session. The scroll is the transport. **Nothing is ever  
replaced** — every level the reader descends through is the previous level  
magnified.

### 0.1 The spine is already in the data

`MIXER_DATA` has exactly three groups: `frontend`, `app-data`,  
`delivery-infra`. They are not a new idea — they already drive:

| Where             | How                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------- |
| The mixer         | all 85 strips, via `MIXER_STRIPS`                                                             |
| The pattern clips | the piano rolls, via `levels('frontend')` / `levels('app-data')` / `levels('delivery-infra')` |
| About             | the three cards — FOCUS / SYSTEMS / RANGE                                                     |
| The clip colours  | `GROUP_COLORS`                                                                                |

One spine already threads the whole page. Nothing tells the reader it is there.  
**This spec does not invent a story; it makes the existing one legible.**

### 0.2 Three problems with the current build

1. **The story is structural, not legible.** Five phases and three beats live  
   entirely in the choreography. A reader sees a playlist and a zoom; nothing on  
   screen says *this is a career* or *you are now inside the profile*.
2. **The seam is optical, not structural.** The dive is a camera move and a  
   clip-path reveal, but the thing it reveals shares no object with the thing  
   that revealed it: About brings its own playhead and its own ruler. The  
   contract in §1 — *"the ruler and the playhead never leave"* — holds inside the  
   hero and breaks at the seam. This is precisely the criticism §0 levelled at  
   the `riddim` hero it replaced ("its continuity is optical... rather than  
   structural"), and the current build has not escaped it.
3. **The two arrangements disagree.** The hero's six lanes are `name`,  
   `profile`, `compose`, `connect`, `ship`, `practice`; About's three tracks are  
   FOCUS / SYSTEMS / RANGE. The dive therefore lands somewhere that does not look  
   like where it came from.

### 0.3 The rule, unchanged

From `design.md` §0.0:

> **Every music motif encodes something real. No data, no motif.**

Every element this spec adds is checked against it in §4 and §5. The chapter  
rail encodes the descent's four real scroll offsets. The marker strip encodes  
the current phase, which is a derived value. The velocity skew encodes scroll  
speed. Nothing is decoration.

---

## 1. The canonical arrangement

**Lanes are disciplines. The ruler is process. The two axes are orthogonal, and  
that is the whole reason the arrangement reads.**

| Axis                  | Meaning                                        | Source                                                        |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| **Lanes** (y)         | what I practise                                | `MIXER_DATA` — `frontend`, `app-data`, `delivery-infra`       |
| **Ruler markers** (x) | how work moves                                 | `RULER_LABELS` — DISCOVER → DEFINE → COMPOSE → CONNECT → SHIP |
| **Bars** (x)          | the measure                                    | `ARRANGEMENT_BARS` = 32                                       |
| **The PROFILE**       | a **cycle region** on the ruler, `0.42 → 0.92` | the existing `profile` clip's own start/end                   |

### 1.1 What happens to the current six lanes

| Today                          | Becomes                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                         | a **tall lane** at the top, spanning `0 → 1` — unchanged, and still the one full-saturation element and the document's single `h1` (§2 of the old doc stands) |
| `profile`                      | **not a lane.** It becomes the cycle region drawn on the ruler, which is what a DAW calls the thing you loop                                                  |
| `compose` / `connect` / `ship` | folded into the three practice lanes as the clips that occupy them                                                                                            |
| `practice`                     | the third practice lane's tail                                                                                                                                |

This removes the `compose` / `connect` / `ship` lanes, which currently duplicate  
the ruler's own labels — the same five words appearing on both axes.

### 1.2 What exists at each level

| Level           | Scale                 | Lanes drawn                              | Ruler draws                      | The reader is looking at |
| --------------- | --------------------- | ---------------------------------------- | -------------------------------- | ------------------------ |
| **Project**     | 1                     | name + 3 practices + ghosts              | markers + 32 bars                | the whole session        |
| **Arrangement** | 1 (camera settles)    | the 3 practices, name released           | markers, bars legible            | what I practise          |
| **Region**      | → `regionScale`       | 3 practices, non-target clips dimmed     | the cycle region fills the frame | one region of the work   |
| **Samples**     | `regionScale` (holds) | 3 practices, clips resolved into samples | markers pinned, bars re-spaced   | the facts inside it      |

---

## 2. The four magnifications

`ARRANGEMENT_PHASES` is replaced. The old five phases map onto the new four  
levels with one extra beat for the walk, which is kept because it is where the  
clips ignite.

| Progress *(to measure)* | Level           | Camera                                   | Playhead                                  | Name                    | Rail      | Inspector |
| ----------------------- | --------------- | ---------------------------------------- | ----------------------------------------- | ----------------------- | --------- | --------- |
| 0.00 – 0.08             | **Project**     | scale 1, whole world                     | parked at the left                        | full saturation         | hidden    | hidden    |
| 0.08 – 0.24             | **Arrangement** | holds 1, drift only                      | begins walking                            | holds                   | hidden    | hidden    |
| 0.24 – 0.44             | **Walk**        | holds 1, 3% drift                        | walks the axis; clips ignite as it passes | falls to 0.16           | hidden    | hidden    |
| 0.44 – 0.62             | **Region**      | 1 → `regionScale`, target → cycle region | decelerates onto the region               | falls to 0              | slides in | fades in  |
| 0.62 – 1.00             | **Samples**     | holds `regionScale`                      | parks at the region's centre              | is the silkscreen label | in        | reads     |

The last row is no longer split. In the current build `seamOpen → 1` exists  
because About is taller than the window it is revealed in and the panel has to  
translate by its own overflow (§13.5, §13.7, §13.12). **In this model there is  
no window to overflow** — the panel is part of the world and the camera's scale  
is what changes — so the read becomes a plain hold, and the overflow arithmetic  
that took three sections to get right disappears with it.

---

## 3. The continuity objects

This is the section that makes the seam structural. Three elements exist  
**once** and are re-used at every level.

| Object        | Today                                                       | After                                                                                               |
| ------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Ruler**     | one in the hero, a *second* inside About's timeline panel   | **one**, outside `.camera`, reading `--arr-zoom` / `--arr-camera-x` — which is already how it works |
| **Playhead**  | one in the hero, a *second* in About's panel (`--playhead`) | **one**, reading `--arr-playhead` at every level                                                    |
| **Rail**      | one, revealed at `rail`                                     | **one**, always in the DOM, revealed at Region                                                      |
| **Inspector** | About's `.timelinePanel`, a separate instrument             | the **same panel**, re-purposed — it is a DAW inspector either way                                  |

**The seam's clip-path window goes away.** Today the reveal is a `clip-path`  
whose insets are measured from the stage's edges (`chromeHeight` /  
`proofHeight` in `ArrangementGeometry`). In the new model the camera simply  
keeps scaling, and what was the window is the world at the next magnification.  
The seam becomes a `transform: scale()` on `.camera` — the same property the  
rest of the descent already uses.

That is the single largest change in this spec, and it is why §7 exists.

---

## 4. The narration

Two additions, both driven by the same phase the camera already reads.

### 4.1 The chapter rail

A vertical tracklist at the left edge, outside `.camera` so it never scales.

| Chapter     | Scroll offset | Lit when    |
| ----------- | ------------- | ----------- |
| Session     | 0.00          | Project     |
| Arrangement | 0.08          | Arrangement |
| Region      | 0.44          | Region      |
| Profile     | 0.62          | Samples     |

Each entry is a real control that scrolls to its offset, so it encodes the  
descent rather than decorating it. It replaces the dock's job for the length of  
the hero — the dock already retires for the dive (§13.9), and this is what  
stands in for it.

**Not decoration**, because: the four offsets are the four phase boundaries, and  
the lit state is `frame.phase`. Both are already computed.

### 4.2 The marker strip

One line, under the ruler, crossfading on phase change. Written on change only,  
like `data-phase` and the position LCD — a text write per frame would cost more  
than the line is worth.

Provisional copy *(to be written properly once the structure is standing)*:

| Level       | Line                                      |
| ----------- | ----------------------------------------- |
| Project     | Four years, three practices, one session. |
| Arrangement | The lanes are what I practise.            |
| Walk        | The markers are how the work moves.       |
| Region      | One region of it is the profile.          |
| Samples     | The samples are the facts.                |

The strip is `aria-live="polite"` — it is the only prose the hero has, and a  
screen-reader user should hear it change.

---

## 5. The motion

### 5.1 Velocity

Scroll speed is currently unused. It becomes a second input to the frame:

```
frame = f(progress, velocity, geometry)
```

Velocity drives three things, all of which encode it:

1. **Playhead skew** — `skewX` proportional to velocity, clamped. A tape  
   scrubbed fast leans.
2. **Meter response** — the mixer's meters read velocity, not a fixed  
   animation, so they answer the reader's hand.
3. **A light grain** — opacity only, on a single overlay, clamped. No blur, no  
   glow; §0.0's "no motif without data" applies to it as much as to anything  
   else.

**`arrangementFrame` stays pure.** Velocity arrives as a number, not as an event  
listener inside the function, so the existing fixture test keeps working and  
gains a velocity case.

### 5.2 Parallax depth

Each lane gets a small `translateZ` (or an equivalent `translateY` offset scaled  
by zoom, which is cheaper and avoids a 3D context). The dive then reads as  
three-dimensional rather than flat.

**Budget:** the lanes are already `transform`ed as one subtree under `.camera`.  
Parallax means the three practice lanes get **their own** transforms — three  
extra composited layers. That is the cost, and it is why §10 sets a frame  
budget before this lands.

### 5.3 What does not change

- GSAP is still imported dynamically, and still only after the runtime check, so  
  phones and reduced-motion visitors never pay for it.
- Measurements are still taken once per **refresh**, never per frame.
- The trigger is still the tall section, never the sticky stage.


## 7. Geometry — what gets re-derived

The honest scope. The following measured work is **replaced**, not adjusted:

| Replaced                                                                        | Why                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `chromeHeight` / `proofHeight` and the clip-path insets                         | there is no window; the camera scales                    |
| `ARRANGEMENT_SEAM_OPEN` and the read's overflow arithmetic (§13.7, §13.12)      | there is no overflow to translate                        |
| The `@media (max-height: 780px)` chrome trim (§13.12)                           | it existed to buy back lane height inside a fixed window |
| The phone's `.aboutSeam .timelinePanel { display: none }` re-assertion (§13.12) | the panel is no longer a second instrument to hide       |

| Kept                                       | Why                                                      |
| ------------------------------------------ | -------------------------------------------------------- |
| The `--arr-dock-band` reservation (§13.12) | the dock is still `fixed` and still owns the bottom 76px |
| The flow fallbacks (§13.9, §13.10)         | phone / reduced motion / no-JS still get layout only     |
| `worldWidth`, `gutter`, the rail's width   | unchanged                                                |
| The pure `arrangementFrame` signature      | gains `velocity`, otherwise identical                    |

---

## 8. Fallbacks

Unchanged in kind from §9 of the old doc, and this is a hard requirement:  
**phones, reduced motion and no-JS get the arrangement laid out, not animated.**

- The three practice lanes stack, the chapter rail becomes a horizontal strip,  
  the marker strip keeps its lines, and the inspector sits below the lanes.
- Nothing is `display: none` that carries content. The current build hides the  
  panel on phones because 540px of arrangement does not fit a 360px column —  
  that constraint does not apply once the panel is a stacked block.
- `inert` is still set by the hook on the first frame and cleared by its  
  cleanup, so a resize across the breakpoint cannot strand the panel  
  unreachable.

---

## 9. Accessibility

| Concern                        | Handling                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| One `h1`                       | the name clip's, unchanged                                                              |
| The narration is prose         | the marker strip is `aria-live="polite"`                                                |
| The chapter rail is navigation | a `<nav>` with a real label; each entry a link, not a div                               |
| Selection                      | `aria-pressed` on the sample buttons, unchanged                                         |
| The dive is decorative motion  | `inert` on the world while the camera moves, cleared at Samples — the existing contract |
| Reduced motion                 | the layout-only path, §8                                                                |

---

## 10. Performance budget

Set before building, so the parallax and velocity work has a number to fail.

| Metric                  | Budget                        | How                                                  |
| ----------------------- | ----------------------------- | ---------------------------------------------------- |
| Frame time, mid-descent | ≤ 8ms p95 at 1440×900         | probe, six viewport sizes                            |
| Composited layers       | ≤ 6                           | `.camera`, 3 lanes, ruler, playhead                  |
| Per-frame DOM writes    | 0 text, ≤ 8 custom properties | already the rule; the marker strip is on-change only |
| JS on a phone           | 0 bytes of GSAP               | the existing dynamic-import gate                     |

---

## 11. Build order

Each step ships on its own and leaves the page working.

1. **The canonical arrangement.** Lanes become the three practices; the PROFILE  
   becomes the ruler's cycle region. No motion change. This alone fixes  
   problem 3.
2. **The continuity objects.** One ruler, one playhead, one rail — delete  
   About's duplicates. Still no motion change.
3. **The camera continues.** Replace the clip-path window with a scale, so the  
   seam is a zoom. Re-derive §7. This fixes problem 2 and is the riskiest step.
4. **About as the sample view.** The panel becomes the inspector; the cards  
   become lane content.
5. **The narration.** Chapter rail, then the marker strip.
6. **Velocity, then parallax.** Last, because both are additive and both have a  
   budget to meet.

Steps 1–3 are the ones that change the architecture. Steps 4–6 are additive.

---

## 12. Open

- **The cycle region's visual.** A DAW draws it as a highlighted bar across the  
  ruler. Whether it also gets a bracket over the lanes is unresolved.
- **Whether the walk keeps its own beat.** The old five phases gave the walk  
  `0.30 → 0.52`; the new table gives it `0.24 → 0.44`. Whether the clips'  
  ignition is strong enough to justify a dedicated beat is a question for the  
  first probe, not for this document.
- **The narration copy** is provisional and should be rewritten against the  
  finished structure.
- **`ARRANGEMENT_SCROLL_SVH`** was carried over unchanged at `460`, and has since
  been **measured down to `400`**. The bridge's runway now holds the reading panel
  clear of the decorative word band for the whole of SIGNAL's beat, which costs
  the bridge about 400px of scroll; the hero giving back 540px is what pays for
  it, so the page is shorter than it was *and* the words get their window. The
  probe decided it, as this list asked. Four levels instead of five may still
  want a different total.
