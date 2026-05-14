'use client'

import { StageLabel, StatBar, NesTextbox } from '@/components/ui'

const CHARACTER_STATS = [
  { label: 'REACT', value: 85 },
  { label: 'NEXT.JS', value: 92 },
  { label: 'TYPESCRIPT', value: 80 },
  { label: 'MOTION', value: 62 },
  { label: 'SHIPPING', value: 90 },
]

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-32 bg-black-true"
      data-stage-num="02"
      data-stage-name="CHARACTER"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <StageLabel num="02" name="CHARACTER SELECT" glowing />

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          {/* Left: Bio */}
          <div>
            <h2 className="t-heading-l mb-6 text-white-bone">CHARACTER SELECT</h2>

            <NesTextbox>
              Frontend engineer based in Jakarta. I build performant web apps
              with React, Next.js, and TypeScript. Currently crafting products
              at Bisadaya.
            </NesTextbox>

            <div className="mt-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red animate-pulse" />
              <span className="t-hud-xs text-white-dim">
                CURRENTLY EQUIPPED · BISADAYA · FAST 8
              </span>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            <h3 className="t-heading-s mb-4 text-white-dim">STATS</h3>
            {CHARACTER_STATS.map((stat) => (
              <StatBar key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
