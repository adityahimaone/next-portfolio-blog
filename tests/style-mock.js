/**
 * CSS modules are a build-time concern. Jest has no pipeline for them, so a
 * suite that renders a component importing one would die on the CSS syntax
 * rather than on anything under test. Every class resolves to `undefined`,
 * which is all a render assertion needs.
 */
module.exports = new Proxy(
  {},
  { get: (_target, key) => (key === '__esModule' ? false : String(key)) },
)
