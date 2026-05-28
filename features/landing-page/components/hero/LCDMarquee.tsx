'use client'

import { useRef, useEffect } from 'react'
import { m } from 'motion/react'

const TICKER_TEXTS = [
  'ADITYA HIMAONE — FRONTEND DEVELOPER & AUDIO ENTHUSIAST',
  'REACT · NEXT.JS · TAILWIND · TYPESCRIPT · FRAMER MOTION',
  'JAKARTA, INDONESIA — AVAILABLE FOR PROJECTS',
  'SIGNAL CHAIN — TEENAGE ENGINEERING FIELD SERIES',
  '⊕ CODING · RHYTHM · IMMERSIVE DIGITAL EXPERIENCES ⊕',
]

const DOUBLE_TICKER = [...TICKER_TEXTS, ...TICKER_TEXTS]

interface LCDMarqueeProps {
  className?: string
  speed?: number // pixels per second
}

export function LCDMarquee({ className, speed = 60 }: LCDMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    let offset = 0
    let raf = 0
    const trackWidth = track.scrollWidth / 2 // half because duplicated

    const animate = () => {
      offset += speed / 60 // 60fps approximation
      if (offset >= trackWidth) offset = 0
      track.style.transform = `translateX(-${offset}px)`
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        background: '#1A1A0A',
        borderTop: '1px solid rgba(255,176,0,0.1)',
        borderBottom: '1px solid rgba(255,176,0,0.1)',
      }}
    >
      {/* Glow top/bottom */}
      <div className="absolute top-0 left-0 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,176,0,0.3), transparent)' }} />
      <div className="absolute bottom-0 left-0 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,176,0,0.3), transparent)' }} />

      {/* Top track — scrolling right to left */}
      <div
        ref={trackRef}
        className="flex items-center py-3 whitespace-nowrap"
        style={{
          fontFamily: 'var(--sc-font-mono)',
          color: '#FFB000',
          textShadow: '0 0 6px rgba(255,176,0,0.35)',
          fontSize: 'clamp(11px, 1.5vw, 14px)',
          letterSpacing: '0.15em',
        }}
      >
        {DOUBLE_TICKER.map((text, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-4">
            <span style={{ color: '#555' }}>●</span>
            {text}
          </span>
        ))}
      </div>

      {/* Scanline overlay */}
      <div className="sc-scanlines pointer-events-none absolute inset-0 z-10" />
    </div>
  )
}
