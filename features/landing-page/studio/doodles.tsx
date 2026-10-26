/**
 * The page's own sticker drawer. Every shape is drawn here rather than fetched,
 * and the colours come from the same six-value palette the footer uses.
 */

type DoodleProps = {
  className?: string
  title?: string
}

const svgProps = (title?: string) =>
  title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const, focusable: 'false' as const }

export function Sun({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...svgProps(title)}>
      <g stroke="var(--ink, #191a2e)" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          const x1 = 100 + Math.cos(a) * 74
          const y1 = 100 + Math.sin(a) * 74
          const x2 = 100 + Math.cos(a) * 93
          const y2 = 100 + Math.sin(a) * 93
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="var(--butter, #ffd23f)"
        stroke="var(--ink, #191a2e)"
        strokeWidth="4"
      />
      <circle cx="79" cy="94" r="5.5" fill="var(--ink, #191a2e)" />
      <circle cx="121" cy="94" r="5.5" fill="var(--ink, #191a2e)" />
      <path
        d="M77 116Q100 139 123 116"
        fill="none"
        stroke="var(--ink, #191a2e)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse
        cx="65"
        cy="110"
        rx="10"
        ry="6"
        fill="var(--tangerine, #ff6a2b)"
        opacity=".55"
      />
      <ellipse
        cx="135"
        cy="110"
        rx="10"
        ry="6"
        fill="var(--tangerine, #ff6a2b)"
        opacity=".55"
      />
    </svg>
  )
}

export function Smiley({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps(title)}>
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="var(--cobalt, #3d53d6)"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="8"
      />
      <ellipse
        cx="44"
        cy="50"
        rx="4.5"
        ry="8"
        fill="var(--paper-hi, #fffaf1)"
      />
      <ellipse
        cx="76"
        cy="50"
        rx="4.5"
        ry="8"
        fill="var(--paper-hi, #fffaf1)"
      />
      <path
        d="M34 68Q60 94 86 68M30 64L38 71M90 64L82 71"
        fill="none"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Daisy({ className, title }: DoodleProps) {
  const petals = Array.from({ length: 9 }, (_, i) => (
    <ellipse
      key={i}
      cx="60"
      cy="32"
      rx="13"
      ry="23"
      transform={`rotate(${i * 40} 60 60)`}
    />
  ))
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps(title)}>
      <g
        fill="var(--butter, #ffd23f)"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="7"
        strokeLinejoin="round"
      >
        {petals}
      </g>
      <circle cx="60" cy="60" r="19" fill="var(--tangerine, #ff6a2b)" />
      <circle cx="53.5" cy="57" r="2.6" fill="var(--ink, #191a2e)" />
      <circle cx="66.5" cy="57" r="2.6" fill="var(--ink, #191a2e)" />
      <path
        d="M53 65Q60 71 67 65"
        fill="none"
        stroke="var(--ink, #191a2e)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Burst({
  className,
  text = 'hi!',
  title,
}: DoodleProps & { text?: string }) {
  const points = 13
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? 39 : 54
    pts.push(`${60 + Math.cos(a) * r} ${60 + Math.sin(a) * r}`)
  }
  return (
    <svg viewBox="-4 -4 128 128" className={className} {...svgProps(title)}>
      <path
        d={`M${pts.join('L')}Z`}
        fill="var(--tangerine, #ff6a2b)"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fontFamily="var(--font-syne), var(--font-space-grotesk), sans-serif"
        fontWeight="800"
        fontSize="27"
        fill="var(--ink, #191a2e)"
        letterSpacing="-1"
      >
        {text}
      </text>
    </svg>
  )
}

export function Heart({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps(title)}>
      <path
        d="M60 102C22 78 10 57 18 39C26 21 50 19 60 39C70 19 94 21 102 39C110 57 98 78 60 102Z"
        fill="var(--pink, #ffb6e1)"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M31 44Q33 31 46 30"
        fill="none"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Bolt({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps(title)}>
      <path
        d="M70 8L26 66H55L44 112L94 48H64Z"
        fill="var(--butter, #ffd23f)"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M64 24L40 56"
        fill="none"
        stroke="var(--paper-hi, #fffaf1)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".8"
      />
    </svg>
  )
}

export function Sparkle({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...svgProps(title)}>
      <path
        d="M20 2C21 14 26 19 38 20C26 21 21 26 20 38C19 26 14 21 2 20C14 19 19 14 20 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Squiggle({ className, title }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 220 16"
      className={className}
      preserveAspectRatio="none"
      {...svgProps(title)}
    >
      <path
        d="M3 11C24 3 40 3 58 9S94 15 112 9S148 2 166 8S198 13 217 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ArrowDown({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 90" className={className} {...svgProps(title)}>
      <path
        d="M30 3C31 26 27 48 24 74"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M8 60L24 79L40 58"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowUpRight({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps(title)}>
      <path
        d="M6 18L18 6M9 6h9v9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Atom({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgProps(title)}>
      <g fill="none" stroke="currentColor" strokeWidth="2.4">
        <ellipse cx="60" cy="60" rx="50" ry="19" />
        <ellipse cx="60" cy="60" rx="50" ry="19" transform="rotate(60 60 60)" />
        <ellipse
          cx="60"
          cy="60"
          rx="50"
          ry="19"
          transform="rotate(120 60 60)"
        />
      </g>
      <circle cx="60" cy="60" r="7" fill="currentColor" />
    </svg>
  )
}

export function GithubMark({ className, title }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svgProps(title)}>
      <path
        d="M12 2.4A9.6 9.6 0 0 0 8.96 21.1C9.44 21.19 9.62 20.9 9.62 20.65V18.8C6.73 19.43 6.16 17.56 6.16 17.56C5.72 16.44 5.08 16.14 5.08 16.14C4.2 15.54 5.15 15.55 5.15 15.55C6.12 15.62 6.63 16.55 6.63 16.55C7.5 18.04 8.9 17.61 9.66 17.32C9.75 16.69 10.01 16.27 10.3 16.02C8.09 15.77 5.77 14.92 5.77 11.34C5.77 10.31 6.14 9.47 6.75 8.81C6.65 8.56 6.32 7.6 6.85 6.26C6.85 6.26 7.65 6 9.65 7.31C10.43 7.1 11.25 6.99 12.08 6.99C12.9 6.99 13.72 7.1 14.5 7.31C16.5 6 17.3 6.26 17.3 6.26C17.83 7.6 17.5 8.56 17.4 8.81C18.01 9.47 18.38 10.31 18.38 11.34C18.38 14.93 16.06 15.77 13.84 16.01C14.2 16.32 14.53 16.93 14.53 17.86V20.65C14.53 20.9 14.7 21.2 15.19 21.1A9.6 9.6 0 0 0 12 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
