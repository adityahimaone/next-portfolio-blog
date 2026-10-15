# Front of House — a scroll concept for the landing page

Brainstorm. No code until a direction is approved.

Companion to the reference the owner sent: <https://selora-template.modulify.website/>.
Read against `design.md` §0.0 (every motif encodes something real) and
`docs/arrangement-hero.md` (what the hero is today).

---

## 1. The brief, restated

- The owner wants a **different** concept from the Patch/device line.
- Named direction: **animation scroll and parallax**, in the manner of Selora.
- It still has to be this site. The studio-hardware world and the §0.0 rule are
  not up for negotiation.

So the question is not "should we add parallax". It is: **what does parallax
mean on a page whose subject is audio, and what real data drives it.**

---

## 2. What the reference actually does

Selora is an editorial art portfolio. Its techniques, separated from its art
direction:

| What you see | The mechanic | Copyable here? |
| --- | --- | --- |
| `001 PHASE/BREAK … 004 PHASE/RELEASE` | a persistent numbered index that tracks scroll | **Yes** — the page already has five real phases |
| `I break things / to see WHAT / THEY ARE MADE OF` | huge display type revealed line by line, with deliberate mid-phrase breaks | **Yes** — Syne at 750 is already the display face |
| Full-bleed photograph, caption sliding past | pinned media, scrubbed caption | **Yes**, with real captions only |
| `ARTIFACT—I / II / III` rail | a horizontal rail whose travel is driven by vertical scroll | **Yes** — the rack already drag-scrolls |
| `ILLUSION LATENCY PERSPECTIVE CONTROL` | a ticker whose speed answers scroll velocity | **Yes** — `SignalDivider` is already one |
| `CAT — 1.07`, `MOD — I/AK`, `NTRL461.78.A.002` | a specimen-annotation layer over everything | **Yes, conditionally** — only if every value is real |
| `0 / 6`, `IDX — A7` | position counters | **Yes** |
| Grain, monochrome, editorial serif, luxury restraint | art direction | **No** — wrong brand |

The last row is the important one. Selora's *mechanics* transfer. Its *mood*
does not: warm aluminium and signal orange is not black-and-bone editorial, and
a portfolio that invents catalogue numbers is exactly what §0.0 exists to
prevent.

---

## 3. What the page already owns

### 3.1 The real data spine

Nothing below is invented; every value already ships.

| Source | Values | Already drives |
| --- | --- | --- |
| `RULER_LABELS` | `DISCOVER → DEFINE → COMPOSE → CONNECT → SHIP` | the hero's ruler |
| `ARRANGEMENT_BARS` | `32` | the bar grid and ruler ticks |
| `MIXER_DATA` | 3 groups, 85 strips | the mixer and the Patch lanes |
| `GROUP_COLORS` | `#c07352`, `#7d97ab`, `#4e91a8` | strip and clip colour |
| `PROOF_READOUTS` | `4+ YEARS`, `3 PRODUCT TEAMS`, `15K+ USERS`, each with a `ratio` | the proof meters |
| `ARRANGEMENT_CLIPS` | `start` / `end` per clip | clip width and position |
| PROFILE clip | `0.42 → 0.92` | the dive target |
| Sections | hero, skills, experience, work, contact | the page |

Two of these are gifts for a scroll concept, and neither is being used as one:

- **`RULER_LABELS` is a five-act structure.** Five named phases, already the
  page's own vocabulary, already printed on the ruler. Selora had to invent
  `PHASE/BREAK … PHASE/RELEASE`; this page has the real thing.
- **`ARRANGEMENT_BARS = 32` is a real denominator.** Any position on the page
  can be printed as a bar number that means something, because the grid is real.

### 3.2 The primitives already built

This is not a greenfield job. The page already has most of a parallax system,
just not assembled as one:

- **`SignalField`** — a layered background wash with a travelling band, a
  drift and a grain tile, blended with `screen` and painted into a single group
  precisely because four blended layers cost 26fps. **This is already a depth
  plane.**
- **`CableDivider`** — a literal cable between two sections, labelled
  `SIGNAL PATH / 03-04`. **The through-line already exists.**
- **`SignalDivider`** — repeating phrase lanes. **A marquee already exists.**
- **`pad-sea`** — a three.js ground plane in perspective, bridged to scroll
  progress through a ref, with a CSS-perspective derivation that reproduces the
  camera exactly. **A real 3D depth plane already exists.**
- **`arrangement-camera.ts`** — camera as a pure function of
  `(progress, geometry)`, with tests. **The pattern to copy for every new plane.**

---

## 4. The concept space

Four directions, in descending order of how much of the page they change.

### A. Front of House — layered depth on a real spine *(recommended)*

A venue has a stage, a room, and a desk at the front of house. Depth in audio
is not only z — it is **wet against dry**. The nearest plane is sharp and dry;
each plane behind it is softer, slower and wetter.

Four planes, four rates, four real drivers:

| Plane | Rate | Driven by | Material |
| --- | --- | --- | --- |
| **Plate** (deepest) | 0.35× | `ARRANGEMENT_BARS` — the 32 ticks | pre-blurred once, low contrast |
| **Room** | 0.55× | `SignalField` — the wash and grain | `screen` blend, single painted group |
| **Content** | 1.00× | `MIXER_DATA`, `PROOF_READOUTS` | sharp, the reference plane |
| **Chrome** | 1.25× | scroll progress, the playhead | hardware: screws, rails, labels |

Two additions make it structural rather than decorative:

- **The spine.** The hero's ruler is horizontal because the hero is a DAW. As
  the dive completes, the same ruler **rotates to vertical and pins to the left
  edge**, and stays for the rest of the page. Its five phase labels become the
  page's five acts; its fill is scroll progress; its ticks are the 32 real bars.
  The reader never loses the ruler — which is already the stated rule in
  `arrangement-hero.md` §1 ("why the ruler and the playhead never leave").
- **The through-line.** `CableDivider` stops being a one-off ornament between
  two sections and becomes **one cable that runs the whole page**, drawn by
  scroll: an SVG path whose `stroke-dashoffset` is the scroll position, with a
  node at each section that lights when the signal reaches it. The cable is
  already there; it just currently starts and stops.

**Cost:** the hero is untouched. The dive still happens; the spine is what the
dive hands off *to*. This is the only one of the four that does not re-open the
work just shipped.

### B. The Scrub — the page as one arrangement

The whole page is a single arrangement. A fixed transport at the foot carries a
32-bar waveform whose playhead *is* the scroll position, and each section is a
clip with a printed position on that timeline. Vertical scroll drives a
horizontal rail of clips — a genuine two-axis scrub, which is the most literal
reading of "scroll and parallax".

- Real: bars, clip spans, playhead, section order.
- Strongest single device; closest to Selora's archive rail.
- **Risk:** one more full-viewport pinned element competing with the hero's
  pin, and a transport bar that has to survive every breakpoint.

### C. The Room — walk the desk

The page becomes a place you move through: the rack recedes, the desk arrives.
Depth is literal, and `pad-sea`'s existing perspective plane is the floor.

- **Risk:** this is the most generic parallax on the list, and the easiest to
  make decorative. It also puts the most on the compositor, against a guardrail
  that says the scrub stays transform-and-opacity only.

### D. The Catalogue — Selora's annotation layer

Not a motion system: a typographic layer that can sit over any of the above.
Every section becomes a specimen with a real catalogue number, and the
silkscreen layer carries real values only — `BIS-001 / FRONTEND / 6 CH`,
`4+ YEARS`, `15K+ USERS`.

- Cheap, and it is the most recognisably "that reference".
- **Fails alone.** It is a skin. It needs A, B or C underneath it.
- Pairs naturally with A: the spine's labels and the annotation layer are the
  same information at two scales.

---

## 5. Recommendation

**A, Front of House, with D as its annotation layer.**

Reasons, in order of weight:

1. **It uses the phase structure the page already has.** Selora invented its
   numbered acts. This page has five named ones on its own ruler. That is the
   single strongest thing the reference has, and it is free here.
2. **It is additive.** The Patch was just built and verified. A is a spine and
   a set of planes *around* the existing sections, not a rewrite of any of them.
3. **It is honest parallax.** Depth maps to wet/dry, which is what depth means
   in audio. A plane that is only "moving slower" is decoration; a plane that
   is slower *because it is further away in the mix* is not.
4. **It reuses four primitives that already exist** (§3.2), so the new code is
   mostly assembly and one pure function per plane.

B is the more impressive single device and I would take it as a second phase if
the owner wants the timeline to be the page's identity. C I would not take. D
should not ship alone.

---

## 6. What A looks like, concretely

```
┌──────────────────────────────────────────────────────────────┐
│  hero: the dive, unchanged                                   │  Plate + Room
├──────────────────────────────────────────────────────────────┤
│ ▍01                                                          │
│ ▍DISCOVER   skills                                            │  ← spine pins
│ ▍   │                                                         │
│ ▍   ├── the cable draws downward as you scroll               │
│ ▍   │                                                         │
│ ▍02│        experience                                        │
│ ▍DEFINE                                                       │
│ ▍   │                                                         │
│ ▍03│        work                                              │
│ ▍COMPOSE                                                     │
│ ▍   │                                                         │
│ ▍04│        contact                                           │
│ ▍CONNECT                                                     │
│ ▍05│                                                         │
│ ▍SHIP                                                        │
└──────────────────────────────────────────────────────────────┘
   spine = the hero's ruler, rotated and pinned. Fill = scroll.
   ticks = the 32 real bars. playhead = the reader.
```

Each act opens with **one pinned statement** — the `ART IS A CONTROLLED
INTERRUPTION` move — using existing copy only, at display scale, revealed line
by line. No new sentences.

### The phase-to-section mapping

| Phase | Section | Why |
| --- | --- | --- |
| 01 DISCOVER | hero | the dive is the discovery |
| 02 DEFINE | skills | the stack, stated |
| 03 COMPOSE | experience | work assembled |
| 04 CONNECT | work | shipped and reachable |
| 05 SHIP | contact | the end of the chain |

This mapping is a **proposal, not data.** It is the one editorial decision in
this document, and it is the owner's to make.

---

## 7. Motion budget

The guardrails in `docs/perf-baseline.md` bind, and they are not generous:

- **Transform and opacity only in the scrub.** No per-frame `filter`.
- **The wet/dry blur is static.** Each back plane is blurred *once* at the
  asset level, then only transformed. A blur that animates is a repaint per
  frame and the baseline forbids it.
- **At most two blended layers on screen**, per `design.md` §0.2. `SignalField`
  already exists because four blended layers measured 26fps.
- **One ScrollTrigger per section, never on a sticky stage** — the existing
  rule, and the spine must obey it.
- **Reduced motion is the settled frame**, not an approximation: every plane at
  1×, the spine printed in full, the cable fully drawn. The Patch already
  established this pattern and it should be copied, not re-derived.

---

## 8. What this fixes, and what it costs

**Fixes**

| Problem | Fixed by |
| --- | --- |
| The page has no single through-line; dividers start and stop | the cable becomes continuous |
| The ruler is abandoned after the hero | the spine carries it the whole page |
| Sections arrive with no shared structure | five real acts |
| The page reads as one long scroll with no position | the spine prints position |

**Costs**

- A new pinned element (the spine) and its breakpoint behaviour.
- The cable becomes scroll-driven, so it gains a ScrollTrigger and a
  reduced-motion path.
- Every new plane is a compositor layer; the budget is finite and already spent
  once by `SignalField`.
- The phase mapping (§6) is an editorial claim and needs the owner's sign-off.

**Not in scope:** the Patch, the hero's camera, the arrangement math, and the
audit's HIGH-1 (the dead chapter retime) — all unchanged by this.

---

## 9. Open questions

1. **A or B.** Front of House is additive and reuses what exists; The Scrub is
   the stronger single device but adds a second pinned full-viewport element.
   Recommendation: A now, B as a later phase if the timeline should be the
   page's identity.
2. **The phase mapping.** §6 proposes one. Is `DISCOVER → skills` right, or
   should the acts map to something else entirely — for example the three
   `MIXER_DATA` groups plus a prologue and coda?
3. **The spine's axis.** Rotating the ruler to vertical is the move that makes
   it structural. The cheaper alternative is a second, purpose-built vertical
   index that merely *matches* the ruler's type and ticks. Which is worth it?
4. **How loud is the annotation layer.** Full Selora specimen density
   (`BIS-001 / FRONTEND / 6 CH` on every section) or sparse — one code per act?
5. **Does the hero's dive survive?** A assumes yes, unchanged. If the owner
   wants the dive replaced rather than handed off from, that is a different
   document.
