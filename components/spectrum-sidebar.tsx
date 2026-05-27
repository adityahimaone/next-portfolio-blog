'use client'

import { m } from 'motion/react'

export function SpectrumSidebar() {
  const bands = [
    { label: '63Hz', value: 0.15 },
    { label: '125Hz', value: 0.3 },
    { label: '250Hz', value: 0.5 },
    { label: '500Hz', value: 0.7 },
    { label: '1kHz', value: 0.6 },
    { label: '2kHz', value: 0.4 },
    { label: '4kHz', value: 0.25 },
    { label: '8kHz', value: 0.2 },
    { label: '16kHz', value: 0.15 },
  ]

  return (
    <m.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
    >
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase rotate-90">
          SPL
        </span>
        <div className="flex h-[180px] flex-col items-end gap-2">
          {bands.map((band, index) => (
            <m.div
              key={index}
              initial={{ scaleY: band.value }}
              whileInView={{ scaleY: band.value + 0.2 }}
              transition={{ duration: 0.8, delay: index * 0.1, type: 'spring', stiffness: 300 }}
              className="relative"
            >
              <div
                className="h-[160px] w-px bg-[linear-gradient(to_top,var(--accent-green)_0%,var(--accent-amber)_60%,var(--accent-red)_100%)]"
                style={{
                  maskImage:
                    'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-0.5 text-[8px] font-mono text-zinc-500">
                {band.label}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </m.div>
  )
}
