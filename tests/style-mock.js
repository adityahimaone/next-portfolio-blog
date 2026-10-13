/**
 * CSS Modules under Jest.
 *
 * ts-jest only transforms `.ts`/`.tsx`, so a component that imports a
 * `.module.css` file dies on load in a jsdom suite. Jest is not a browser and
 * none of these suites assert on styling, so the mapper hands back a proxy
 * that echoes the class name it was asked for — `styles.scp` is `'scp'`. That
 * is enough for a class name to reach the DOM, and it means a component can be
 * rendered in a test without the test having to know about CSS at all.
 */
module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (typeof key === 'string' ? key : undefined),
  },
)
