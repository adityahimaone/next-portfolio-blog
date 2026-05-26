'use client'

/**
 * Ravemped 3.0 — Blog Section (DJ Controller pads)
 *
 * Blog posts = hot cue pads, siap di-trigger.
 * Grid 4x2 pads (mobile: 2x4). Placeholder karena belum ada posts.
 */

import { useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { ArrowUpRight, Music, FileText, Code, Sparkles } from 'lucide-react'
import { SectionFrame } from '../r3/section-frame'

const PADS = [
  { id: '01', title: 'Deploy Next.js to VPS', tag: 'devops', read: '8 min', icon: Code, featured: true },
  { id: '02', title: 'SEO Job Posting untuk Google Jobs', tag: 'seo', read: '6 min', icon: FileText },
  { id: '03', title: 'Hermes Agent Setup', tag: 'agents', read: '12 min', icon: Sparkles },
  { id: '04', title: 'Music Production Workflow', tag: 'music', read: '10 min', icon: Music },
  { id: '05', title: 'Tailwind v4 Migration', tag: 'css', read: '7 min', icon: Code },
  { id: '06', title: 'React Server Components Deep Dive', tag: 'react', read: '15 min', icon: Code },
  { id: '07', title: 'VPS Monitoring Stack', tag: 'devops', read: '9 min', icon: Sparkles },
  { id: '08', title: 'Portfolio Redesign Notes', tag: 'design', read: '5 min', icon: FileText },
]

export function BlogSection() {
  const prefersReduced = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <SectionFrame
      id="blog"
      track="05"
      name="BLOG"
      device="DJ Controller / Hot Cues"
      color="filament"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PADS.map((pad) => {
            const Icon = pad.icon
            const isFeatured = pad.featured
            const isHovered = hovered === pad.id
            return (
              <Link
                key={pad.id}
                href="/blog"
                className="group relative block"
                onMouseEnter={() => setHovered(pad.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <m.div
                  initial={prefersReduced ? false : { scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: parseInt(pad.id) * 0.05 }}
                  className={`
                    r3-panel-rack relative flex aspect-square flex-col justify-between overflow-hidden p-4
                    ${isFeatured ? 'border-[var(--r3-filament)]' : 'border-[var(--r3-edge)]'}
                    ${isHovered ? 'border-[var(--r3-filament)]' : ''}
                    transition-colors
                  `}
                >
                  {/* Pad number */}
                  <div className="flex items-center justify-between">
                    <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
                      {pad.id}
                    </span>
                    <Icon className="h-3 w-3 text-[var(--r3-text-mute)]" strokeWidth={1.75} aria-hidden />
                  </div>

                  {/* Title */}
                  <h3 className="r3-display text-sm font-semibold leading-tight text-[var(--r3-text)]">
                    {pad.title}
                  </h3>

                  {/* Tag + read time */}
                  <div className="flex items-center justify-between">
                    <span className="r3-mono text-[9px] tracking-widest text-[var(--r3-text-mute)]">
                      {pad.tag}
                    </span>
                    <span className="r3-mono text-[9px] text-[var(--r3-text-mute)]">
                      {pad.read}
                    </span>
                  </div>

                  {/* Waveform preview on hover */}
                  {isHovered && (
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex h-4 items-end gap-0.5">
                        {[2, 4, 6, 8, 6, 4, 2].map((h, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-[var(--r3-filament)]"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </m.div>
                  )}

                  {/* Glow for featured */}
                  {isFeatured && (
                    <div className="pointer-events-none absolute inset-0 border border-[var(--r3-filament)]/30 [box-shadow:0_0_20px_rgba(255,213,128,0.15)]" />
                  )}
                </m.div>
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-[var(--r3-edge)] pt-6 sm:flex-row sm:justify-between">
          <p className="r3-prose text-sm leading-relaxed text-[var(--r3-text-mute)]">
            Each pad is a hot cue — jump straight to the post.
            <br className="hidden sm:block" />
            Full blog at <Link href="/blog" className="text-[var(--r3-filament)] hover:underline">/blog</Link>.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--r3-edge)] bg-[var(--r3-rack)] px-3 py-2 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:border-[var(--r3-filament)] hover:text-[var(--r3-filament)]"
          >
            VIEW ALL POSTS <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </SectionFrame>
  )
}
