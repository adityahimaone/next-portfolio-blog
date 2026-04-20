# Implementation Plan

- [x] 1. Write bug condition exploration test

  - **Property 1: Bug Condition** - Performance Issues Exploration
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the performance issues exist
  - **Scoped PBT Approach**: For deterministic performance issues, scope the property to concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Condition in design
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the performance issues exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)

  - **Property 2: Preservation** - Functionality Preservation Tests
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (existing functionality)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix for performance issues

  - [x] 3.1 Week 1 — Core Performance (score impact)

    - [x] 3.1.1 P2: Update tsconfig target ES2022 + browserslist

      - **Files**: `tsconfig.json`, `package.json`
      - **Implementation Steps**:
        1. Update `tsconfig.json` target from `"ES2017"` to `"ES2022"`
        2. Add `"ES2022"` to `lib` array in compiler options
        3. Add `browserslist` configuration to `package.json` targeting modern browsers
      - **Testing/Verification Steps**:
        1. Run `npx browserslist` to verify target browsers
        2. Build application and check bundle analyzer for polyfill reduction
        3. Verify no TypeScript compilation errors
      - **Estimated Time**: 10 minutes
      - _Bug_Condition: isBugCondition(input) where input.legacyJSPolyfills > 0_
      - _Expected_Behavior: expectedBehavior(result) where result.legacyJSPolyfills = 0_
      - _Preservation: Preservation Requirements 3.1, 3.2 from design_
      - _Requirements: 2.2, 3.1, 3.2_

    - [x] 3.1.2 P2: Upgrade @next/mdx to 15.1.11

      - **Files**: `package.json`
      - **Implementation Steps**:
        1. Run `pnpm add @next/mdx@15.1.11`
        2. Verify package.json version update
        3. Test MDX blog posts still render correctly
      - **Testing/Verification Steps**:
        1. Build application to check for version conflicts
        2. Verify all blog posts display correctly
        3. Check bundle analyzer for duplicate React internals
      - **Estimated Time**: 5 minutes
      - _Bug_Condition: isBugCondition(input) where input.hasVersionMismatch_
      - _Expected_Behavior: expectedBehavior(result) where NOT result.hasVersionMismatch_
      - _Preservation: Preservation Requirements 3.7 from design_
      - _Requirements: 2.6, 3.7_

    - [x] 3.1.3 P1: Cap preloader to 1200ms + verify skip path

      - **Files**: `features/landing-page/animations/preloader.tsx`
      - **Implementation Steps**:
        1. Reduce preloader duration from 3000ms to 1200ms maximum
        2. Add sessionStorage check to skip preloader on return visits
        3. Ensure skip path executes synchronously
      - **Testing/Verification Steps**:
        1. Test first visit shows preloader for max 1200ms
        2. Test return visit skips preloader entirely
        3. Verify sessionStorage logic works correctly
      - **Estimated Time**: 30 minutes
      - _Bug_Condition: isBugCondition(input) where input.lcpDelay > 2500_
      - _Expected_Behavior: expectedBehavior(result) where result.lcpDelay <= 2500_
      - _Preservation: Preservation Requirements 3.1, 3.6 from design_
      - _Requirements: 2.1, 3.1, 3.6_

    - [x] 3.1.4 P1: Replace motion.p with CSS animation on LCP element

      - **Files**: `features/landing-page/sections/hero.tsx`, `app/globals.css`
      - **Implementation Steps**:
        1. Replace `motion.p` wrapper with plain `<p>` element
        2. Add CSS animation class `animate-hero-desc`
        3. Define animation in `app/globals.css` with `@keyframes hero-desc-in`
      - **Testing/Verification Steps**:
        1. Verify hero description appears immediately in DOM
        2. Test CSS animation runs correctly
        3. Measure LCP improvement with Lighthouse
      - **Estimated Time**: 30 minutes
      - _Bug_Condition: isBugCondition(input) where input.lcpDelay > 2500_
      - _Expected_Behavior: expectedBehavior(result) where result.lcpDelay <= 2500_
      - _Preservation: Preservation Requirements 3.1, 3.3, 3.6 from design_
      - _Requirements: 2.1, 3.1, 3.3, 3.6_

    - [x] 3.1.5 P4: Dynamic import tone.js
      - **Files**: `features/landing-page/spotify/music-player.tsx`
      - **Implementation Steps**:
        1. Convert `import * as Tone from 'tone'` to dynamic import
        2. Add lazy loading logic on first interaction
        3. Implement loading state and error handling
      - **Testing/Verification Steps**:
        1. Verify tone.js not in initial bundle
        2. Test music player loads and works correctly on first interaction
        3. Check bundle analyzer for size reduction
      - **Estimated Time**: 20 minutes
      - _Bug_Condition: isBugCondition(input) where input.unusedJS > 20_
      - _Expected_Behavior: expectedBehavior(result) where result.unusedJS <= 20_
      - _Preservation: Preservation Requirements 3.5 from design_
      - _Requirements: 2.4, 3.5_

  - [x] 3.2 Week 1 — Bundle Cleanup

    - [x] 3.2.1 P4: Dynamic import react-syntax-highlighter

      - **Files**: `features/blog/components/blog-post.tsx` (or relevant code block component)
      - **Implementation Steps**:
        1. Convert `react-syntax-highlighter` import to dynamic import with `ssr: false`
        2. Add loading component for syntax highlighting
        3. Import specific style file instead of entire dist
      - **Testing/Verification Steps**:
        1. Verify react-syntax-highlighter not in initial bundle
        2. Test blog posts with code blocks load syntax highlighting correctly
        3. Check bundle analyzer for size reduction
      - **Estimated Time**: 20 minutes
      - _Bug_Condition: isBugCondition(input) where input.unusedJS > 20_
      - _Expected_Behavior: expectedBehavior(result) where result.unusedJS <= 20_
      - _Preservation: Preservation Requirements 3.4 from design_
      - _Requirements: 2.4, 3.4_

    - [ ]\* 3.2.2 P4: (Optional) Migrate to rehype-pretty-code

      - **Files**: `next.config.mjs`, `package.json`
      - **Implementation Steps**:
        1. Install `rehype-pretty-code` and `shiki`
        2. Remove `react-syntax-highlighter` and its types
        3. Configure MDX with rehype-pretty-code plugin
      - **Testing/Verification Steps**:
        1. Verify all blog posts render with syntax highlighting
        2. Check bundle analyzer for zero runtime JS for code blocks
        3. Test different code languages and themes
      - **Estimated Time**: 45 minutes
      - _Bug_Condition: isBugCondition(input) where input.unusedJS > 20_
      - _Expected_Behavior: expectedBehavior(result) where result.unusedJS <= 20_
      - _Preservation: Preservation Requirements 3.4 from design_
      - _Requirements: 2.4, 3.4_

    - [x] 3.2.3 P3: Add optimizeCss + install critters
      - **Files**: `next.config.mjs`, `package.json`
      - **Implementation Steps**:
        1. Install `critters` dependency
        2. Enable `optimizeCss: true` in Next.js experimental config
        3. Audit `app/globals.css` for unnecessary global imports
      - **Testing/Verification Steps**:
        1. Build application and check CSS optimization
        2. Measure render-blocking CSS reduction
        3. Verify visual appearance unchanged
      - **Estimated Time**: 10 minutes
      - _Bug_Condition: isBugCondition(input) where input.renderBlockingCSS > 50_
      - _Expected_Behavior: expectedBehavior(result) where result.renderBlockingCSS <= 50_
      - _Preservation: Preservation Requirements 3.3 from design_
      - _Requirements: 2.3, 3.3_

  - [x] 3.3 Week 2 — Polish

    - [x] 3.3.1 P5: Audit non-composited animations

      - **Files**: Any component using Motion or CSS animations
      - **Implementation Steps**:
        1. Identify animations using non-GPU properties (width, height, top, background)
        2. Convert to GPU-composited properties (transform, opacity)
        3. Use Chrome DevTools Paint Flashing to verify
      - **Testing/Verification Steps**:
        1. Test all animations still work correctly
        2. Verify no visual regression
        3. Check performance with Chrome DevTools
      - **Estimated Time**: 30 minutes
      - _Bug_Condition: isBugCondition(input) where input.hasNonCompositedAnimations_
      - _Expected_Behavior: expectedBehavior(result) where NOT result.hasNonCompositedAnimations_
      - _Preservation: Preservation Requirements 3.6 from design_
      - _Requirements: 2.5, 3.6_

    - [x] 3.3.2 P6: Add aria-labels to icon buttons/links

      - **Files**: Various component files with icon-only buttons and links
      - **Implementation Steps**:
        1. Add `aria-label` to all icon-only buttons
        2. Add `aria-label` to all icon-only links
        3. Add `aria-hidden="true"` to icons
      - **Testing/Verification Steps**:
        1. Run accessibility audit
        2. Test with screen reader
        3. Verify all interactive elements have accessible names
      - **Estimated Time**: 30 minutes
      - _Bug_Condition: isBugCondition(input) where input.accessibilityScore < 95_
      - _Expected_Behavior: expectedBehavior(result) where result.accessibilityScore >= 95_
      - _Preservation: Preservation Requirements 3.1, 3.2 from design_
      - _Requirements: 3.1, 3.2_

    - [x] 3.3.3 P6: Fix low-contrast text colors

      - **Files**: Components with `text-zinc-400` on light backgrounds
      - **Implementation Steps**:
        1. Replace `text-zinc-400` with `text-zinc-500` or `text-zinc-600` on light backgrounds
        2. Check contrast ratios meet WCAG AA (4.5:1)
        3. Test on different background colors
      - **Testing/Verification Steps**:
        1. Run accessibility contrast audit
        2. Verify visual appearance acceptable
        3. Test on different screen sizes and themes
      - **Estimated Time**: 20 minutes
      - _Bug_Condition: isBugCondition(input) where input.accessibilityScore < 95_
      - _Expected_Behavior: expectedBehavior(result) where result.accessibilityScore >= 95_
      - _Preservation: Preservation Requirements 3.3 from design_
      - _Requirements: 3.3_

    - [x] 3.3.4 P7: Add security headers to next.config.mjs
      - **Files**: `next.config.mjs`
      - **Implementation Steps**:
        1. Add `headers()` function to Next.js config
        2. Configure security headers (X-Frame-Options, X-Content-Type-Options, etc.)
        3. Add basic Content-Security-Policy
      - **Testing/Verification Steps**:
        1. Build and deploy application
        2. Check headers with browser DevTools
        3. Verify all functionality works with CSP
      - **Estimated Time**: 15 minutes
      - _Bug_Condition: isBugCondition(input) where input.bestPracticesScore < 100_
      - _Expected_Behavior: expectedBehavior(result) where result.bestPracticesScore = 100_
      - _Preservation: Preservation Requirements 3.1, 3.2 from design_
      - _Requirements: 3.1, 3.2_

  - [x] 3.4 Verify bug condition exploration test now passes

    - **Property 1: Expected Behavior** - Performance Issues Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms performance issues are fixed)
    - _Requirements: Expected Behavior Properties from design_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Functionality Preservation Verified
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Run final Lighthouse audit to verify performance score ≥ 85
  - Verify all preservation requirements are met
  - Confirm bundle size reduction targets achieved
