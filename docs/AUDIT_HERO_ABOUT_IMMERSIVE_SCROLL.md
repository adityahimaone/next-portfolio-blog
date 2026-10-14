# Audit: Hero + About Immersive Scroll

Audit of commit `02a237d` against `docs/HERO_ABOUT_IMMERSIVE_SCROLL.md`.

Read-only audit. Nothing was modified. Fix list at the end, ordered by priority.

---

## Verdict

The camera work landed and is correct. The preloader landed and is correct. The About redesign landed as a rail, and it is a real improvement on the card deck.

Two things did not land as intended:

1. **The Hero chapter retime is dead code.** The contract named a file that is not in the live render tree.
2. **The read no longer travels.** The redesign made the About content fit its window, so the measured overflow is now zero and the second half of the scroll window does nothing.

Neither is a build failure. Both are behaviour failures against the contract's own acceptance criteria.

---

## Verification run

| Check | Command | Result |
| --- | --- | --- |
| Tests | `npx jest` | PASS, 8 suites, 162 tests |
| Types | `npx tsc --noEmit` | PASS, no errors |
| Critical CSS | `node scripts/check-critical-css.mjs` | PASS, 5 links + 236KB inline |
| Build | `npx next build` | PASS, all 38 routes compiled |
| Lint (changed files) | `npx eslint features/landing-page components/ui/slat-count-preloader.tsx` | 91 problems, none in the new files except one unused import |

New files are clean. Every lint error is pre-existing in untouched files.

---

## What landed correctly

### Camera: overshoot and depth

> **Historical — the overshoot described here has since been removed.** This
> audit records commit `02a237d` and is accurate *for that commit*. `IMMERSIVE_OVERSHOOT`,
> `IMMERSIVE_OVERSHOOT_FROM` and `IMMERSIVE_OVERSHOOT_TO` no longer exist;
> `cameraScale` is now monotonic and `tests/arrangement-camera.test.ts` asserts it.
> See `docs/HERO_ABOUT_IMMERSIVE_SCROLL.md` §Status for why. Everything else in
> this section — the depth layer, `laneOpacity`'s nested `mix()`, `profileFocus`'s
> `max()` — is unchanged and still accurate.

`arrangement-camera.ts` is well built.

- `cameraScale()` returns the measured fit plus a half-sine bump, and the bump is provably zero at both ends. The test asserts `cameraScale(IMMERSIVE_OVERSHOOT_TO, FIT) === FIT`, which is the exact property the contract asked for.
- The overshoot is `2.5% of zoomScale`, not a fixed pixel count, so it scales with the viewport. Correct choice.
- `laneOpacity` uses nested `mix()` rather than a sum, because `lockT` and `diveT` overlap. This is the right fix and the comment says why.
- `profileFocus` uses `max()` so the brightness multiplier stays bounded. Correct.
- Depth is `translateZ` under a fixed `perspective`, kept on a different axis from `scale`. The comment explains the separation. Correct.

New constants are exported and tested:

- `IMMERSIVE_PHASES` — ~~`IMMERSIVE_OVERSHOOT`, `IMMERSIVE_OVERSHOOT_FROM`, `IMMERSIVE_OVERSHOOT_TO`~~ (removed)
- `IMMERSIVE_DEPTH_LOCK`, `IMMERSIVE_DEPTH_DIVE`
- `IMMERSIVE_LANE_SCAN_OPACITY`, `IMMERSIVE_LANE_DIVE_OPACITY`

### Custom property writes

`use-arrangement-hero.ts` writes `--arr-depth`, `--arr-profile-focus` and `--arr-lane-opacity` on `.trackArea`, the smallest node that reads them, and removes all three in cleanup. Per-tick values are correct here because they track the scrub.

Seam properties are still written on the seam, not the track area. That was already right and is unchanged.

### CSS depth layer

`arrangement.module.css` merges the depth declarations into the existing `.lane`, `.laneProfile` and `.laneGhost` rules instead of duplicating transforms. `preserve-3d` is on both `.camera` and `.lanes`, which is required and easy to miss.

Fallbacks are correct:

- `perspective: none` under `max-width: 768px`
- `perspective: none` under `prefers-reduced-motion: reduce`
- `perspective: none` under `scripting: none`

The `scripting: none` case matters because `--arr-depth` is never written without the hook. It is handled.

### Preloader

`components/ui/slat-count-preloader.tsx` is a clean rewrite, not a copy-paste of the supplied showcase component. It is better than what the brief supplied:

- Pure schedule helpers (`sequenceIndexAt`, `bootProgress`, `bootTimings`, `blindDelay`) are exported and unit-tested without a DOM. 115 lines of test.
- One clock drives both `step` and `exiting`, so the exit cannot fire on a frame where the last count has not painted. This is a real bug in the naive version and it is fixed.
- Blinds are the actual ground, not a decoration. `.scp-veil` covers the hairline seams while they are closed.
- Reduced motion shortens both the beat and the exit, and stops the blinds travelling.
- The root takes focus with `preventScroll`, so the first Tab reaches Skip.

Contrast, computed:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `#eee9df` count on `#14171a` | 14.87 | AA |
| caption 72% mix | 8.13 | AA |
| eyebrow 58% mix | 5.70 | AA |
| HUD note 62% mix | 6.32 | AA |
| `#ff5a1f` accent on `#14171a` | 5.77 | AA |
| Skip button, `#eee9df` on `#14171a` at 72% bg | 5.77 | AA |

All pass.

### Landing gate

`landing-gate.tsx` is correct and better than the contract's version:

- `BOOT_SEQUENCE` and `BOOT_PALETTE` are hoisted so the preloader cannot restart on re-render. The contract's inline objects would have.
- `showGate` is set inside `requestAnimationFrame` rather than synchronously in the effect body. Avoids the cascading-render pattern and gives the page underneath a layout pass first.
- `sessionStorage` reads and writes are both guarded, and the failure mode is the harmless one.
- `complete` is wrapped in `useCallback`.
- The page renders underneath, so there is no layout shift when the blinds leave.

### About rail

The rail is the right idea and the right execution of the idea.

- Three equal cards became one rail with one open channel. That is the page's own language.
- The collapse is a CSS decision gated on `(prefers-reduced-motion: no-preference) and (scripting: enabled) and (min-width: 769px)`. The comment explains that the breakpoint must match the one that unpins the stage, and it does. This is the correct way to do it: server and client render the same markup, so there is no frame where all three are open and then snap shut.
- The résumé link stays outside the button. That was already right and is preserved.
- The signal column is `aria-hidden`, because the open channel already conveys the position. Correct.

Contrast, computed:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `--about-accent-ink` `#b8400f` on `--chassis-hi` `#f4f0e8` | 4.89 | AA |
| `--about-accent-ink` dark `#ff7a45` on `#2e3237` | 4.99 | AA |
| `--panel-ink` light | 16.55 | AA |
| `--panel-ink-muted` light | 5.47 | AA |
| `--panel-ink` dark | 11.12 | AA |
| `--panel-ink-muted` dark | 6.15 | AA |

The two-tone accent is the correct fix. Raw `--signal-orange` on the light chassis is 2.74, which fails. The rail does not use it as text.

---

## Findings

### HIGH-1 — The Hero chapter retime is dead code

`features/landing-page/chapters/use-landing-chapters.ts` exports `useLandingChapters` and **nothing imports it**.

Verified:

```
grep -rn "useLandingChapters" --include=*.ts --include=*.tsx .
→ only the definition
```

Consequences:

- The 138 changed lines in `chapters/hero/hero-chapter.ts` never run.
- The 21 changed lines in `chapters/about/about-chapter.ts` never run.
- `heroChapter` would bail anyway: it queries `[data-anim="hero-section"]`, and no element in the tree carries that attribute. The arrangement hero uses `data-rack-section`.
- The live scroll engine is `features/landing-page/rack-01/use-rack-animations.ts`, which this commit did not touch.

**This is a contract defect, not an implementation defect.** The contract listed `hero-chapter.ts` as "Hero chapter" without checking that the file was reachable. The implementer followed the contract faithfully.

What is actually live:

| Concern | Live owner |
| --- | --- |
| Camera zoom, depth, seam, playhead, About selection | `components/arrangement/use-arrangement-hero.ts` |
| Lenis, section reveals, Skills, Experience, Work seam | `rack-01/use-rack-animations.ts` |
| Hero chapter timing | **nobody** |

The retime the contract asked for (supporting lanes to `.16` at 0.24, profile lift at 0.34, name scale at 0.42) is not applied. What the reader actually sees is the camera's own `laneOpacity`, which reaches `.16` at `IMMERSIVE_PHASES.dive` (0.7). So the lanes recede later than the contract asked, and the name clip does not scale.

**Fix.** Delete `features/landing-page/chapters/` entirely, or wire it. It is roughly 1,400 lines of unreachable motion code with tests-adjacent complexity, and it will keep attracting edits that do nothing. The honest move is deletion: `use-rack-animations.ts` already owns the live engine, and the arrangement hook owns the camera.

If the retime is wanted, it belongs in `arrangement-camera.ts` as a `nameScale` field alongside `depth`, not in a chapter file that never runs.

### HIGH-2 — The read no longer travels

`use-arrangement-hero.ts` measures:

```ts
const readOverflow =
  rail && deck ? Math.max(0, rail.offsetHeight - deck.offsetHeight) : 0
```

and the frame returns `readTravel: readT * Math.max(0, geo.readOverflow)`.

The old About was a stack of three always-open cards, taller than the deck, so the overflow was real (103px at 1440×900) and the read had something to do.

The new About shows exactly one channel body at a time. `rail.offsetHeight` is now one open channel plus two closed headers, which is comfortably shorter than `deck.offsetHeight`. So:

```
readOverflow → 0
readTravel   → 0 at every progress value
```

The second half of the 460svh scroll window now does nothing visible. The reader scrolls through roughly 1.5 screens where the only change is the signal head moving 20px.

Two further consequences:

- `--arr-read-travel` is `-0px` at all times, so `.aboutSeam .sectionHeading` and `.aboutRail` carry a `translateY` and a `will-change: transform` for an animation that does not exist. That is two promoted full-width layers on every desktop load, for nothing.
- The measurement is taken at refresh time, when channel 0 is open. If a reader opens PRODUCTION, that body is taller, and the rail can exceed the deck with no travel available to recover it. It is not clipped today, but the margin is unmeasured.

**Fix, pick one:**

- **Preferred:** shorten the window. If the read has nothing to do, `ARRANGEMENT_SCROLL_SVH = 460` is too long. Measure the real content and retime, or split the hold so the reveal and the selection are the whole of it.
- Or give the read a real job: make the open channel animate in on selection rather than appearing instantly, and drive that from `readT`.

Either way, drop `will-change` when `readOverflow` is zero.

### MEDIUM-1 — `#about` anchor and the seam's `inert` contract

Unchanged from before, but worth confirming against the new rail, because the rail changes the height the anchor resolves against.

- `.aboutAnchor` sits at `ARRANGEMENT_SEAM_OPEN * travel`, written by `measure()`.
- `inert` is set on the seam until `frame.railReveal >= 1`.

Both still work. But the skip link and the shared `#about` URL now land the reader at 0.82 of a window whose last 18% does nothing (see HIGH-2). Landing there is a dead stop. Fixing HIGH-2 fixes this too.

### MEDIUM-2 — Selection can fight the reader

`render()` writes `setAboutIndex(floor(readT * cardCount))` whenever `readT` changes.

So: click INTERACTION, scroll one pixel, and the selection jumps back to whatever the read says. The comment claims "clicking a card still wins", which is true only while the scroll is stationary.

**Fix.** Track a `userSelected` flag, set on click, cleared when the read's own answer moves by more than the current index. Or simply stop deriving the index from scroll now that the rail shows one channel at a time and the content always fits.

### MEDIUM-3 — One-channel-at-a-time hides two thirds of the record

The rail shows one body. The other two channels' prose is in the DOM but `display: none` on desktop.

That is a deliberate, documented trade and it is defensible: the collapse is gated so phones, reduced motion and no-JS all get all three open.

But the contract's own acceptance criterion says "About content remains readable after the transition". On desktop, two of three stories require a click or a scroll to read. The reader cannot see how much there is.

**Fix.** Add a visible affordance that there is more: the rail header already prints `01 / INTERACTION / REACT / NEXT.JS / TYPESCRIPT`. Consider a thin progress rule on the open channel, or a count in the section heading. Cheap, and it tells the reader the rail is a rail.

### LOW-1 — Dead CSS from the card deck

`rack-01.module.css` still carries the card-era rules. Counted class definitions with zero references in any `.tsx`:

| Class | Definitions | Used |
| --- | --- | --- |
| `.aboutCard` | 21 | 0 |
| `.aboutCardRail` | 13 | 0 |
| `.aboutMetric` | 8 | 0 |
| `.aboutCardCredits` | 4 | 0 |
| `.aboutCardResume` | 3 | 0 |
| `.aboutCardStack` | 2 | 0 |
| `.aboutCardLabel` | 2 | 0 |
| `.aboutCardAside` | 2 | 0 |
| `.aboutCardSlot`, `.aboutCardStory`, `.aboutCardFoot` | 1 each | 0 |
| `.timelinePanel` | 92 | 0 |
| `.timelineWorkspace` | 10 | 0 |

That is over 150 rule blocks for markup that no longer exists, including the entire timeline workstation the rail replaced. `.aboutSeam .timelinePanel` and its `max-height`/flex chain are among the most intricate rules in the file and they now style nothing.

**Fix.** Delete them. This is the single largest reduction available in the change.

### LOW-2 — `.aboutSeam` reset rules target removed markup

`rack-01.module.css` lines 12799-12803:

```css
.aboutSeam .sectionHeading,
.aboutSeam .aboutRail {
  transform: translateY(var(--arr-read-travel, 0px));
  will-change: transform;
}
```

`will-change: transform` on the heading and the rail, for a travel that is always zero (HIGH-2). Drop it, or gate it on `readOverflow > 0`.

### LOW-3 — `hero-chapter.ts` has an unused binding

`chapters/hero/hero-chapter.ts:18` destructures `ScrollTrigger` and never uses it. Lint flags it. It disappears with HIGH-1.

### LOW-4 — Committed agent memory

`.workbuddy-ai/memory/` holds four dated markdown files tracked in git. Pre-existing, but this commit added a fifth. It is agent scratch, not project documentation, and it ships in the repo.

**Fix.** Add `.workbuddy-ai/` to `.gitignore` and `git rm -r --cached .workbuddy-ai`.

### LOW-5 — `DawHero` is unreachable

`components/hero/daw-hero.tsx` is exported from `components/hero/index.ts` and rendered nowhere. It is the previous Hero, kept alive by a barrel file. `heroChapter` and `hero-sweep-order` both reference it.

Not introduced by this commit. But it is what made HIGH-1 possible: the contract author saw `data-hero-device` in the tree and assumed the chapter file that targets it was live.

**Fix.** Delete `components/hero/daw-hero.tsx`, `daw-hero.module.css`, `hero.module.css`, `use-hero-motion.ts`, `lib/hero-sweep-order.ts` and `broken-light-text/` if nothing else imports them. Verify with `grep` first.

---

### LOW-6 — `prebuild` cannot delete `.next` while `next dev` runs

`npm run build` runs `prebuild`, which does `fs.rmSync('.next', {recursive: true, force: true})`.

Observed:

```
Error: ENOTEMPTY: directory not empty, rmdir '.next'
```

The dev server holds `.next/dev/cache/turbopack/...` open. The build only succeeds if the dev server is stopped first, or if `next build` is invoked directly (which is how this audit verified it).

Not introduced by this commit, but it makes `npm run build` unreliable in the exact workflow this change requires (build while previewing). Consider deleting `.next/dev` only, or ignoring the error.

---

## What the contract asked for and did not get

| Contract requirement | Status |
| --- | --- |
| Preloader with rack palette and blind exit | Done, and better than specified |
| One-run session gate | Done, and better than specified |
| Camera scale with restrained overshoot | Done at `02a237d`; **overshoot since removed** — scale is now monotonic |
| Depth and profile focus | Done |
| Hero chapter retimed to the immersive phases | **Not applied, file unreachable** |
| About as a timeline rail, not three cards | Done |
| Zoom ends at the measured clip fit | Done, asserted by test |
| About appears through the clip | Done, unchanged mechanism |
| No new dependency | Done |
| Mobile reflow, no horizontal overflow | Structurally done, not measured in a browser |
| Reduced motion disables choreography | Done |
| Text remains readable without animation | Done for phones/reduced-motion/no-JS; desktop shows one of three |

---

## Fix order

1. **HIGH-2** — decide what the read does, or shorten the window. This is the one a reader feels.
2. **HIGH-1** — delete `features/landing-page/chapters/`. Then, if the retime is wanted, move it into `arrangement-camera.ts` as a `nameScale` field.
3. **LOW-1** — delete the dead card and timeline CSS. Roughly 150 rule blocks.
4. **MEDIUM-2** — stop the read from overwriting a click.
5. **MEDIUM-3** — signal that the rail has three channels.
6. **LOW-2, LOW-3** — drop `will-change` and the unused binding.
7. **LOW-4, LOW-5** — untrack `.workbuddy-ai/`, delete the unreachable previous Hero.
8. Re-run `npx jest`, `npx tsc --noEmit`, `npm run build`, then verify at 390 / 768 / 1280 / 1600 in both themes.

---

## Delivery gate

| Rule | Status |
| --- | --- |
| R-02 no em dash in UI copy | PASS |
| R-03 mobile reflow | PASS by construction, unverified in a browser |
| R-17 no invented statistics | PASS, no new numbers |
| R-25 contrast | PASS, computed above |
| R-26 every control has behaviour | PASS, skip / channel buttons / résumé all real |
| R-32 keyboard and focus | PASS, focus rings on both skip and channel buttons |
| R-35 build and exercise | PARTIAL, tests and types pass, browser pass not run |
| R-37 direction declared | PASS |
| R-38 no fabricated content | PASS, all copy carried over from the previous About |

No em dash in any visible string. Verified by reading the new copy: `INTERACTION`, `SYSTEMS`, `PRODUCTION`, the three stories, the availability line and the preloader label and caption.
