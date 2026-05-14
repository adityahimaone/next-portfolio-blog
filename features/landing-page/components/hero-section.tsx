'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { StageLabel } from '@/components/ui'
import { cn } from '@/lib/utils'

const Mascot3D = dynamic(
  () => import('@/components/3d/mascot-3d').then((mod) => mod.Mascot3D),
  { ssr: false, loading: () => <div className="h-64 w-64 bg-gray" /> },
)

export function HeroSection() {
  const [showPressStart, setShowPressStart] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowPressStart(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black-true"
      data-stage-num="01"
      data-stage-name="TITLE"
    >
      {/* Background pixel grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, #4A4A4D 1px, transparent 1px),
                            linear-gradient(to bottom, #4A4A4D 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient(circle at 50% 100%, transparent 30%, #0A0A0A 80%)" />

      {/* Top HUD overlay */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <StageLabel num="01" name="TITLE" glowing />
        <div className="t-hud-xs text-white-dim">v26</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        {/* Mascot 3D */}
        <div className="mb-8 flex justify-center">
          <Mascot3D />
        </div>

        {/* Title */}
        <h1 className="t-title-xl mb-2 text-white-bone">
          ADIT HIMAONE
        </h1>
        <p className="t-heading-s mb-12 text-white-dim uppercase tracking-widest">
          FRONTEND ENGINEER · v26
        </p>

        {/* Press Start CTA */}
        <button
          className={cn(
            't-heading-m mx-auto block border-2 border-white-bone bg-black-true px-8 py-4 text-white-bone transition-all hover:border-red hover:bg-red/10 hover:text-red',
            showPressStart && 'animate-pulse',
          )}
          style={{ animationDuration: '1s' }}
          onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          PRESS START
        </button>
      </div>

      {/* Bottom HUD overlay */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="t-hud-xs text-white-dim">P1 · READY</div>
        <div className="t-hud-xs text-white-dim">© FIRSTPARTY</div>
      </div>
    </section>
  )
}
