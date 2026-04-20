# Bugfix Requirements Document

## Introduction

The Next.js portfolio application has multiple performance issues causing poor Lighthouse scores (~60) instead of the target score (85+). The performance issues include LCP element render delays, legacy JS polyfills, render-blocking CSS, unused JS, non-composited animations, and version mismatches. These issues collectively degrade user experience and page load performance.

## Bug Analysis

### Current Behavior (Defect)

[What currently happens when the bug is triggered]

1.1 WHEN the application loads THEN the LCP element (hero `<p>` tag) has a 4,220 ms render delay due to preloader and Motion animation blocking
1.2 WHEN the application builds THEN the system includes 11.1 KiB of legacy JS polyfills due to ES2017 target and missing browserslist configuration
1.3 WHEN the application loads THEN 3 CSS chunks (110 ms) block rendering in the critical path
1.4 WHEN the application loads THEN ~70 KiB of unused JS (react-syntax-highlighter + tone.js) are eagerly loaded in the initial bundle
1.5 WHEN animations run THEN Motion animates non-GPU properties causing non-composited animations and jank
1.6 WHEN the application builds THEN @next/mdx version (14.2.13) mismatches with Next.js version (15.1.11) causing potential duplicate React internals

### Expected Behavior (Correct)

[What should happen instead]

2.1 WHEN the application loads THEN the system SHALL render the LCP element immediately with CSS animations instead of Motion wrapper delays
2.2 WHEN the application builds THEN the system SHALL target ES2022 with appropriate browserslist to eliminate legacy JS polyfills
2.3 WHEN the application loads THEN the system SHALL optimize CSS delivery to reduce render-blocking CSS below 50 ms
2.4 WHEN the application loads THEN the system SHALL dynamically import heavy libraries (react-syntax-highlighter, tone.js) only when needed
2.5 WHEN animations run THEN the system SHALL only animate GPU-composited properties (transform and opacity)
2.6 WHEN the application builds THEN the system SHALL use @next/mdx version 15.1.11 matching Next.js version

### Unchanged Behavior (Regression Prevention)

[Existing behavior that must be preserved]

3.1 WHEN the application loads THEN the system SHALL CONTINUE TO display all visual content and maintain existing functionality
3.2 WHEN the application builds THEN the system SHALL CONTINUE TO support all existing browser targets with native features
3.3 WHEN CSS is applied THEN the system SHALL CONTINUE TO maintain all existing styling and visual appearance
3.4 WHEN code blocks are displayed THEN the system SHALL CONTINUE TO provide syntax highlighting functionality
3.5 WHEN music player is used THEN the system SHALL CONTINUE TO provide audio playback functionality
3.6 WHEN animations run THEN the system SHALL CONTINUE TO provide smooth visual transitions
3.7 WHEN MDX content is rendered THEN the system SHALL CONTINUE TO process and display all blog posts correctly

## Bug Condition Derivation

From the requirements, we can derive the bug condition and property using structured pseudocode:

**Bug Condition Function** - Identifies inputs that trigger the performance issues:

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type ApplicationLoad
  OUTPUT: boolean

  // Returns true when any performance issue condition is met
  RETURN
    X.lcpDelay > 2500 OR
    X.legacyJSPolyfills > 0 OR
    X.renderBlockingCSS > 50 OR
    X.unusedJS > 20 OR
    X.hasNonCompositedAnimations OR
    X.hasVersionMismatch
END FUNCTION
```

**Property Specification** - Defines correct behavior for buggy inputs:

```pascal
// Property: Fix Checking - Performance Improvements
FOR ALL X WHERE isBugCondition(X) DO
  result ← F'(X)
  ASSERT
    result.lcpDelay <= 2500 AND
    result.legacyJSPolyfills = 0 AND
    result.renderBlockingCSS <= 50 AND
    result.unusedJS <= 20 AND
    NOT result.hasNonCompositedAnimations AND
    NOT result.hasVersionMismatch AND
    result.lighthouseScore >= 85
END FOR
```

**Key Definitions:**

- **F**: The original (unfixed) function - the code as it exists before the performance fixes
- **F'**: The fixed function - the code after applying all performance optimizations

**Preservation Goal** - Expressed in structured pseudocode:

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X).functionality = F'(X).functionality AND
         F(X).visualAppearance = F'(X).visualAppearance AND
         F(X).userInteractions = F'(X).userInteractions
END FOR
```

This ensures that for all non-buggy inputs (existing functionality that works correctly), the performance-optimized code behaves identically to the original in terms of functionality, visual appearance, and user interactions.

## Implementation Recommendations

Based on the detailed performance fix plan, here are specific implementation recommendations for each task:

### Task P1 — Fix LCP Element Render Delay

**Files:** `features/landing-page/sections/hero.tsx`, `features/landing-page/animations/preloader.tsx`, `app/globals.css`

**Recommendations:**

1. Replace `motion.p` wrapper on hero `<p>` tag with plain `<p>` element using CSS animation
2. Add CSS animation to `app/globals.css`:
   ```css
   @keyframes hero-desc-in {
     from {
       opacity: 0;
       transform: translateY(16px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   .animate-hero-desc {
     animation: hero-desc-in 0.6s ease 0.2s both;
   }
   ```
3. Reduce preloader duration from 3000ms to 1200ms maximum
4. Add sessionStorage check to skip preloader on return visits

### Task P2 — Eliminate Legacy JS Polyfills

**Files:** `tsconfig.json`, `package.json`

**Recommendations:**

1. Update `tsconfig.json` target from `ES2017` to `ES2022`
2. Add `ES2022` to `lib` array in compiler options
3. Add `browserslist` configuration to `package.json`:
   ```json
   "browserslist": [
     "chrome >= 109",
     "edge >= 109",
     "firefox >= 110",
     "safari >= 16",
     "not dead"
   ]
   ```
4. Upgrade `@next/mdx` from `14.2.13` to `15.1.11` to match Next.js version

### Task P3 — Reduce Render-Blocking CSS

**Files:** `next.config.mjs`, `app/globals.css`

**Recommendations:**

1. Enable `optimizeCss: true` in Next.js experimental config
2. Install `critters` dependency: `pnpm add -D critters`
3. Audit `app/globals.css` for unnecessary global imports
4. Ensure Tailwind v4 handles per-page CSS scoping properly

### Task P4 — Remove Unused JS from Initial Bundle

**Files:** Blog code block component, music player component

**Recommendations:**

1. Convert `react-syntax-highlighter` import to dynamic import with `ssr: false`
2. Convert `tone.js` import to lazy load on first interaction
3. Consider migrating to `rehype-pretty-code` + `shiki` for zero-runtime JS syntax highlighting

### Task P5 — Fix Non-Composited Animations

**Files:** Any component using Motion or CSS animations

**Recommendations:**

1. Audit all animations to ensure they only use `transform` and `opacity` properties
2. Replace non-GPU animations (width, height, top, background) with GPU-composited equivalents
3. Use Chrome DevTools → Rendering → Paint Flashing to identify problematic elements

### Task P6 — Accessibility Quick Wins

**Files:** Various component files

**Recommendations:**

1. Add `aria-label` to all icon-only buttons
2. Add `aria-label` to all icon-only links
3. Fix low contrast text (replace `text-zinc-400` with `text-zinc-500` or `text-zinc-600` on light backgrounds)

### Task P7 — Security Headers

**Files:** `next.config.mjs`

**Recommendations:**

1. Add security headers configuration to Next.js config:
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - Basic Content-Security-Policy

## Execution Priority Order

**Week 1 — Core Performance (Highest Impact):**

1. P2: Update tsconfig target + browserslist (~10 min)
2. P2: Upgrade @next/mdx to 15.1.11 (~5 min)
3. P1: Cap preloader to 1200ms + skip logic (~30 min)
4. P1: Replace motion.p with CSS animation (~30 min)
5. P4: Dynamic import tone.js (~20 min)

**Week 1 — Bundle Cleanup:**

1. P4: Dynamic import react-syntax-highlighter (~20 min)
2. P4: (Optional) Migrate to rehype-pretty-code (~45 min)
3. P3: Add optimizeCss + install critters (~10 min)

**Week 2 — Polish:**

1. P5: Audit non-composited animations (~30 min)
2. P6: Add aria-labels to icon buttons/links (~30 min)
3. P6: Fix low-contrast text colors (~20 min)
4. P7: Add security headers to next.config.mjs (~15 min)

## Expected Outcomes

| Metric            | Before   | After        |
| ----------------- | -------- | ------------ |
| Performance Score | ~60      | **88–92**    |
| LCP               | ~5.5s    | **<2.0s**    |
| Accessibility     | 86       | **95+**      |
| Best Practices    | 96       | **100**      |
| Legacy JS Waste   | 11.1 KiB | **0 KiB**    |
| Initial JS Bundle | ~300 KiB | **~220 KiB** |

## Verification Steps

1. Run bundle analyzer: `ANALYZE=true pnpm build`
2. Run Lighthouse CI: `npx lighthouse https://adityahimaone.vercel.app --view`
3. Check browserslist targets: `npx browserslist`
4. Test all preserved functionality remains unchanged
