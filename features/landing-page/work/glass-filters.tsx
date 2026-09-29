/**
 * Hidden SVG filter used by `.glassRefract` for real displacement. Mounted once
 * per section; the browser only applies it where a rule opts in via
 * `backdrop-filter: url(#glass-refract)`.
 */
export function GlassFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute' }}
    >
      <defs>
        <filter id="glass-refract" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation={2} result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale={28}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
