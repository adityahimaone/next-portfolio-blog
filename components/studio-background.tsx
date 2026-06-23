'use client';

import { useTheme } from 'next-themes';

export function StudioBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundColor: 'var(--chassis-bg)' }}
    >
      {/* Brushed metal texture — fine vertical hairlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(128,128,128,0.02) 1px, rgba(128,128,128,0.02) 2px)',
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: "url('/noise.png')",
          opacity: 0.04,
        }}
      />

      {/* PCB trace pattern */}
      <div className="absolute inset-0" style={{ opacity: isDark ? 0.05 : 0.03 }}>
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="pcb-traces"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              {/* Horizontal traces */}
              <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1" />
              <line x1="80" y1="40" x2="80" y2="100" stroke="currentColor" strokeWidth="1" />
              <line x1="80" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="1" />

              {/* Vertical traces */}
              <line x1="40" y1="0" x2="40" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="40" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="120" y1="60" x2="120" y2="160" stroke="currentColor" strokeWidth="1" />

              {/* Additional trace path */}
              <line x1="160" y1="100" x2="160" y2="180" stroke="currentColor" strokeWidth="1" />
              <line x1="160" y1="180" x2="200" y2="180" stroke="currentColor" strokeWidth="1" />

              {/* Junction dots */}
              <circle cx="80" cy="40" r="2.5" fill="currentColor" />
              <circle cx="80" cy="100" r="2.5" fill="currentColor" />
              <circle cx="40" cy="60" r="2.5" fill="currentColor" />
              <circle cx="120" cy="60" r="2.5" fill="currentColor" />
              <circle cx="120" cy="160" r="2" fill="currentColor" />
              <circle cx="160" cy="100" r="2.5" fill="currentColor" />
              <circle cx="160" cy="180" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcb-traces)" />
        </svg>
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)'
            : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />
    </div>
  );
}
