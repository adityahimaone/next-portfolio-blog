'use client'

/**
 * Editorial v4 — Music Section
 *
 * Two-column layout: NowPlayingCard (left) + prose (right)
 * Background: --color-slate (#C4C3B6)
 * Parallax background layer with subtle gradient
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ParallaxLayer } from './parallax-layer'
import { NowPlayingCard } from './now-playing-card'

export function MusicSectionV4() {
  const prefersReduced = useReducedMotion()
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section
      id="music"
      className="relative overflow-hidden bg-[var(--color-slate)] py-24"
    >
      {/* Background parallax illustration placeholder */}
      <ParallaxLayer speed={0.12} className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full opacity-[0.08]"
          style={{
            background:
              'radial-gradient(ellipse at 70% 50%, rgba(0,0,0,0.3) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(89,88,85,0.4) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />
      </ParallaxLayer>

      {/* Content */}
      <div className="relative z-[1] mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-12 md:gap-8 items-center">
          {/* Left — Now Playing Card */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <NowPlayingCard
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
            />
          </motion.div>

          {/* Right — Prose */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Label */}
            <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent-grey)]">
              The Soundtrack
            </p>

            {/* Title */}
            <h2 className="font-display text-xl text-[var(--color-ink)] leading-tight">
              Music is how I think.
            </h2>

            {/* Body */}
            <div className="space-y-4">
              <p className="font-ui text-sm text-[var(--color-ink)]/80 leading-relaxed">
                Every project has a rhythm. Whether I&apos;m deep in a complex refactor or
                sketching out a new interface, there&apos;s always a track playing in the
                background shaping the tempo of my work.
              </p>
              <p className="font-ui text-sm text-[var(--color-ink)]/80 leading-relaxed">
                From ambient textures during focus sessions to driving beats when shipping
                features — music isn&apos;t just background noise, it&apos;s part of the
                creative process. Here&apos;s what&apos;s been on rotation.
              </p>
            </div>

            {/* CTA — Ghost button */}
            <div>
              <a
                href="/music"
                className="inline-block border border-[var(--color-ink)] bg-transparent px-6 py-3 font-ui text-[13px] uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-canvas)]"
                style={{ borderRadius: 'var(--radius-button)' }}
              >
                Explore Mixtape →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
