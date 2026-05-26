'use client'

import { ParallaxLayer } from './parallax-layer'
import { motion } from 'motion/react'

export function HeroSectionV4() {
  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-dark-surface)' }}
    >
      {/* Layer 0: Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: 'var(--color-dark-surface)' }}
      />

      {/* Layer 1: Illustration A — classical landscape painting (placeholder) */}
      <ParallaxLayer speed={0.10} className="absolute inset-0 z-[1] md:block">
        <div
          className="absolute inset-0 scale-[1.15]"
          style={{
            opacity: 0.6,
            background:
              'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 50%, #0F0F0F 100%)',
          }}
          data-cursor="image"
        />
      </ParallaxLayer>

      {/* Layer 2: Illustration B — figure/portrait, positioned right (placeholder) */}
      <ParallaxLayer speed={0.25} className="absolute inset-0 z-[2] md:block">
        <div
          className="absolute inset-0 translate-x-[15%]"
          style={{
            opacity: 0.35,
            background:
              'linear-gradient(90deg, transparent 0%, #3A3A3A 30%, #2A2A2A 70%, transparent 100%)',
          }}
          data-cursor="image"
        />
      </ParallaxLayer>

      {/* Layer 3: Radial gradient vignette */}
      <div className="absolute inset-0 z-[3]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(15,15,15,0.7) 100%)',
          }}
        />
      </div>

      {/* Layer 4: Content — centered */}
      <ParallaxLayer
        speed={0.55}
        className="absolute inset-0 z-[4] flex items-center justify-center"
      >
        <div className="hero-content flex flex-col items-center px-4 text-center md:px-0">
          {/* Label */}
          <div
            className="font-[family-name:var(--font-ui)] mb-4 uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'var(--color-off-white)',
            }}
          >
            FRONTEND DEVELOPER
          </div>

          {/* Line */}
          <div
            className="mb-8"
            style={{
              width: '80px',
              height: '1px',
              backgroundColor: 'var(--color-off-white)',
            }}
          />

          {/* Name */}
          <h1 className="font-[family-name:var(--font-display)] leading-none">
            <span
              className="block text-[72px] md:text-[140px]"
              style={{
                letterSpacing: '-0.009em',
                color: 'var(--color-off-white)',
                lineHeight: 0.9,
              }}
            >
              ADITYA
            </span>
            <span
              className="block text-[72px] md:text-[140px]"
              style={{
                letterSpacing: '-0.009em',
                color: 'var(--color-off-white)',
                lineHeight: 0.9,
              }}
            >
              HIMAONE
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-[family-name:var(--font-ui)] mt-8 max-w-[420px]"
            style={{
              fontSize: '15px',
              color: 'var(--color-off-white)',
              lineHeight: 1.6,
            }}
          >
            Orchestrating code and rhythm into immersive digital experiences.
          </p>

          {/* CTA Button */}
          <a
            href="#about"
            className="font-[family-name:var(--font-ui)] mt-10 inline-flex items-center justify-center px-8 py-3 transition-colors hover:bg-white/10"
            style={{
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-off-white)',
              border: '1px solid var(--color-off-white)',
              borderRadius: '0px',
            }}
            data-cursor="link"
          >
            EXPLORE WORK ↓
          </a>
        </div>
      </ParallaxLayer>
    </section>
  )
}
