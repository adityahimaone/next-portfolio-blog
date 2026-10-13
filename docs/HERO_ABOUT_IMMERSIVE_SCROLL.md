# Hero + About Immersive Scroll

## Status

Approved concept. This document is the implementation contract. Source code remains unchanged until this contract is accepted.

## Design Read

Reading this as: a creative engineer portfolio for design-conscious technical clients, using a dark DAW console language and cinematic scroll choreography.

Dials: `ENERGY 3 / RHYTHM 3 / MOTION 3`

Identity motif: **the signal path**. The user scans the arrangement, locks onto the profile clip, then enters that clip to read About.

## Recommendation

Keep the existing Hero concept and existing measured camera dive. Upgrade the transition into a controlled **profile-clip portal**.

Do not zoom out during Hero → About. Zoom-out breaks spatial continuity. Use one restrained camera overshoot after the profile clip fills the frame.

---

## Narrative

1. **Boot the rack**: slat preloader establishes the console language.
2. **Scan the session**: the Hero arrangement powers on and the playhead travels.
3. **Lock onto PROFILE**: supporting tracks recede; the profile clip becomes the focal point.
4. **Enter the clip**: the profile clip expands into the About frame.
5. **Mix the signal**: About presents Interaction, Systems, Production as real timeline channels.
6. **Route onward**: the final About channel hands off to Skills and Work.

---

## Existing architecture to preserve

- Homepage entry: `app/page.tsx`
- Landing composition: `features/landing-page/rack-01/rack-01.tsx`
- Hero: `features/landing-page/components/arrangement/arrangement-hero.tsx`
- Hero camera math: `features/landing-page/components/arrangement/arrangement-camera.ts`
- Hero styles: `features/landing-page/components/arrangement/arrangement.module.css`
- Scroll orchestration: `features/landing-page/chapters/use-landing-chapters.ts`
- Hero chapter: `features/landing-page/chapters/hero/hero-chapter.ts`
- About chapter: `features/landing-page/chapters/about/about-chapter.ts`
- About content: `features/landing-page/rack-01/section-about.tsx`
- Existing dependencies: GSAP, ScrollTrigger, Lenis, React, Tailwind CSS, CSS Modules

No new dependency is required.

---

# Implementation

## 1. Preloader component

Create:

```text
components/ui/slat-count-preloader.tsx
```

Use the supplied `SlatCountPreloader` component as the base. Keep its pure helpers and scoped `.scp-*` CSS unchanged. Change only the default copy and integration behavior below.

### Required defaults

```tsx
sequence={['003', '002', '001', 'READY']}
preset="ink"
palette={{
  background: '#14171a',
  ink: '#eee9df',
  accent: '#ff5a1f',
}}
label="RACK 01 / SESSION BOOT"
caption="Routing interface, systems and production notes."
exit="blinds"
hud
interactive={false}
```

### Copy rules

Do not use fake network language such as `Downloading`, `Fetching`, or fabricated percentage claims. This is a visual boot sequence, not a report of network progress.

### Reduced motion

The component must honor `prefers-reduced-motion`. On reduced motion, keep the final frame readable, shorten the exit, and avoid slat travel.

### Accessibility

- `role="progressbar"`
- `aria-valuenow` remains present
- visible `Skip intro` control
- skip control works with Enter and Space
- visible focus ring
- no pointer-only requirement

---

## 2. One-run landing gate

Create:

```text
features/landing-page/components/landing-gate.tsx
```

```tsx
'use client'

import { useEffect, useState } from 'react'
import SlatCountPreloader from '@/components/ui/slat-count-preloader'

const SESSION_KEY = 'aditya-landing-session-boot'

export function LandingGate({ children }: { children: React.ReactNode }) {
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') return
      setShowGate(true)
    } catch {
      setShowGate(false)
    }
  }, [])

  const complete = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Storage can be unavailable. The page remains usable.
    }
    setShowGate(false)
  }

  return (
    <>
      {children}
      {showGate ? (
        <div className="fixed inset-0 z-[100]">
          <SlatCountPreloader
            sequence={['003', '002', '001', 'READY']}
            preset="ink"
            palette={{
              background: '#14171a',
              ink: '#eee9df',
              accent: '#ff5a1f',
            }}
            label="RACK 01 / SESSION BOOT"
            caption="Routing interface, systems and production notes."
            exit="blinds"
            interactive={false}
            onComplete={complete}
          />
        </div>
      ) : null}
    </>
  )
}
```

### Mounting

Wrap the existing landing tree in `features/landing-page/views/landing-page.tsx`:

```tsx
import { LandingGate } from '../components/landing-gate'

export default function LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  return (
    <LandingGate>
      <Rack01LandingPage archiveRepos={archiveRepos} />
    </LandingGate>
  )
}
```

The page stays rendered underneath the gate. This avoids layout shift and lets the Hero be ready when the blinds leave.

---

## 3. Scroll choreography

### Camera phases

```ts
export const IMMERSIVE_PHASES = {
  overview: 0,
  scan: 0.24,
  lock: 0.48,
  dive: 0.7,
  reveal: 0.84,
  read: 1,
} as const
```

### Motion contract

| Phase | Camera | Supporting lanes | Profile clip | About |
| --- | --- | --- | --- | --- |
| Overview | scale `1` | full contrast | normal | hidden |
| Scan | shallow lateral travel | opacity `1 → .72` | normal | hidden |
| Lock | center on profile | opacity `.72 → .16` | brightness `1 → 1.08` | faint |
| Dive | scale `1 → derived fit` | scale `.98`, opacity `.16` | focal | clip opens |
| Reveal | derived fit | hidden | stable | fully visible |
| Read | stable | hidden | hidden behind seam | content travels |

### Refine `arrangement-camera.ts`

Keep the existing measured `zoomScale`. Add a restrained overshoot after the seam opens:

```ts
const IMMERSIVE_PHASES = {
  overview: 0,
  scan: 0.24,
  lock: 0.48,
  dive: 0.7,
  reveal: 0.84,
  read: 1,
} as const

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => value * value * (3 - 2 * value)

const span = (value: number, from: number, to: number) =>
  to <= from ? (value >= to ? 1 : 0) : smooth(clamp01((value - from) / (to - from)))

export function cameraScale(progress: number, zoomScale: number) {
  const p = clamp01(progress)
  const dive = span(p, IMMERSIVE_PHASES.dive, IMMERSIVE_PHASES.reveal)
  const settle = span(p, IMMERSIVE_PHASES.reveal, 0.91)
  const overshoot = span(p, 0.84, 0.88)

  const fitted = 1 + (zoomScale - 1) * dive
  const weight = Math.sin(overshoot * Math.PI)

  return fitted + weight * 0.025 - 0.025 * settle
}
```

Use the helper inside `arrangementFrame` instead of a direct `mix(1, zoomScale, zoomT)` call:

```ts
const scale =
  p < IMMERSIVE_PHASES.reveal
    ? cameraScale(p, zoomScale)
    : cameraScale(p, zoomScale)
```

The final value returns to the measured fit. The overshoot is only `2.5%`, enough to imply camera weight without making the viewport wobble.

### Depth values

Add to the returned frame:

```ts
export type ArrangementFrame = {
  // existing fields
  depth: number
  profileFocus: number
}
```

Calculate:

```ts
const lockT = span(p, IMMERSIVE_PHASES.scan, IMMERSIVE_PHASES.lock)
const diveT = span(p, IMMERSIVE_PHASES.lock, IMMERSIVE_PHASES.dive)

const depth = lockT * 18 + diveT * 12
const profileFocus = Math.max(lockT, diveT)
```

Write these values as CSS custom properties on `.trackArea`:

```ts
trackArea.style.setProperty('--arr-depth', `${frame.depth}px`)
trackArea.style.setProperty('--arr-profile-focus', frame.profileFocus.toFixed(3))
```

Do not animate layout properties. Use transform, opacity, filter, and clip-path only.

---

## 4. CSS camera treatment

Add to `arrangement.module.css`:

```css
.trackArea {
  perspective: 1200px;
  --arr-depth: 0px;
  --arr-profile-focus: 0;
}

.camera {
  transform-style: preserve-3d;
  transform: translate3d(var(--arr-camera-x), var(--arr-camera-y), 0)
    scale(var(--arr-zoom));
  transform-origin: center center;
}

.lane {
  transform: translateZ(calc(var(--arr-depth) * -0.18));
  transition: opacity 120ms linear, filter 120ms linear;
}

.laneProfile {
  position: relative;
  z-index: 2;
  transform: translateZ(var(--arr-depth));
  filter: brightness(calc(1 + var(--arr-profile-focus) * 0.08));
}

.laneGhost {
  transform: translateZ(calc(var(--arr-depth) * -0.32));
}

@media (max-width: 768px) {
  .trackArea {
    perspective: none;
  }

  .camera,
  .lane,
  .laneProfile,
  .laneGhost {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .trackArea {
    perspective: none;
  }

  .camera,
  .lane,
  .laneProfile,
  .laneGhost {
    transform: none;
    filter: none;
  }
}
```

If the current stylesheet already defines `.camera` or `.lane` transforms, merge these declarations into the existing rules. Do not duplicate competing transform declarations.

---

## 5. Hero chapter timing

Update `features/landing-page/chapters/hero/hero-chapter.ts`:

```ts
const collapse = gsap.timeline({
  scrollTrigger: {
    trigger: hero,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.85,
    invalidateOnRefresh: true,
  },
  defaults: { ease: 'none', overwrite: 'auto' },
})

collapse
  .to(
    supportingModules,
    {
      opacity: 0.16,
      scale: 0.98,
      duration: 0.22,
      stagger: 0.01,
    },
    0.24,
  )
  .to(
    anchors,
    {
      opacity: 1,
      filter: 'brightness(1.08) saturate(1)',
      duration: 0.2,
    },
    0.34,
  )
  .to(
    panel,
    {
      xPercent: -12,
      opacity: 0,
      filter: 'blur(4px)',
      duration: 0.18,
    },
    0.42,
  )
  .to(
    name,
    {
      scale: 1.26,
      letterSpacing: '-0.05em',
      duration: 0.42,
    },
    0.42,
  )
  .to(
    heroRail,
    {
      y: () => -Math.min(176, window.innerHeight * 0.2),
      opacity: 0.42,
      duration: 0.28,
    },
    0.66,
  )
  .to(
    handoff,
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.24,
    },
    0.72,
  )
  .to(
    atmosphere,
    {
      opacity: 0.1,
      duration: 0.2,
    },
    0.8,
  )
```

Do not add a second ScrollTrigger to the same Hero. The existing arrangement camera remains the single source of truth for the profile zoom.

---

## 6. About redesign contract

Rewrite `section-about.tsx` visually, not factually.

### Track model

```ts
const ABOUT_TRACKS = [
  {
    title: 'INTERACTION',
    heading: 'Start with the user.',
    note: 'REACT / NEXT.JS / TYPESCRIPT',
    story:
      'I begin with the interaction, not the component, because the component is the cheap part to get right. Four years of production frontends, most of them React and Next.js on systems where the interface is load-bearing rather than decorative.',
    credits: [
      { name: 'Bisadaya', note: 'Job platform · 15K users' },
      { name: '80&Company', note: 'HR management · Kyoto' },
    ],
  },
  {
    title: 'SYSTEMS',
    heading: 'Build the system.',
    note: 'FEATURES / DATA / DELIVERY',
    story:
      'I use React, Next.js, and TypeScript to create reusable structures that keep new features consistent. Typed data at the boundary and rendering chosen per route make the next six months cheaper to change.',
    credits: [
      { name: 'Primarindo Asia', note: 'Manufacturing · Jakarta' },
      { name: 'Niqcode', note: 'Product studio · Partner' },
    ],
  },
  {
    title: 'PRODUCTION',
    heading: 'Stay close to production.',
    note: 'BACKEND / AUTOMATION / INFRA',
    story:
      'I work across application data, deployment and monitoring when the frontend needs more than a polished screen. This site runs on Cloudflare Workers via OpenNext with an R2 cache, which is why the writing here is about what broke.',
    aside: 'Based in Jakarta. Available for frontend, design engineering and hard interface work.',
    resumeLink: RESUME_URL,
  },
] as const
```

### Layout

- One flat timeline rail, not three equal cards.
- One active channel at a time.
- Real text remains in the DOM and remains readable without animation.
- Scroll updates the active channel.
- Keyboard users can select channels with buttons.
- Existing résumé and contact links remain real links.

### About markup shape

```tsx
<section id="about" className={styles.about} data-anim="about-section">
  <div className={styles.aboutStage}>
    <SectionHeading index="02" eyebrow="Profile">
      Make the complicated part feel obvious.
    </SectionHeading>

    <div className={styles.aboutDeck}>
      <div className={styles.aboutRail} data-about-rail>
        {ABOUT_TRACKS.map((track, index) => (
          <article
            key={track.title}
            className={`${styles.aboutTrack} ${selected === index ? styles.aboutTrackActive : ''}`}
            data-anim="about-card"
          >
            <button
              type="button"
              className={styles.aboutTrackButton}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{track.title}</strong>
              <span>{track.note}</span>
            </button>

            <div className={styles.aboutTrackBody} aria-live="polite">
              <h3>{track.heading}</h3>
              <p>{track.story}</p>
              {track.credits ? (
                <ul>
                  {track.credits.map((credit) => (
                    <li key={credit.name}>
                      <b>{credit.name}</b>
                      <span>{credit.note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {track.aside ? <p>{track.aside}</p> : null}
              {track.resumeLink ? (
                <a href={track.resumeLink} target="_blank" rel="noreferrer">
                  Résumé (PDF)
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className={styles.aboutSignal} aria-hidden="true">
        <span className={styles.aboutSignalLine} />
        <span
          className={styles.aboutSignalHead}
          style={{ '--about-progress': aboutProgress } as React.CSSProperties}
        />
      </div>
    </div>
  </div>
</section>
```

### About CSS direction

```css
.about {
  min-height: 100%;
  background: #14171a;
  color: #eee9df;
}

.aboutStage {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(56px, 8vw, 120px) 0;
}

.aboutDeck {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  gap: clamp(20px, 5vw, 72px);
  margin-top: clamp(32px, 6vw, 80px);
}

.aboutRail {
  display: grid;
  gap: 1px;
  border-top: 1px solid rgb(238 233 223 / 0.18);
}

.aboutTrack {
  border-bottom: 1px solid rgb(238 233 223 / 0.18);
}

.aboutTrackButton {
  display: grid;
  grid-template-columns: 42px minmax(140px, 0.5fr) 1fr;
  align-items: center;
  width: 100%;
  min-height: 56px;
  gap: 16px;
  padding: 12px 0;
  border: 0;
  background: transparent;
  color: #8e928e;
  text-align: left;
  cursor: pointer;
}

.aboutTrackButton:hover,
.aboutTrackButton:focus-visible,
.aboutTrackActive .aboutTrackButton {
  color: #ff5a1f;
}

.aboutTrackBody {
  max-width: 720px;
  padding: 8px 0 36px 42px;
}

.aboutTrackBody h3 {
  margin: 0 0 14px;
  color: #eee9df;
  font-size: clamp(1.8rem, 4vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.06em;
}

.aboutTrackBody p {
  max-width: 60ch;
  color: #c7c4bb;
  line-height: 1.65;
}

.aboutSignal {
  position: relative;
  min-height: 100%;
}

.aboutSignalLine {
  position: absolute;
  inset: 0 auto 0 50%;
  width: 1px;
  background: rgb(238 233 223 / 0.22);
}

.aboutSignalHead {
  position: sticky;
  top: 50%;
  display: block;
  width: 18px;
  height: 18px;
  margin-left: calc(50% - 8px);
  border: 3px solid #14171a;
  border-radius: 50%;
  background: #ff5a1f;
  transform: translateY(calc(var(--about-progress) * 20px));
  box-shadow: 0 0 0 1px #ff5a1f;
}

@media (max-width: 768px) {
  .aboutStage {
    width: min(100% - 24px, 680px);
    padding: 48px 0 72px;
  }

  .aboutDeck {
    display: block;
  }

  .aboutSignal {
    display: none;
  }

  .aboutTrackButton {
    grid-template-columns: 32px 1fr;
    min-height: 52px;
  }

  .aboutTrackButton span:last-child {
    grid-column: 2;
    font-size: 10px;
  }

  .aboutTrackBody {
    padding: 8px 0 30px 32px;
  }
}
```

The implementation should merge with the existing rack tokens rather than create a second palette. Keep signal orange as the only accent.

---

# Reduced-motion behavior

`features/landing-page/chapters/use-landing-chapters.ts` already skips the GSAP chapter engine under `prefers-reduced-motion`. Preserve that behavior.

Also ensure the no-JS and reduced-motion frames show:

- Hero arrangement
- Profile content
- About content in normal flow
- Functional navigation
- No hidden required content

---

# Mobile behavior

At the content breakpoint, not a device-specific breakpoint:

- no horizontal overflow
- no pinned multi-screen camera dive
- `.stage` uses `min-height: 100dvh`, not `100vh`
- About tracks stack vertically
- track buttons remain at least 44px tall
- navigation stays reachable
- no clip-path hides required copy
- no hover-only interaction

---

# Verification

## Commands

```bash
pnpm lint
pnpm test
pnpm build
```

## Browser checks

Verify at `390px`, `768px`, `1280px`, and `1600px`:

- preloader boots once per session
- Skip intro works
- Enter and Space operate controls
- focus ring is visible
- Hero camera starts at scroll `0`
- profile clip remains the focal point
- zoom ends at the measured clip fit
- 2.5% overshoot settles cleanly
- About appears through the clip, not as a disconnected fade
- About content remains readable after the transition
- no horizontal overflow
- reduced-motion mode disables choreography
- light and dark theme tokens remain valid
- no console errors

## Acceptance criteria

- Hero remains recognizable as the existing DAW arrangement.
- Zoom-in remains the primary Hero → About transition.
- Camera movement is scroll-driven from the beginning of the Hero.
- The profile clip is the spatial source of About.
- About feels like the same session, not a separate generic bio page.
- Preloader shares the hardware palette and exits with blinds.
- No fabricated facts, testimonials, metrics, or navigation links.
- No new dependency or asset is required.

## Delivery gate

- R-02: no em dash in visible UI copy.
- R-03: mobile reflow and zero horizontal overflow.
- R-19: every animation serves boot, focus, spatial continuity, or reading position.
- R-25: text and controls retain AA contrast.
- R-26: every control has real behavior.
- R-32: keyboard operation and visible focus.
- R-35: build and browser verification required.
- R-37: direction and dials declared above.
- R-38: all content real or explicitly placeholder.
