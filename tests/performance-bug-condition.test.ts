import * as fc from 'fast-check'
import {
  isBugCondition,
  type ApplicationLoad,
} from '../src/utils/performance-bug-condition'

/**
 * Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 *
 * This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * The test encodes the expected behavior - it will validate the fix when it passes after implementation.
 *
 * Goal: Surface counterexamples that demonstrate the performance issues exist.
 *
 * Scoped PBT Approach: For deterministic performance issues, scope the property to concrete failing cases to ensure reproducibility.
 *
 * Expected Outcome: Test FAILS (this is correct - it proves the performance issues exist)
 */

describe('Bug Condition Exploration - Performance Issues', () => {
  // Concrete failing cases based on actual performance metrics from perf-fix-plan.md
  const concreteFailingCases: ApplicationLoad[] = [
    // Case 1: LCP delay issue (4,220 ms > 2500 ms threshold)
    {
      lcpDelay: 4220,
      legacyJSPolyfills: 0,
      renderBlockingCSS: 0,
      unusedJS: 0,
      hasNonCompositedAnimations: false,
      hasVersionMismatch: false,
      lighthouseScore: 60,
    },
    // Case 2: Legacy JS polyfills issue (11 KiB > 0 KiB threshold)
    {
      lcpDelay: 0,
      legacyJSPolyfills: 11,
      renderBlockingCSS: 0,
      unusedJS: 0,
      hasNonCompositedAnimations: false,
      hasVersionMismatch: false,
      lighthouseScore: 60,
    },
    // Case 3: Render-blocking CSS issue (110 ms > 50 ms threshold)
    {
      lcpDelay: 0,
      legacyJSPolyfills: 0,
      renderBlockingCSS: 110,
      unusedJS: 0,
      hasNonCompositedAnimations: false,
      hasVersionMismatch: false,
      lighthouseScore: 60,
    },
    // Case 4: Unused JS issue (70 KiB > 20 KiB threshold)
    {
      lcpDelay: 0,
      legacyJSPolyfills: 0,
      renderBlockingCSS: 0,
      unusedJS: 70,
      hasNonCompositedAnimations: false,
      hasVersionMismatch: false,
      lighthouseScore: 60,
    },
    // Case 5: Non-composited animations issue
    {
      lcpDelay: 0,
      legacyJSPolyfills: 0,
      renderBlockingCSS: 0,
      unusedJS: 0,
      hasNonCompositedAnimations: true,
      hasVersionMismatch: false,
      lighthouseScore: 60,
    },
    // Case 6: Version mismatch issue
    {
      lcpDelay: 0,
      legacyJSPolyfills: 0,
      renderBlockingCSS: 0,
      unusedJS: 0,
      hasNonCompositedAnimations: false,
      hasVersionMismatch: true,
      lighthouseScore: 60,
    },
    // Case 7: Combined issues (real-world scenario)
    {
      lcpDelay: 4220,
      legacyJSPolyfills: 11,
      renderBlockingCSS: 110,
      unusedJS: 70,
      hasNonCompositedAnimations: true,
      hasVersionMismatch: true,
      lighthouseScore: 60,
    },
  ]

  // Property 1: Bug Condition - Performance Issues Exploration
  // For deterministic performance issues, we scope to concrete failing cases
  it('should detect bug condition on concrete failing cases', () => {
    concreteFailingCases.forEach((testCase) => {
      const result = isBugCondition(testCase)
      expect(result).toBe(true)
    })
  })

  // Property 2: Expected Behavior Properties from design
  // When bug condition is true, the application should have performance issues
  it('should validate expected behavior properties for buggy inputs', () => {
    // For all inputs where bug condition is true, we expect performance issues
    const arbitraryApplicationLoad = fc.record<ApplicationLoad>({
      lcpDelay: fc.integer({ min: 2501, max: 10000 }), // > 2500ms threshold
      legacyJSPolyfills: fc.integer({ min: 1, max: 100 }), // > 0 KiB threshold
      renderBlockingCSS: fc.integer({ min: 51, max: 500 }), // > 50ms threshold
      unusedJS: fc.integer({ min: 21, max: 500 }), // > 20KB threshold
      hasNonCompositedAnimations: fc.boolean(),
      hasVersionMismatch: fc.boolean(),
      lighthouseScore: fc.integer({ min: 0, max: 84 }), // < 85 threshold
    })

    fc.assert(
      fc.property(arbitraryApplicationLoad, (input) => {
        // The bug condition should be true for these inputs
        const isBug = isBugCondition(input)

        // Expected behavior: bug condition should be true when any performance issue exists
        const hasPerformanceIssue =
          input.lcpDelay > 2500 ||
          input.legacyJSPolyfills > 0 ||
          input.renderBlockingCSS > 50 ||
          input.unusedJS > 20 ||
          input.hasNonCompositedAnimations ||
          input.hasVersionMismatch

        return isBug === hasPerformanceIssue
      }),
      {
        verbose: true,
        numRuns: 100,
      },
    )
  })

  // Property 3: Lighthouse score correlation
  // When bug condition is true, it indicates performance issues exist
  // Note: This doesn't guarantee lighthouse score < 85, as lighthouse scores
  // are weighted averages and a single issue might not drop below threshold
  it('should validate bug condition logic consistency', () => {
    const arbitraryLoad = fc.record<ApplicationLoad>({
      lcpDelay: fc.integer({ min: 0, max: 10000 }),
      legacyJSPolyfills: fc.integer({ min: 0, max: 100 }),
      renderBlockingCSS: fc.integer({ min: 0, max: 500 }),
      unusedJS: fc.integer({ min: 0, max: 500 }),
      hasNonCompositedAnimations: fc.boolean(),
      hasVersionMismatch: fc.boolean(),
      lighthouseScore: fc.integer({ min: 0, max: 100 }),
    })

    fc.assert(
      fc.property(arbitraryLoad, (input) => {
        const isBug = isBugCondition(input)

        // Bug condition should be true when any performance issue exists
        const hasPerformanceIssue =
          input.lcpDelay > 2500 ||
          input.legacyJSPolyfills > 0 ||
          input.renderBlockingCSS > 50 ||
          input.unusedJS > 20 ||
          input.hasNonCompositedAnimations ||
          input.hasVersionMismatch

        // The bug condition function should correctly identify performance issues
        return isBug === hasPerformanceIssue
      }),
      {
        verbose: true,
        numRuns: 100,
      },
    )
  })

  // Property 4: Current Application State Test
  // This test checks the actual current application state and should NOW PASS
  // This confirms the performance issues have been fixed
  it('should confirm performance issues are fixed in current application state', () => {
    // Import the function that analyzes current performance
    const {
      analyzeCurrentPerformance,
      hasCurrentPerformanceIssues,
      meetsExpectedBehavior,
    } = require('../src/utils/performance-bug-condition')

    // Get current application metrics
    const currentMetrics = analyzeCurrentPerformance()

    // Check each performance metric against thresholds
    console.log('Current Application Performance Metrics (After Fixes):')
    console.log(
      `- LCP Delay: ${currentMetrics.lcpDelay}ms (threshold: ≤2500ms)`,
    )
    console.log(
      `- Legacy JS Polyfills: ${currentMetrics.legacyJSPolyfills}KiB (threshold: 0KiB)`,
    )
    console.log(
      `- Render-blocking CSS: ${currentMetrics.renderBlockingCSS}ms (threshold: ≤50ms)`,
    )
    console.log(
      `- Unused JS: ${currentMetrics.unusedJS}KiB (threshold: ≤20KiB)`,
    )
    console.log(
      `- Non-composited Animations: ${currentMetrics.hasNonCompositedAnimations} (threshold: false)`,
    )
    console.log(
      `- Version Mismatch: ${currentMetrics.hasVersionMismatch} (threshold: false)`,
    )
    console.log(
      `- Lighthouse Score: ${currentMetrics.lighthouseScore} (threshold: ≥85)`,
    )

    // This should be false - the application no longer has performance issues
    const hasIssues = hasCurrentPerformanceIssues()
    const meetsExpected = meetsExpectedBehavior(currentMetrics)

    // The test should NOW PASS because hasIssues is false (performance issues are fixed)
    // This confirms the bug has been fixed
    expect(hasIssues).toBe(false)
    expect(meetsExpected).toBe(true)

    // Verify each individual metric meets its threshold
    expect(currentMetrics.lcpDelay).toBeLessThanOrEqual(2500)
    expect(currentMetrics.legacyJSPolyfills).toBe(0)
    expect(currentMetrics.renderBlockingCSS).toBeLessThanOrEqual(50)
    expect(currentMetrics.unusedJS).toBeLessThanOrEqual(20)
    expect(currentMetrics.hasNonCompositedAnimations).toBe(false)
    expect(currentMetrics.hasVersionMismatch).toBe(false)
    expect(currentMetrics.lighthouseScore).toBeGreaterThanOrEqual(85)
  })
})
