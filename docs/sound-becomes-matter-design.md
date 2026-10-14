# Sound Becomes Matter

Status: design draft for review. Documentation only; no landing implementation changed.  
Target: Mac /Users/adityahimawan/Development/next-portfolio-blog, branch docs/arrangement.

## 1. Decision

Keep the existing DAW hero as the opening scene. Zoom once into a signal region, let its frame leave the viewport, then leave the device metaphor behind entirely. About and subsequent sections occupy an open editorial landscape. No persistent DAW shell, replacement screen contents, synth panels, knobs, screws, ruler, mixer, or transport after the handoff.

The camera is an unmoving viewpoint: no rotation, orbit, lateral camera travel, mouse-follow, or simulated walking. The opening zoom is object scaling about a fixed viewport center. Later depth comes from individual layers moving at unequal rates, not camera motion.

The signal is a transition metaphor, not a claim about actual playing audio. Contours are explicitly abstract artwork, not fabricated audio measurements or skill scores. This deliberately revises the earlier “no data, no motif” rule for this landing treatment only; data-bearing UI elsewhere keeps that rule. No microphone, audio analysis, autoplay, or sound dependency.

## 2. Visual storyboard

These are composition diagrams, not rendered screenshots. Rectangles denote viewport bounds, never visible UI panels. Names/copy below are editorial proposals, not verified biography.

### A — Existing hero, before handoff

```
+----------------------------------------------------------+
| existing navigation                                     |
|                                                          |
|               EXISTING DAW ARRANGEMENT                    |
|                [ focused signal region ]                 |
|                                                          |
+----------------------------------------------------------+
```

Keep recognizable hero composition. Remove the existing cross-screen travel during the replacement handoff. Establish the chosen region on the central axis before the zoom; do not pretend an off-center source can expand centrally without a visual discontinuity. If necessary, introduce a dedicated centered signal graphic over the hero during the opening hold rather than moving the camera.

### B — Signal exceeds its container

```
+----------------------------------------------------------+
|       |                                            |     |
|       |        ___      __       ____              |     |
|       |   ____/   \____/  \_____/    \____          |     |
|       |                                            |     |
|       |             edges move OUT                 |     |
+----------------------------------------------------------+
```

Source region grows around center. DAW chrome disappears outside viewport through scaling/clipping; it does not remain as a border. Use a dedicated SVG signal proxy rather than enlarging every hero text glyph. Match proxy bounds to measured source bounds on the first frame, then center its expansion. This short object translation is allowed; viewport/camera remains still. It must not become a sweeping scene pan.

### C — Waveform opens into space

```
+----------------------------------------------------------+
|            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~     FAR         |
|       ~~~~~~~~~~~~~~~                                    |
|                                                          |
|             Behind the interface.            CONTENT    |
|             Aditya Himawan                               |
|                                                          |
|   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~        NEAR        |
+----------------------------------------------------------+
```

A single waveform separates into three broad contours. Space opens between them; About appears in the negative space. No spectrum bars, glowing tunnel, particle cloud, or repeated equalizer pattern. Lines are sparse and disappear after the About exit.

### D — About reading plateau

```
+----------------------------------------------------------+
|   faint contour, upper edge                              |
|                                                          |
|   Behind the          [ optional approved portrait ]     |
|   interface.                                             |
|                                                          |
|   real biography      Start with the user.               |
|   from existing copy  Build the system.                  |
|                       Stay close to production.          |
|                                            curve below  |
+----------------------------------------------------------+
```

Typography and actual biography are primary. Portrait is optional and must use an approved existing asset; absent portrait means deliberate whitespace, not a stock placeholder. Lines never run across body text. Depth is clearest at edges; the reading area is still.

### E — Skills: Field / Experience: Trace

```
+----------------------------------------------------------+
|  Skills                                                  |
|    React           Next.js                               |
|           TypeScript           actual skill labels       |
|    grouped by practice, NOT orbiting or scored            |
|----------------------------------------------------------|
|  Experience                                              |
|     actual date -------- actual role                     |
|                          actual evidence                 |
+----------------------------------------------------------+
```

Keep current source order: About, Skills, Experience, Work, Contact. Do not reorder for a prettier metaphor. Skills use a clear typographic grid; headings drift only on entry. Experience uses a real chronological baseline. The timeline is informational, not a waveform stretched through the whole page.

### F — Work / Contact: Solid / Quiet

```
+----------------------------------------------------------+
|   Selected work                                          |
|      +----------------------+                            |
|      | real project preview |    title / real links       |
|      +----------------------+                            |
|             next surface enters with mild overlap        |
|----------------------------------------------------------|
|   Contact                                                |
|   simple readable ending; no moving decoration            |
+----------------------------------------------------------+
```

Project surfaces have visible boundaries because they represent actual work, not device screens. Contact is fully still. Motion density decreases toward the end.

## 3. Visual language — typography becomes the foreground

### Reference boundary

Reference: <https://selora-template.modulify.website/>. Text extraction confirms contrasting short display statements, long manifesto passages, repeated phrases, image captions and quieter explanatory copy. Examples include “ART IS A CONTROLLED INTERRUPTION” and “LINES BECOME SIGNALS.” Borrow the editorial contrast and pacing, not its copy, branding or layout. Computed font styles and actual scroll motion have not been verified; the values below are original proposals, not measurements of Selora.

### Signature composition: SIGNAL / HUMAN

The earlier storyboard's “Behind the interface.” heading remains the semantic About heading. Add a separate, decorative typographic transition: SIGNAL becomes HUMAN by a brief overlapping crossfade, not letter-by-letter scrambling. These are working art-direction words, not final approved copy. Neither word remains behind biography. The stunning moment comes from a large scale contrast followed by silence, not more simultaneous effects.

```
BRIDGE .35                BRIDGE .55                BRIDGE .80
+-------------------+     +-------------------+     +-------------------+
|  departing device |     | contour at edge   |     | Behind the        |
|                   |     |                   |     | interface.        |
| S I G N A L       |     | H U M A N         |     |                   |
|   signal thread   |     |      [portrait]   |     | actual biography  |
|                   |     | title begins     |     | readable, still   |
+-------------------+     +-------------------+     +-------------------+
```

Display words sit behind an optional portrait silhouette but in front of far contours. Use ordinary rectangular portrait cropping unless an existing approved cutout exists; no AI masking dependency. Without portrait, offset word and heading on the grid. Do not cover text with a portrait to force the same composition.

### Type score

Use the project's existing font variables, verified before coding. Suggested family roles: Syne for monumental statements, Space Grotesk for structured headings, Geist for biography, Geist Mono only for real dates/captions. No new font downloads; do not animate font-weight or tracking per frame.

| Role                   | Starting target                                              | Treatment                                                                                     |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Decorative bridge word | clamp(5rem, 17vw, 17rem), .84 line height, -.055em tracking  | Single line in artwork plane; fit actual word to width; cropping only decorative outer edges. |
| Semantic About h2      | clamp(2.75rem, 8vw, 8rem), .94 line height, -.045em tracking | Two or three intentional desktop lines, natural mobile wrap.                                  |
| Practice statement     | clamp(1.75rem, 4vw, 4rem), 1.08 line height                  | Reuse actual About statements; one readable phrase per line.                                  |
| Biography              | clamp(1rem, 1.15vw, 1.125rem), 1.65 line height              | 46–60ch, always full contrast and still.                                                      |
| Real caption/date      | .75–.875rem, 1.4 line height                                 | No invented chapter coordinates, catalogue numbers or filler labels.                          |


Desktop composition uses a 12-column grid: title columns 1–8, optional portrait 8–12, biography 2–6, existing practice statements 8–12. These are separate vertical bands where necessary, not overlapping text boxes. At <=768px collapse to one column and natural reading order. Font loading must precede final measurement; text never waits invisibly for a web font.

### Motion score — replaces the heading timing in section 4

| Local bridge progress | Typography                                                           | Other motion                             |
| --------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| .15–.35               | SIGNAL enters as decorative word; max 32px travel, no text splitting | Device exits; near/middle contours held. |
| .35–.48               | SIGNAL holds; fully legible                                          | Signal opens into far contour.           |
| .48–.58               | SIGNAL crossfades to HUMAN over the same measured bounds             | Remaining contours separate; title held. |
| .58–.70               | HUMAN holds, optional portrait already still                         | Contours settle by .65.                  |
| .70–.80               | HUMAN fades out; semantic title rises at most 32px to rest           | Contours still.                          |
| .80–1                 | Only real heading and biography remain; no decorative word           | Reading plateau, everything still.       |

This refines section 4: semantic heading now enters at .70–.80, not .42–.65. Biography is never opacity-scrubbed. The handoff must keep the decorative display behind it or above its flow region so no ghost word competes with reading.

At most four transform-animated layers at once, including decorative words, contours and heading. Opacity-only swaps may involve two word elements, but no extra moving title/portrait during contour separation. Decorative words are bounded, clipped locally and pointer-events:none. No full-screen marquee, perpetual loop, letter explosion, spinning type or direction reversal.

### Later chapter typography — direction only

Skills: one large “Built with intention.” working headline above the real grouped skills. Use weight and whitespace, not skill-name clouds or artificial score differences.

Experience: large year typography sourced from actual job dates, with role/evidence at normal reading size. Never invent a year or make chronology inaccessible through cropping.

Work: alternate large project title and actual preview; one foreground/background pair, no repeated carousel within carousel. Links remain stationary and focusable.

Contact: one large, static invitation and existing real contact links. No encore animation. These later-section ideas remain outside the first implementation slice.

### Typography skeleton — add within existing MatterBridge

```tsx
{/* Decorative copy only. Semantic About h2 remains once in normal flow. */}
<div className={styles.typeStage} aria-hidden="true">
  <span data-matter-word="signal">SIGNAL</span>
  <span data-matter-word="human">HUMAN</span>
</div>
```

```css
.typeStage {
  position: absolute;
  inset: 0;
  display: none;
  place-items: center;
  overflow: clip;
  pointer-events: none;
}
.typeStage span {
  grid-area: 1 / 1;
  font-size: clamp(5rem, 17vw, 17rem);
  font-weight: 750;
  line-height: .84;
  letter-spacing: -.055em;
  white-space: nowrap;
}
.typeStage [data-matter-word='human'] { opacity: 0; }
@media (min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference) {
  .bridge[data-motion='ready'] .typeStage { display: grid; }
}
```

Mount typeStage inside the decorative sticky stage, positioned relative; not inside the biography. This skeleton adds no runtime controller: append these tweens to the same normalized one-unit timeline from section 7. Remove the original contour-only timing before applying the revised score. The exact source-proxy timeline still needs implementation.

```ts
// `timeline` already scoped to MatterBridge. Values are local progress units.
// Intro targets begin fully visible in static HTML; set styles only in GSAP context.
const signal = '[data-matter-word="signal"]'
const human = '[data-matter-word="human"]'
timeline
  .fromTo(signal, { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: .20, ease: 'none' }, .15)
  .to(signal, { opacity: 0, duration: .10, ease: 'none' }, .48)
  .to(human, { opacity: 1, duration: .10, ease: 'none' }, .48)
  .to(human, { opacity: 0, duration: .10, ease: 'none' }, .70)
  .fromTo('[data-matter-title]', { y: 32 },
    { y: 0, duration: .10, ease: 'none' }, .70)
```

The title is never hidden. Do not split body copy into spans or rely on low-contrast “unread” words. If later adding line masks for real headings, keep one semantic text node and aria-hidden visual clones; only enable masks after successful setup. Default scope intentionally skips splitting and masks.

### Art-direction acceptance

Capture .35, .48, .58, .70, .80 at 1440x900 and 1280x720: each should read as a deliberate poster, not an animation in a broken intermediate state. At .80 there must be no SIGNAL/HUMAN ghost under body text. Confirm title descenders are not clipped at 200% zoom; real content never cropped at any width. Check 4.5:1 normal text contrast and 3:1 large text contrast in both themes. Decorative contour opacity is not a substitute for text contrast. Repeat movement in reverse, confirm no sudden word pop or stranded line mask.

The typography skeleton remains illustrative and unexecuted. Approve working headlines before shipping them; retain real biography verbatim unless copy editing is separately approved.

### Palette and restraint

Reuse current theme tokens: --background, --foreground, --primary, --muted-foreground. Keep both light and dark themes; no forced dark interlude. Reuse installed display/body fonts and existing spacing conventions. Signal accent belongs to one contour only; other lines use low-intensity ink. Suggested starting opacity: far .10, middle .16, near .22; tune separately for theme contrast. Artwork is decorative, aria-hidden, pointer-events:none.

Use generous negative space, oversized but wrapping headings, narrow body measure (60ch ceiling), no framed content cards in About, no decorative machine metadata. One art-directed scene per section, not a reused panel template. Contours stop after About: subsequent chapters express the idea through hierarchy and composition, not repeated squiggles.

## 4. Scroll choreography

All numbers are initial design targets, not measured evidence. Progress is local normalized scroll progress, not elapsed seconds. Reverse scroll must reproduce identical frames.

Desktop bridge: outer section approximately 220svh, sticky stage 100svh, yielding approximately 120svh of active travel. This bridge replaces the current hero-to-Patch seam; it must not add another long pin after the existing 460svh hero sequence. Final total hero length must be chosen after measuring current behavior.

| Bridge progress | Beat         | Behavior                                                                                                             |
| --------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| 0–.15           | Recognize    | Hero holds; source signal is clear. No About text yet.                                                               |
| .15–.42         | Leave device | Signal proxy expands; hardware recedes and exits. No camera rotation.                                                |
| .42–.65         | Materialize  | SVG contours separate; SIGNAL crossfades to HUMAN. Semantic heading stays in flow, no entrance yet.                  |
| .65–.80         | Arrive       | Contours settle by .65; HUMAN exits and semantic heading enters at .70–.80 by at most 32px. Biography remains still. |
| .80–1           | Read         | Text, portrait and contours hold still. Native page flow continues without exit jump.                                |

Read plateau is not a timer. Users control time; short viewport or long biography must increase flow height, not clip text or accelerate it. About body stays in normal document flow, outside the sticky decorative stage. The decorative stage may overlap its introduction, but never become the only container of content.

Parallax ceilings, per section traversal:

| Layer                | Max travel | Rule                                            |
| -------------------- | ---------- | ----------------------------------------------- |
| Far contour          | 16px       | Decorative edge only.                           |
| Middle contour       | 40px       | Same direction as far, different rate.          |
| Near contour         | 80px       | Below/above text-safe area; clipped to artwork. |
| Display heading      | 32px       | Entry only; settles before reading.             |
| Biography / controls | 0px        | Never scrub body text.                          |
| Optional portrait    | 24px       | No zoomed face or cropping essential details.   |
| Project preview      | 40px       | No overlapping focused links.                   |

Use smoothstep for bounded entries, linear local progress for depth within movement windows. No spring bounce, camera overshoot, blur pulses, velocity skew, or opacity flicker. GSAP scrub target .35 seconds is a tuning candidate; avoid stacking this lag over existing Lenis smoothing if it feels detached. Default to existing engine smoothing, add no second smoother.

## 5. Repository integration

Observed current composition: Rack01LandingPage renders ArrangementHero, SignalDivider, Skills, CableDivider, Experience, Work, Contact. About is integrated inside ArrangementHero through the existing Patch seam; it is not currently a sibling section. PATCH_MODULE_LIST derives biography from ABOUT_TRACKS and practice groups from MIXER_DATA. Preserve source data, not Patch hardware presentation.

Before implementation, inspect ArrangementHero and its hook in full, plus useRackAnimations and active runtime flags. The chapter orchestrator exists but may not be the active owner. Do not connect a new ScrollTrigger to an assumed inactive path.


Proposed minimal ownership:

```
features/landing-page/
  components/matter/
    matter-bridge.tsx       decorative sticky signal + semantic About
    matter.module.css      layout, themes, fallback, safe text zone
    use-matter-motion.ts   one scoped GSAP setup and cleanup
  rack-01/rack-01.tsx       composition integration
```

Start with these three files. Keep interpolation helpers inside the hook until tests justify extracting one. No new global motion framework, scene registry, dependency, WebGL canvas, audio engine, or parallel Lenis instance.

Delete/retire existing Patch seam only after content parity is verified. Remove old trigger ownership, read-overflow translations, duplicate About IDs, obsolete inert toggles and viewport compensation for the removed seam. Do not delete data consumed elsewhere. Root design.md is an archive-page specification; preserve it. This draft supersedes neither older docs nor production until approved.

## 6. Skeleton: layout contract

Illustrative TypeScript/CSS, not runnable production implementation. Existing content and exact imports must be wired after repository inspection. Do not copy as a complete patch.

```tsx
'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'
import styles from './matter.module.css'
import { useMatterMotion } from './use-matter-motion'

// `about` contains the existing, real biography as semantic HTML.
// Parent must remove the old seam before mounting this replacement.
export function MatterBridge({ about }: { about: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  useMatterMotion(root)

  return (
    <section ref={root} className={styles.bridge}>
      <div className={styles.stage} aria-hidden="true">
        ![svg](data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTIwMCA4MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIHNsaWNlIiB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiPgogICAgICAgICAgPHBhdGggZGF0YS1jb250b3VyPSJmYXIiIGQ9Ik0tMTAwIDE4MCBDMjAwIDEwMCA0MDAgMjgwIDY1MCAxODAgUzEwMDAgMTAwIDEzMDAgMTgwIiAvPgogICAgICAgICAgPHBhdGggZGF0YS1jb250b3VyPSJtaWRkbGUiIGQ9Ik0tMTAwIDQwMCBDMjAwIDMyMCA0MDAgNTAwIDY1MCA0MDAgUzEwMDAgMzIwIDEzMDAgNDAwIiAvPgogICAgICAgICAgPHBhdGggZGF0YS1jb250b3VyPSJuZWFyIiBkPSJNLTEwMCA2NzAgQzIwMCA1OTAgNDAwIDc3MCA2NTAgNjcwIFMxMDAwIDU5MCAxMzAwIDY3MCIgLz4KICAgICAgICA8L3N2Zz4=)
      </div>
      <section id="about" aria-labelledby="about-title" className={styles.about}>
        <h2 id="about-title" data-matter-title>Behind the interface.</h2>
        {about}
      </section>
    </section>
  )
}
```

These SVG paths show final contours only. They are concept geometry, not sampled audio. To morph the waveform, author initial paths with identical SVG command topology and interpolate their numeric coordinates. GSAP core can tween a progress number; a small numeric interpolation function updates `d`. Do not assume MorphSVGPlugin is installed or add it for three paths. A simpler approved alternative is aligned paths separating through transforms without literal path morphing.

```css
.bridge { position: relative; isolation: isolate; }
.stage { display: none; pointer-events: none; overflow: hidden; }
.about { position: relative; padding: clamp(3rem, 8vw, 8rem) 1.5rem; }
.about h2 { max-width: 12ch; font-size: clamp(2.5rem, 7vw, 7rem); }
.about p { max-width: 60ch; }
.stage svg { width: 100%; height: 100%; fill: none; }
.stage path { stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke; }

/* Enable only AFTER async motion setup succeeds. Base rendering remains readable. */
@media (min-width: 769px) and (prefers-reduced-motion: no-preference) {
  .bridge[data-motion='ready'] .stage {
    display: block;
    position: sticky;
    top: 0;
    height: 100svh;
    margin-bottom: -100svh;
    z-index: -1;
  }
  .bridge[data-motion='ready'] .about { padding-top: 115svh; }
}
```

Final SVG geometry must protect a center text-safe zone; the skeleton's middle path crosses center and therefore must move out before body copy arrives. This is an explicit production acceptance requirement, not final artwork. Keep section height intrinsic; do not impose 220svh if content requires more.

## 7. Skeleton: scoped motion lifecycle

```ts
import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useMatterMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let disposed = false
    let teardown = () => {}

    async function setup() {
      const element = root.current
      if (!element || !matchMedia(
        '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
      ).matches) return

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'),
      ])
      if (disposed || root.current !== element) return
      gsap.registerPlugin(ScrollTrigger)

      const media = gsap.matchMedia()
      teardown = () => media.revert()
      media.add(
        '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
        () => {
          element.dataset.motion = 'ready'
          const context = gsap.context(() => {
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: element,
                start: 'top top',
                end: () => `+=${innerHeight * 1.2}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            // Skeleton demonstrates layer travel, not full hero handoff.
            // Each tween occupies .65 timeline units, then holds to 1.
            timeline
              .fromTo('[data-contour="far"]', { y: 8 }, { y: -8, duration: .65, ease: 'none' }, 0)
              .fromTo('[data-contour="middle"]', { y: 20 }, { y: -20, duration: .65, ease: 'none' }, 0)
              .fromTo('[data-contour="near"]', { y: 40 }, { y: -40, duration: .65, ease: 'none' }, 0)
              .to({}, { duration: .35 }, .65)
          }, element)
          // Refresh only after coordinated layout/font/image readiness in owner.
          return () => {
            context.revert()
            delete element.dataset.motion
          }
        },
      )
    }

    void setup().catch((error) => {
      teardown()
      // Native layout remains visible; no loading gate waits on animation.
      console.error('Matter motion setup failed', error)
    })
    return () => { disposed = true; teardown() }
  }, [root])
}
```

Integrate into the existing owner rather than blindly mounting a second controller. If the current engine owns gsap.matchMedia/context, use its lifecycle and return a chapter cleanup instead. The skeleton intentionally does not implement source measurement, signal proxy handoff, morph geometry, portrait motion or anchor alignment. Those are defined by this spec, not claimed complete by this example.

## 8. Accessibility and responsive contract

- Semantic content in source order, visible without JS or failed imports. No aria-live announcements for decorative scroll changes.
- Native scrolling, keyboard PageDown/Space, browser find and text selection work. No wheel interception or scroll locking.
- About anchor lands on heading, not top of a long animation runway. Skip link targets #about, respects fixed navigation clearance using scroll-margin-top.
- Never make the source hero or its parent inert if it contains the replacement About. No focusable controls in decorative copies.
- At <=768px, reduced motion, or insufficient height (<700px initial target), use normal stacked layout; no pinning, zoom, parallax, hidden text or blank runway. Add the same height condition to both CSS and JS in implementation.
- Portrait dimensions reserved. No portrait asset is required to render the layout. Long titles wrap at 320px; 200% zoom remains readable.
- Theme/responsive changes revert old styles/triggers before rebuilding. Resize during handoff must not strand content. Changing reduced-motion preference while mounted must restore native flow.

## 9. Performance and operational limits

At most three moving decorative contour layers plus one entering title. No per-frame React state, layout reads, filter blur or animated box-shadow. Measure source rect and target viewport on refresh only. Three SVG paths may animate their d only during the short morph; prefer transforms otherwise. Do not permanently will-change every section. Existing Lenis remains sole smoother and existing ticker remains sole clock. No new packages.

Targets, not test results: no animation-induced layout shift; smooth 60Hz desktop playback on the target Mac; investigate repeated >16.7ms frames and any long tasks >50ms during transition. Collect browser performance trace before claiming these targets met.

## 10. Verification / acceptance

1. Capture current hero, About, all copy/links, branch HEAD and active runtime owner before edits.
2. Unit-test deterministic frame boundaries: p=0,.15,.42,.65,.8,1; clamped out-of-range progress; finite transforms with zero-size geometry; exact reverse replay.
3. Browser checkpoints at those same progress values, plus continuous forward/reverse recording. Still screenshots alone cannot prove smoothness.
4. Test 1440x900, 1280x720, 390x844, 320x568, short desktop, both themes, 200% zoom.
5. Confirm #about via direct URL and skip link; keyboard navigation, focus visibility, readable body, no contour/text collision.
6. Toggle reduced motion during import and mid-scroll. Navigate away during import, remount, resize across breakpoint. No orphan triggers, duplicate ticker or stale inline styles.
7. Disable JS / block GSAP import: all biography, skills, experience, work and contact remain reachable, no blank pinned scene.
8. Verify current data parity and no duplicate IDs. No invented roles, dates, proficiency scores or project screenshots.
9. Run existing affected tests, targeted lint, real running-service acceptance. Report unrelated existing failures separately.
10. Record performance trace; no success claim from visual intuition alone.

## 11. Agent implementation contract — authoritative over illustrative skeletons

This section pins the design down without supplying a whole application patch. Follow these boundaries; do not substitute a DAW screen-content slideshow, zoom tunnel, card stack, particle field or perpetual marquee. Sections 6–7 are layout/lifecycle illustrations, not a second implementation to mount alongside this contract.


### Ownership and exact files

Confirmed from the current Mac tree: `components/arrangement/arrangement-hero.tsx` mounts PatchPanel and calls useArrangementHero plus useHeroDockVisibility. `rack-01/use-rack-animations.ts` creates Lenis and its GSAP ticker. That is the current smooth-scroll owner; do not instantiate another Lenis.

| File under features/landing-page                   | Agent action                                                                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| components/arrangement/arrangement-hero.tsx        | Keep DAW content; retire Patch seam rendering and hand off its actual source region. Update dock ownership rather than passing a removed seam ref blindly. |
| components/arrangement/use-arrangement-hero.ts     | Inspect full hook before edits; remove only superseded seam/zoom writers. Preserve boot, genuine data and useful hero behavior.                            |
| components/arrangement/use-hero-dock-visibility.ts | Audit seam dependency; provide valid About boundary after extraction.                                                                                      |
| components/matter/matter-frame.ts                  | New pure numeric choreography below; no DOM, React, events or timers.                                                                                      |
| components/matter/matter-bridge.tsx                | Semantic About, decorative SVG and SIGNAL/HUMAN words. Render biography from existing ABOUT_TRACKS, never duplicate id=about.                              |
| components/matter/matter.module.css                | Theme, text-safe zone, intrinsic flow layout, responsive readiness gate.                                                                                   |
| components/matter/use-matter-motion.ts             | Scoped measurement and one ScrollTrigger, numeric frame rendering, cleanup; no ticker or smoother.                                                         |
| rack-01/rack-01.tsx                                | Render extracted About immediately after hero; remove about selection state only if no remaining consumer needs it.                                        |
| rack-01/use-rack-animations.ts                     | Preserve shared Lenis owner; exclude Matter title from generic heading reveals. Leave later chapters unchanged in first slice.                             |

Test file: `tests/matter-frame.test.ts`. Four new production files are justified here because the pure choreography is the explicit testable contract. No scene framework or generic animation registry.

### Numeric frame contract

The source proxy grows about its own center, moving its center into viewport center. This is object motion, not camera travel. Coordinate geometry is expressed in the decorative stage's local CSS pixels, measured on refresh, never read in renderFrame. Uniform scale may leave unused space for a mismatched source aspect ratio; use a dedicated full-stage signal/background layer to finish the handoff rather than stretching the source nonuniformly.

The following block is valid JavaScript as well as TypeScript. It is the reference for phase math; the agent may add explicit TypeScript types without changing behavior. Nonfinite inputs normalize safely. The scale ceiling avoids pathological tiny-region zoom; it is an intentional limit, not a claim that every source can fill the screen at 8x.

```js
// BEGIN MATTER_FRAME
export function matterFrame(progress, geometry) {
  const finite = (v, fallback) => Number.isFinite(v) ? v : fallback;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const p = clamp(finite(progress, 0), 0, 1);
  const phase = (a, b) => {
    const t = clamp((p - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const vw = Math.max(1, finite(geometry.viewportWidth, 1));
  const vh = Math.max(1, finite(geometry.viewportHeight, 1));
  const sw = Math.max(1, finite(geometry.sourceWidth, 1));
  const sh = Math.max(1, finite(geometry.sourceHeight, 1));
  const sourceX = finite(geometry.sourceX, 0);
  const sourceY = finite(geometry.sourceY, 0);
  const targetScale = clamp(Math.max(vw / sw, vh / sh), 1, 8);
  const depart = phase(.15, .42);
  const spread = phase(.42, .65);
  const signalIn = phase(.15, .35);
  const swap = phase(.48, .58);
  const arrive = phase(.70, .80);
  return {
    progress: p,
    sourceScale: 1 + (targetScale - 1) * depart,
    sourceX: (vw / 2 - (sourceX + sw / 2)) * depart,
    sourceY: (vh / 2 - (sourceY + sh / 2)) * depart,
    deviceOpacity: 1 - depart,
    sourceOpacity: 1 - spread,
    farY: 8 - 16 * spread,
    middleY: 20 - 40 * spread,
    nearY: 40 - 80 * spread,
    signalY: 32 * (1 - signalIn),
    signalOpacity: signalIn * (1 - swap),
    humanOpacity: swap * (1 - arrive),
    titleY: 32 * (1 - arrive),
    reading: p >= .80,
  };
}
// END MATTER_FRAME
```

Final contour positions must be authored outside the biography-safe area before applying these small offsets. Frame math does not move an SVG center path hundreds of pixels out of text. During .42–.65 use either three transform-separated matching paths or numeric path interpolation, not both. Default to transform separation; literal morphing is optional only after visual review.

### Render bindings, not another timeline

Use one ScrollTrigger `onUpdate` to call matterFrame. Setters are created once after querying/validating elements. Never combine frame setters with the earlier `.fromTo()` timeline on the same targets. `device` must select the outgoing hero visual content, not a parent holding semantic About or focused links. Decorative source proxy contains no copied interactive controls.

```ts
// Illustrative binding inside the scoped setup; frame/node acquisition precedes this.
const write = {
  sourceX: gsap.quickSetter(sourceProxy, 'x', 'px'),
  sourceY: gsap.quickSetter(sourceProxy, 'y', 'px'),
  sourceScale: gsap.quickSetter(sourceProxy, 'scale'),
  sourceOpacity: gsap.quickSetter(sourceProxy, 'opacity'),
  deviceOpacity: gsap.quickSetter(device, 'opacity'),
  farY: gsap.quickSetter(far, 'y', 'px'),
  middleY: gsap.quickSetter(middle, 'y', 'px'),
  nearY: gsap.quickSetter(near, 'y', 'px'),
  signalY: gsap.quickSetter(signalWord, 'y', 'px'),
  signalOpacity: gsap.quickSetter(signalWord, 'opacity'),
  humanOpacity: gsap.quickSetter(humanWord, 'opacity'),
  titleY: gsap.quickSetter(title, 'y', 'px'),
};
function renderFrame(frame: ReturnType<typeof matterFrame>) {
  for (const key of Object.keys(write) as Array<keyof typeof write>) {
    write[key](frame[key]);
  }
}
```

Missing required node means abort setup, revert changes and leave native flow visible. No `querySelector(...)!` assertion. Set sourceProxy position/size from source rect relative to stage rect once; CSS `transform-origin: 50% 50%`. Ensure onRefresh measurement resets outgoing transforms before reading the source, then reapplies current progress; otherwise reverse/resize geometry drifts.

### Responsive/layout corrections to earlier skeletons

Use the SAME query everywhere: `(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)`. Add it to sections 6–7 when adopting those snippets. Native markup is baseline. Remove the early `matchMedia(...).matches` return from section 7: create the responsive watcher even when currently disabled, so widening the viewport or disabling reduced motion can activate it later. Do not fetch animation dependencies for currently disabled modes; import inside the responsive activation path, cancel each activation independently.

The one local bridge progress range ends at the actual measured reading-arrival point. Do not ship guessed `innerHeight * 1.2` or padding-top:115svh as geometry. Measure the semantic title's normal-flow arrival, then allocate space so p=.80 places it inside the visible reading band. The sticky artwork's containing block must last at least to p=1; biography may make it longer. Refresh after reserved image/font readiness and when layout changes; coalesce refresh, never per frame. Desktop runway disappears completely when disabled.

QuickSetter changes need explicit restoration if GSAP context does not capture their writes. Snapshot inline style attributes of owned targets at activation, kill owned trigger on teardown, restore snapshots, remove readiness attribute. Never call ScrollTrigger.killAll. Handle errors after partial setup through the same cleanup path. Changing preferences or navigating away during imports invalidates that activation; no late writer may attach to detached nodes.

Native #about lands directly on the real heading with scroll-margin-top. No progress-seeking animation is required to read content. Keyboard focus must never enter an invisible outgoing device: hide decorative proxy only, leave original navigation accessible until it exits ordinary flow, or transfer focus safely when explicitly navigating. Do not make all hero content inert automatically.

### Runnable choreography check / TDD seed

Save this as a temporary Node .mjs check during design review, or translate into the existing Jest test file during implementation. Test assertions below exercise the reference function, not the rendered landing page.

```js
// BEGIN MATTER_CHECK
import assert from 'node:assert/strict';
const geometry = {
  viewportWidth: 1440, viewportHeight: 900,
  sourceX: 400, sourceY: 350, sourceWidth: 640, sourceHeight: 100,
};
const opening = matterFrame(0, geometry);
assert.equal(opening.sourceScale, 1);
assert.equal(opening.deviceOpacity, 1);
assert.equal(opening.signalOpacity, 0);
assert.equal(matterFrame(.35, geometry).signalOpacity, 1);
assert.equal(matterFrame(.58, geometry).signalOpacity, 0);
assert.equal(matterFrame(.58, geometry).humanOpacity, 1);
assert.equal(matterFrame(.8, geometry).humanOpacity, 0);
assert.equal(matterFrame(.8, geometry).titleY, 0);
assert.equal(matterFrame(.8, geometry).reading, true);
assert.equal(matterFrame(1, geometry).sourceScale, 8);
assert.deepEqual(matterFrame(-1, geometry), opening);
assert.deepEqual(matterFrame(2, geometry), matterFrame(1, geometry));
for (const p of [0, .15, .35, .42, .48, .58, .65, .7, .8, 1, NaN]) {
  for (const value of Object.values(matterFrame(p, {}))) {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
  }
}
const checkpoints = [0, .15, .42, .65, .8, 1];
const forward = checkpoints.map(p => matterFrame(p, geometry));
const reverse = [...checkpoints].reverse().map(p => matterFrame(p, geometry)).reverse();
assert.deepEqual(forward, reverse);
console.log('matter-frame: all assertions passed');
// END MATTER_CHECK
```

### Ordered execution gates

- [ ] Preflight: read full hero/hook/dock runtime, capture baseline, use isolated worktree; preserve this untracked spec when preparing branch.
- [ ] Red: create tests/matter-frame.test.ts with boundary assertions; run `pnpm exec jest tests/matter-frame.test.ts --runInBand`, record real missing-module/behavior failure.
- [ ] Green: implement typed pure frame, rerun same command. No DOM/GSAP dependencies in math test.
- [ ] Static: extract existing biography into MatterBridge; verify no-JS/mobile content parity and unique About anchor before adding motion.
- [ ] Integrate: replace old seam ownership, wire proxy/source measurements, frame bindings and responsive cleanup. No duplicate smoother.
- [ ] Review: compare checkpoints against storyboard; record forward/reverse video and lifecycle/fallback acceptance from section 10.
- [ ] Verify: run affected Jest tests and `pnpm exec eslint` on changed TS/TSX files. Exercise real Mac dev server; record URL, viewport, commit HEAD and failures.
- [ ] Commit gate: review exact diff, stage only authored files, commit only with approval. Push and deploy remain separate approvals.

Do not count an illustrative code block as implementation evidence. Do not silently widen first-slice scope to later chapters. If measured source geometry cannot achieve the centered handoff cleanly, show that discrepancy and request art-direction adjustment rather than returning to shared DAW framing.

## 12. Scope and delivery

First implementation slice: hero-to-About handoff + editorial About only. Later sections described here define visual direction, not permission to redesign every section in the same patch. Preserve Skills/Experience/Work/Contact behavior until separately approved; explicitly accept a temporary stylistic seam or expand scope before coding.

No application code, commit, push, build or deployment accompanies this draft. After approval, create isolated implementation worktree and detailed plan. Root design.md remains untouched. Resolve final source-region choice through a rendered composition review; do not code against guessed source geometry.

## 13. Implementation record

Built. Committed as `c51346d` on `feat/sound-becomes-matter` — 16 files, +2240/−549, five of them new. What follows is what actually shipped, the numbers it shipped with, and every place it departs from the sections above. The departures are deliberate, and each one is a decision rather than a shortfall.

The sentence to read first: **the beats were right and the geometry was not.** `MATTER_PHASES` is unchanged from §11 to the decimal — not one boundary moved. What changed is what the numbers are *measured from*, and at 1440×900 that turned out to be the whole difference between a choreography and a choreography you can watch.

### 13.1 Files, as built

The feature landed as one commit, so this is the whole set — the four new production files §11 justified, one new test file, and the eleven existing files the handoff had to reach into.

| File | What it is |
| --- | --- |
| `features/landing-page/components/matter/matter-frame.ts` | **new** — `matterFrame`, `matterRunway`, `MATTER_PHASES`, `MATTER_HOLD`, the travel constants. Pure: no DOM, no GSAP, no timers, no reads. |
| `.../matter/matter-bridge.tsx` | **new** — the `<section>`, the decorative stage, the three contours, the source proxy, SIGNAL / HUMAN, the runway, and the editorial About panel carrying `#about`. |
| `.../matter/matter.module.css` | **new** — the stage, the reading panel, the typographic spread, the motion gate, the `--arr-hold` pull-up. |
| `.../matter/use-matter-motion.ts` | **new** — one `matchMedia` watcher, one ScrollTrigger, the measurement, the writers, the teardown. No ticker, no smoother. |
| `.../arrangement/arrangement-camera.ts` | `ARRANGEMENT_SCROLL_SVH` retimed 460 → 400; `cameraScale` made monotonic; the overshoot deleted. |
| `.../arrangement/arrangement.module.css` | `--arr-scroll: 400svh`, `+ var(--arr-hold)`, and the missing `max-height: 699px` fallback. |
| `.../arrangement/use-arrangement-hero.ts` | Publishes `--arr-source-final-x/y/w/h`; the camera states its own travel so the hold is not charged to the dive. |
| `.../arrangement/arrangement-hero.tsx` | The retired seam and the Patch handoff removed; `data-matter-device` on the outgoing track area. |
| `.../arrangement/arrangement-clip.tsx` | The clip, shared by the hero and the About panel. |
| `.../arrangement/use-hero-dock-visibility.ts` | The dock's boundary, re-pointed at the extracted About. |
| `.../patch/patch-timeline.ts` | The overshoot driver deleted; a latent TDZ in `splitProgress` fixed. |
| `features/landing-page/rack-01/rack-01.tsx` | Renders `<MatterBridge />` after the hero; `aboutIndex` state removed with the Patch. |
| `tests/matter-frame.test.ts` | **new** — 35 pure-function tests across 10 describes, no browser. |
| `tests/arrangement-camera.test.ts` | The zoom is asserted monotonic; the overshoot fixtures removed. |
| `tests/patch-scroll.test.ts` | The short-viewport CSS guard. Net one fewer than before — the overshoot assertion left with the overshoot. |
| `tests/arrangement-hero-markup.test.ts` | The retired seam's markers dropped. |

The four new production files are exactly the four §11 named, no more. `tests/matter-frame.test.ts` is the `MATTER_CHECK` block from §11, grown out.

### 13.2 The score, unchanged

Every phase boundary in §11 is the boundary that shipped. The table is the file's public surface, and it is the thing the whole bridge is timed on:

```ts
export const MATTER_PHASES = {
  depart:   [0.15, 0.42],  // the source grows, the outgoing device leaves
  spread:   [0.42, 0.65],  // the contours separate, the proxy gives way
  signalIn: [0.15, 0.35],  // SIGNAL arrives as a decorative word
  swap:     [0.48, 0.58],  // SIGNAL crossfades to HUMAN
  arrive:   [0.70, 0.80],  // HUMAN leaves, the semantic title rises
} as const
```

`matterFrame` is §11's reference function with three changes, and none of them is a beat:

- **`stageOpacity` is added** — a new output, not a retimed one. It is spent entirely across the hold (below) and is the reason the machine can dissolve into the stage's own ground without either of them moving. §11's block has no equivalent because §11 had no hold; the cut it could not explain is the one this field removes.
- **The literals became named constants.** `32` is `MATTER_TITLE_TRAVEL`; `8 / 20 / 40` are `MATTER_CONTOUR_TRAVEL`; `.80` is `MATTER_READING_AT = MATTER_PHASES.arrive[1]`. The arithmetic is identical — `8 - 16 * spread` is `MATTER_CONTOUR_TRAVEL.far * (1 - 2 * spread)` — but the ceilings are now readable as ceilings, and the reading plateau can no longer disagree with the phase that opens it.
- **The signature is typed**, as §11 permitted: `MatterGeometry`, `MatterFrame`, and a `MatterGeometryInput = Partial<MatterGeometry>` so the first call can happen before anything is laid out. Behaviour is unchanged.

The biography is still absent from the function, exactly as §11 argued: no opacity scrub, no body copy, only a `reading` boolean the stylesheet reads.

### 13.3 `matterRunway` — the panel waits for the words

This is the one function the design did not ask for, and it exists because the sketch's runway made the typography beats unwatchable.

The reading panel is opaque and sits above the artwork, so the moment its top edge climbs into the band the two words live in it starts covering them. That is by design — the panel is *supposed* to scroll over the artwork — which means the runway decides whether the typography beats are watchable at all. §6 and §11 both sized it as `max(readingHeight, viewportHeight)`, which only guarantees the panel is off screen on the first frame. Measured at 1440×900 that is 999px against a 1272px panel, and the panel crossed the word band at **p≈.33** — squarely inside SIGNAL's own beat, which the score has fully legible from `.35` to `.48`. The word was covered for the whole of its own window.

The panel's top edge starts one runway below the stage's top and climbs the bridge's whole travel, which is the runway plus the panel less the viewport it is pinned over. So its position at progress `p` is

```
runway - p * (runway + aboutHeight - viewportHeight)
```

and the runway that puts its first frame in the band exactly on SIGNAL's last legible one is the solution of that expression equalling `typeBandBottom` at `p = MATTER_PHASES.swap[0]` — the moment SIGNAL starts leaving, so being covered from then on costs nothing:

```ts
export function matterRunway(input: MatterRunwayInput): number {
  const viewportHeight = Math.max(1, finite(input.viewportHeight, 1))
  const readingHeight = Math.max(1, finite(input.readingHeight, 1))
  const aboutHeight = Math.max(0, finite(input.aboutHeight, 0))
  const typeBandBottom = Math.max(0, finite(input.typeBandBottom, 0))

  const swapFrom = MATTER_PHASES.swap[0]
  const climb = Math.max(0.05, 1 - swapFrom)
  const clearance =
    (typeBandBottom + swapFrom * (aboutHeight - viewportHeight)) / climb

  return Math.max(readingHeight, viewportHeight, Math.ceil(clearance))
}
```

Deriving it rather than tuning it is the point. The word band moves with the type scale, the panel moves with the biography, and both move with the viewport — a constant here would be correct at exactly one window size. All four inputs are read from the DOM on refresh (`signalWord`'s bottom edge against the stage's top, which is scroll-invariant because both rects move together), so the function is a statement about the rendered page rather than about the design's intent for it.

The two floors survive from §6. A runway shorter than the reading panel would put the panel's own content on screen during the opening beat, and one shorter than the viewport would let the panel's top edge show before `p=0`, over a machine the hero is still holding.

### 13.4 The handshake — `--arr-hold`

§4 asked for a bridge that does not add another long pin, and the first build honoured that literally: the bridge began after the hero's stage had already un-pinned. That was the defect, and its cause is exact — the hero's sticky stage unsticks at the same scroll its camera finishes on, so the machine was already sliding away on the frame the bridge's clock started. **A fade can only cross-dissolve between two things that are both still there**, and by then the machine was not. No amount of tuning the bridge can hide a cut; the hero has to hold.

So the bridge converts its takeover's length into pixels and publishes it, and the hero's section grows by it:

```ts
// use-matter-motion.ts — measured after the runway is written, because the
// runway is part of the section's height and the hold is a fraction of it.
const travel = Math.max(0, element.offsetHeight - viewportHeight)
const holdPx = Math.round(MATTER_HOLD * travel)
document.documentElement.style.setProperty('--arr-hold', `${holdPx}px`)
```

```css
/* arrangement.module.css */
.hero { height: calc(var(--arr-scroll) + var(--arr-hold, 0px)); }

/* matter.module.css — the pull-up has to absorb the hold as well as the stage */
.bridge[data-motion='ready'] { margin-top: calc(-100svh - var(--arr-hold, 0px)); }
```

Two things make this work and they are not interchangeable. Pulling the bridge up makes the two clocks *meet*, so no dead scroll is left to fall through. The hold keeps the machine pinned — and therefore still — while the takeover runs, so what the reader sees is one frame resolving rather than two frames swapping.

There is a third leg, and it is the one that would have broken silently. The hero's trigger used to end on `bottom bottom`, which *was* the camera's range while the section was exactly one viewport of stage plus the dive and nothing lengthened it. Growing the section by the hold would have stretched the camera by the same amount — retiming a dive `arrangement-camera.ts` was written and tested against, and moving the frame the handoff begins on. So the camera now states its own travel and reads the hold back off the element:

```ts
// use-arrangement-hero.ts — the hold is scroll the camera sits still through,
// not scroll it is charged for.
const cameraTravel = () => {
  const stageWrap = section.querySelector<HTMLElement>('[data-arr-stage]')
  const hold = parseFloat(getComputedStyle(section).getPropertyValue('--arr-hold')) || 0
  const stageHeight = stageWrap?.clientHeight ?? window.innerHeight
  return section.offsetHeight - stageHeight - hold
}
// … ScrollTrigger.create({ end: () => `+=${cameraTravel()}`, … })
```

Reading it back rather than assuming it is what keeps this correct whichever hook happens to run first: before the bridge has published anything the subtraction is zero, and the answer is the same either way. It is recomputed on refresh, so a viewport change cannot leave the two halves of the scroll disagreeing.

`MATTER_HOLD` is deliberately `MATTER_PHASES.depart[0]` and not a number of its own. The device's departure begins where the takeover ends, so the two beats meet at one boundary instead of two that would have to be kept in step. It is written to the document element because the two sections are siblings — a custom property set on the bridge cannot be read by a section above it — and it is removed on teardown, because leaving it behind would leave a stretch of scroll that nothing animates in, which is the exact defect it exists to remove.

### 13.5 The camera has one direction

§4 rules the effect out by name — *"No spring bounce, camera overshoot, blur pulses, velocity skew, or opacity flicker."* The build had a 2.5% half-sine bump at `[0.84, 0.91]`, on the argument that a camera arriving at its mark and stopping dead reads as a cross-fade. It was removed because the reader sees it as exactly what it is: the dive goes in, the bump takes it back out, and the handoff then zooms in again — three changes of direction where the story has only one. The scale is now monotonic by construction:

```ts
export function cameraScale(progress: number, zoomScale: number): number {
  const p = clamp01(progress)
  return mix(1, zoomScale, span(p, ARRANGEMENT_PHASES.zoom, ARRANGEMENT_PHASES.rail))
}
```

The bump was never really a camera idea anyway — it existed so the retired Patch panel's power-on act had something to spend, and that clock left with the seam. A test asserts the monotonicity, so nothing downstream of the rail may move the scale again.

**`ARRANGEMENT_SCROLL_SVH` is 400, not the 460 this was drawn against.** §4 anticipated the choice in as many words — *"Final total hero length must be chosen after measuring current behavior"* — and measuring it was worth doing. At 1440×900 the hero's own travel is the section height less the one viewport its stage is pinned for, so 460svh is 3240px of scroll and 400svh is 2700px. The bridge, meanwhile, has to be *longer* than it was, because its runway now holds the reading panel clear of the word band and that costs about 400px. Paying for it out of the hero is what keeps the total from growing: at 400 the hero gives back 540px, so the page is shorter than it was *and* the words get their window. 400 is also the floor both tests declare, which makes it the shortest the hero may be without retiming the five phases themselves.

### 13.6 Corrections to the numbers above

- **The bridge's outer section is not a fixed 220svh.** §4's figure was a sketch, not a measurement — at 1440×900 it would be 1980px, which is neither the panel (1272px) nor what shipped. The outer section is `runway + the About panel`, both measured, and it comes to 1407 + 1272 = **2679px ≈ 298svh**. The runway is what the words cost.
- **The runway is not "one viewport", and §6's `max(readingHeight, viewportHeight)` is not enough.** At 1440×900 it is **1407px**, derived by §13.3. That is the +408px the bridge grew by.
- **The hero's total is 400svh / 2700px of travel at 1440×900**, not 460svh / 3240px. See §13.5.
- **The hold is 267px at 1440×900** — `MATTER_HOLD` × the bridge's travel, `0.15 × 1779`, which is 267px rounded. It is a fraction of a measured number, not a constant.
- **The bridge's travel is 1779px, not 1371px.** The runway's growth is what the extra scroll buys.
- **The panel crosses the word band at p=0.480** — exactly `MATTER_PHASES.swap[0]`, which is the derivation landing where it was solved to land rather than near it.

Measured at 1440×900, before and after:

| | before | after |
| --- | --- | --- |
| `--matter-runway` | 999px | **1407px** |
| bridge travel | 1371px | 1779px |
| hold (`--arr-hold`) | — | 267px |
| SIGNAL fully legible from | never | p=.337 (3300px) |
| readable SIGNAL window | 0px on the word band | **231px** |
| scroll to reach SIGNAL | 3720px | 3323px |
| scroll to p=1 | 4611px | **4479px** |
| page height | 14664px | **14532px** |

The structural invariants hold and are asserted: the bridge's top edge lands exactly on the camera's last frame (`bridgeTop − cameraEnd = 0`), and the hero's un-pin sits exactly one hold above the bridge's start (`heroUnpin − bridgeTop = 267px = 0.15 × travel`).

### 13.7 The missing third fallback

Found while verifying the fallbacks, and fixed. It is not part of the handoff's design, so it is recorded here rather than left to be rediscovered.

§8 and §11 both demand the *same* three-part condition in both CSS and JS: `(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)`. The stylesheet had blocks for the width half and the reduced-motion half, and nothing for the height half. So a 1440×640 window got the pin with none of the motion: the hook declined to activate because `min-height: 700px` failed, but nothing told the stylesheet, so `position: sticky` stayed on and the arrangement sat frozen at the top of a 400svh section. Measured, the reader scrolled ~1920px past a picture that never changed — the "blank runway" §8 rules out by name.

```css
/* arrangement.module.css — the exact complement of the hook's min-height: 700px,
   so the CSS and the JS agree about which viewports get the motion. */
@media (max-height: 699px) {
  .hero { height: auto; }
  .stage { position: static; height: auto; }
}
```

A CSS guard in `tests/patch-scroll.test.ts` now reads this block and asserts both declarations, so it cannot be dropped again. Verified: the document shrinks 1940px and the stage becomes `position: static`.

### 13.8 Gates

| Gate | Result |
| --- | --- |
| `pnpm exec jest` | **13 suites, 232 tests, all pass** — 12 suites / 198 tests at the previous HEAD |
| `tests/matter-frame.test.ts` | 35 tests, 10 describes, no browser — `matterFrame` boundaries, monotonicity, reverse-pass identity, degenerate input, and 6 for `matterRunway` |
| `pnpm exec tsc --noEmit` | clean |
| `pnpm exec eslint` (changed TS/TSX only) | clean |
| `next build` | 40/40 routes |
| CSS census | both `400svh` and the `max-height: 699px` block present in the built stylesheet |
| Fallbacks | one `#about`, visible, `--arr-hold` unset, stage `display: none` at 390×844, 1440×640, and reduced motion |
| Production HTML | every hook resolved — 14 markers in the bridge (three contours, two words) plus `data-matter-device` on the hero's track area |

The browser acceptance §10 asks for was run at 1440×900 and 1280×720 by probe, plus the fallback viewports above. Continuous forward/reverse video and the performance trace were not recorded; the unit suite covers the reverse pass analytically instead.

### 13.9 Not done

- **`MATTER_PHASES` was deliberately not retimed.** The beats were right; the implementation was not delivering them. SIGNAL still fades in within the box's own zoom — `signalIn` `.15`–`.35`, inside `depart` `.15`–`.42` — which is what "the signal shows while the box zooms into About" asks for; it just does it where the reader can now see it.
- **The later chapters are untouched**, per §12. Skills, Experience, Work and Contact still carry their existing behavior and their existing typographic register; §3's direction for them is still a direction.
- **No push, no deploy.** The branch is `feat/sound-becomes-matter`; the commit is local.
- **Pre-existing and left alone:** a top-level `return` in `app/layout.tsx:177`, and 287 repo-wide eslint problems in `features/music/*` and elsewhere. Neither is this slice's, and neither was touched.
