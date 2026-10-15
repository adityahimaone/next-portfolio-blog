import type { ReactNode } from 'react'

/**
 * The cast's artwork.
 *
 * Every entry is one self-contained SVG, and that is a contract rather than a
 * convenience: the flight cap is counted in cast members, not in SVG nodes, so
 * a part may be as mechanically detailed as it likes as long as it stays one
 * `<svg>`. That is what lets each object read as a real piece of hardware —
 * a knob with a mounting plate and tick marks, a fader with a scale and a meter
 * beside it — without the flight set growing.
 *
 * Three drawing rules hold across the whole set, and they are what make the
 * objects look like one machine rather than a sticker sheet:
 *
 * 1. **One stroke language.** A 2-unit `currentColor` stroke with
 *    `vector-effect: non-scaling-stroke`, so every outline stays a hairline at
 *    any scale instead of becoming a slab at 2.6×.
 * 2. **One fill for panels.** Mounting plates, caps and shells are
 *    `var(--background)` — the surface the machine is standing on — so the
 *    parts read as cut out of the page rather than as tinted cards.
 * 3. **One accent.** `var(--primary)` is reserved for the indicator, the live
 *    pad, the stylus and the playhead. Nothing else is allowed to use it, which
 *    is what keeps the accent meaning "signal" instead of meaning "decoration".
 *
 * No invented brand, product name, specification or measurement appears
 * anywhere in here. The marks are abstract on purpose.
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
} as const
const svg = (children: ReactNode) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
    {children}
  </svg>
)

export const MATTER_PARTS: Record<string, ReactNode> = {
  // Mounting plate, outer ring, tick ring, cap, indicator line, corner screws.
  'knob-a': svg(
    <>
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="16"
        {...S}
        fill="var(--background)"
      />
      <circle
        cx="50"
        cy="50"
        r="32"
        {...S}
        strokeWidth="3"
        fill="var(--background)"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        {...S}
        strokeDasharray="1.6 5.4"
        opacity=".6"
      />
      <circle cx="50" cy="50" r="20" {...S} opacity=".55" />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="26"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="2.4" fill="currentColor" opacity=".45" />
      <circle cx="86" cy="14" r="2.4" fill="currentColor" opacity=".45" />
    </>,
  ),

  // Rubber pad grid, one live pad, panel screws.
  'pad-a': svg(
    <>
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="12"
        {...S}
        fill="var(--background)"
      />
      <rect x="18" y="18" width="28" height="28" rx="5" {...S} opacity=".7" />
      <rect x="54" y="18" width="28" height="28" rx="5" {...S} opacity=".7" />
      <rect x="18" y="54" width="28" height="28" rx="5" {...S} opacity=".7" />
      <rect
        x="54"
        y="54"
        width="28"
        height="28"
        rx="5"
        fill="var(--primary)"
        opacity=".85"
      />
      <circle cx="13" cy="13" r="1.8" fill="currentColor" opacity=".5" />
      <circle cx="87" cy="13" r="1.8" fill="currentColor" opacity=".5" />
      <circle cx="13" cy="87" r="1.8" fill="currentColor" opacity=".5" />
      <circle cx="87" cy="87" r="1.8" fill="currentColor" opacity=".5" />
    </>,
  ),

  // Slot, scale ticks, capped fader with grip lines, adjacent meter.
  fader: svg(
    <>
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="10"
        {...S}
        fill="var(--background)"
      />
      <line x1="34" y1="14" x2="34" y2="86" {...S} opacity=".5" />
      <line x1="22" y1="20" x2="28" y2="20" {...S} opacity=".45" />
      <line x1="22" y1="38" x2="28" y2="38" {...S} opacity=".45" />
      <line x1="22" y1="56" x2="28" y2="56" {...S} opacity=".45" />
      <line x1="22" y1="74" x2="28" y2="74" {...S} opacity=".45" />
      <rect
        x="22"
        y="44"
        width="24"
        height="18"
        rx="3"
        {...S}
        strokeWidth="2.5"
        fill="var(--background)"
      />
      <line
        x1="26"
        y1="49"
        x2="42"
        y2="49"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      <line
        x1="26"
        y1="53"
        x2="42"
        y2="53"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      <line
        x1="26"
        y1="57"
        x2="42"
        y2="57"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      <rect x="60" y="20" width="20" height="60" rx="3" {...S} opacity=".7" />
      <line x1="65" y1="74" x2="75" y2="74" {...S} opacity=".5" />
      <line x1="65" y1="62" x2="75" y2="62" {...S} opacity=".5" />
      <line x1="65" y1="50" x2="75" y2="50" {...S} opacity=".5" />
      <line x1="65" y1="38" x2="75" y2="38" {...S} opacity=".5" />
    </>,
  ),

  // Timeline lane, filled clip, start marker, waveform.
  'clip-a': svg(
    <>
      <line x1="0" y1="50" x2="100" y2="50" {...S} opacity=".28" />
      <rect
        x="6"
        y="28"
        width="88"
        height="44"
        rx="5"
        fill="var(--primary)"
        opacity=".85"
      />
      <line
        x1="6"
        y1="24"
        x2="6"
        y2="76"
        stroke="var(--background)"
        strokeWidth="2"
        opacity=".9"
      />
      <polyline
        points="12,50 20,38 28,60 38,34 48,62 58,40 68,58 78,42 88,52"
        fill="none"
        stroke="var(--background)"
        strokeWidth="2.5"
      />
    </>,
  ),

  // The same lane, an empty clip, its own waveform.
  'clip-b': svg(
    <>
      <line x1="0" y1="50" x2="100" y2="50" {...S} opacity=".28" />
      <rect
        x="6"
        y="28"
        width="88"
        height="44"
        rx="5"
        {...S}
        fill="var(--background)"
      />
      <line x1="6" y1="24" x2="6" y2="76" {...S} strokeWidth="2" opacity=".5" />
      <polyline
        points="12,50 22,44 32,56 44,38 56,60 68,46 80,52 88,50"
        {...S}
        opacity=".7"
      />
    </>,
  ),

  // Shell, label strip, window, two reels with hubs, tape path.
  cassette: svg(
    <>
      <rect
        x="6"
        y="22"
        width="88"
        height="58"
        rx="6"
        {...S}
        fill="var(--background)"
      />
      <rect x="14" y="28" width="72" height="9" rx="2" {...S} opacity=".45" />
      <rect x="20" y="42" width="60" height="24" rx="4" {...S} opacity=".7" />
      <circle cx="34" cy="54" r="7.5" {...S} />
      <circle cx="66" cy="54" r="7.5" {...S} />
      <circle cx="34" cy="54" r="2" fill="var(--primary)" />
      <circle cx="66" cy="54" r="2" fill="var(--primary)" />
      <path d="M28 74 H72" {...S} opacity=".5" />
    </>,
  ),

  // Curved cable, jack body, strain relief, destination plug.
  cable: svg(
    <>
      <path
        d="M10 74 C 30 14, 62 98, 90 34"
        {...S}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="2" y="66" width="16" height="16" rx="4" fill="currentColor" />
      <rect x="19" y="71" width="8" height="6" rx="2" {...S} strokeWidth="2" />
      <rect x="82" y="24" width="16" height="14" rx="4" fill="var(--primary)" />
      <line
        x1="90"
        y1="24"
        x2="90"
        y2="16"
        stroke="var(--primary)"
        strokeWidth="2.5"
      />
    </>,
  ),

  // Headband, two ear cups, cup detail, cable exit.
  phones: svg(
    <>
      <path
        d="M18 60 V48 A32 32 0 0 1 82 48 V60"
        {...S}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="56"
        width="18"
        height="30"
        rx="7"
        {...S}
        fill="var(--background)"
      />
      <rect
        x="74"
        y="56"
        width="18"
        height="30"
        rx="7"
        {...S}
        fill="var(--background)"
      />
      <line x1="17" y1="62" x2="17" y2="80" {...S} opacity=".4" />
      <line x1="83" y1="62" x2="83" y2="80" {...S} opacity=".4" />
      <path d="M26 86 C 30 96, 44 92, 50 96" {...S} strokeWidth="2.5" />
    </>,
  ),

  // Platter, record, groove rings, label, spindle, tonearm, stylus, cue light.
  vinyl: svg(
    <>
      <circle cx="46" cy="52" r="42" {...S} fill="var(--background)" />
      <circle cx="46" cy="52" r="36" {...S} />
      <circle cx="46" cy="52" r="30" {...S} opacity=".35" />
      <circle cx="46" cy="52" r="24" {...S} opacity=".35" />
      <circle cx="46" cy="52" r="18" {...S} opacity=".35" />
      <circle cx="46" cy="52" r="11" fill="var(--primary)" opacity=".9" />
      <circle cx="46" cy="52" r="1.8" fill="var(--background)" />
      <circle cx="88" cy="16" r="6" {...S} fill="var(--background)" />
      <line x1="88" y1="16" x2="60" y2="44" {...S} strokeWidth="2.5" />
      <polygon points="60,44 55,50 62,52" fill="var(--primary)" />
      <circle cx="16" cy="88" r="3.5" fill="var(--primary)" />
    </>,
  ),

  // Adjacent keys hinted at the edges, bevel, one accent mark.
  'key-a': svg(
    <>
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="10"
        {...S}
        fill="var(--background)"
      />
      <rect x="18" y="18" width="64" height="64" rx="6" {...S} opacity=".4" />
      <line x1="30" y1="50" x2="70" y2="50" {...S} />
      <circle cx="88" cy="50" r="3" {...S} opacity=".4" />
      <circle cx="12" cy="50" r="3" {...S} opacity=".4" />
    </>,
  ),
  'key-b': svg(
    <>
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="10"
        {...S}
        fill="var(--background)"
      />
      <rect x="18" y="18" width="64" height="64" rx="6" {...S} opacity=".4" />
      <circle cx="50" cy="50" r="13" {...S} />
      <circle cx="88" cy="50" r="3" {...S} opacity=".4" />
      <circle cx="12" cy="50" r="3" {...S} opacity=".4" />
    </>,
  ),
  'key-c': svg(
    <>
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="10"
        {...S}
        fill="var(--background)"
      />
      <rect x="18" y="18" width="64" height="64" rx="6" {...S} opacity=".4" />
      <path d="M36 66 L50 32 L64 66 Z" {...S} />
      <line
        x1="50"
        y1="58"
        x2="50"
        y2="70"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <circle cx="88" cy="50" r="3" {...S} opacity=".4" />
      <circle cx="12" cy="50" r="3" {...S} opacity=".4" />
    </>,
  ),

  // Socket plate, ring, plug, cable continuation, plate screws.
  jack: svg(
    <>
      <rect
        x="6"
        y="30"
        width="52"
        height="40"
        rx="8"
        {...S}
        fill="var(--background)"
      />
      <circle cx="32" cy="50" r="15" {...S} opacity=".7" />
      <circle cx="32" cy="50" r="8" {...S} />
      <circle cx="32" cy="50" r="2.5" fill="var(--primary)" />
      <rect x="58" y="42" width="20" height="16" rx="3" fill="var(--primary)" />
      <path d="M78 50 C 86 50, 88 58, 96 58" {...S} strokeWidth="2.5" />
      <circle cx="14" cy="38" r="1.8" fill="currentColor" opacity=".5" />
      <circle cx="50" cy="38" r="1.8" fill="currentColor" opacity=".5" />
    </>,
  ),

  // Track lane, ruler ticks, triangular head, signal pulse.
  playhead: svg(
    <>
      <line x1="0" y1="58" x2="100" y2="58" {...S} opacity=".3" />
      <line x1="14" y1="66" x2="14" y2="72" {...S} opacity=".4" />
      <line x1="34" y1="66" x2="34" y2="72" {...S} opacity=".4" />
      <line x1="54" y1="66" x2="54" y2="72" {...S} opacity=".4" />
      <line x1="74" y1="66" x2="74" y2="72" {...S} opacity=".4" />
      <path
        d="M0 58 C 14 44, 24 70, 38 58 S 62 44, 76 58 S 92 70, 100 58"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        opacity=".8"
      />
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="58"
        stroke="var(--primary)"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
      <polygon points="50,10 72,22 50,34" fill="var(--primary)" />
    </>,
  ),
}
