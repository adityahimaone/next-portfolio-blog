'use client'

/**
 * Ravemped 4.0 — Contact Section (Patch Bay + Bounce Dialog)
 *
 * Concept: Patch bay panel — SVG cable paths animating from jack kiri ke kanan.
 * Hover cable → label URL muncul. Click → buka link.
 * Export dialog (bounce) with dropdowns + BOUNCE button.
 * BOUNCE click → mailto, then progress bar render animation.
 * Final fade: "Session saved. // aditya_himawan_2026.flp // See you in the next one."
 */

import { useState } from 'react'
import { m, useReducedMotion, AnimatePresence } from 'motion/react'
import { Mail, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionFrame } from '../r3/section-frame'

// ─── Patch Bay Data ───────────────────────────────────────

interface PatchConnection {
  id: string
  label: string
  href: string
  icon: typeof Mail
  color: string
}

const PATCHES: PatchConnection[] = [
  {
    id: 'email',
    label: 'halo@adityahimaone.space',
    href: 'mailto:halo@adityahimaone.space',
    icon: Mail,
    color: 'var(--r3-filament)',
  },
  {
    id: 'github',
    label: 'github.com/adityahimaone',
    href: 'https://github.com/adityahimaone',
    icon: Github,
    color: 'var(--r3-signal)',
  },
  {
    id: 'linkedin',
    label: 'linkedin.com/in/adityahimawan',
    href: 'https://linkedin.com/in/adityahimawan',
    icon: Linkedin,
    color: 'var(--r3-beat)',
  },
  {
    id: 'twitter',
    label: 'twitter.com/adityahimaone',
    href: 'https://twitter.com/adityahimaone',
    icon: Twitter,
    color: 'var(--r3-melody)',
  },
]

// ─── Patch Cable SVG ──────────────────────────────────────

function PatchCable({
  index,
  total,
  color,
  hovered,
}: {
  index: number
  total: number
  color: string
  hovered: boolean
}) {
  const prefersReduced = useReducedMotion()
  const yStart = 20 + (index / (total - 1)) * 60
  const yEnd = 15 + (index / (total - 1)) * 70

  // Bezier control points for cable droop
  const cx1 = 30
  const cy1 = yStart + 15
  const cx2 = 70
  const cy2 = yEnd + 15

  const path = `M 5 ${yStart} C ${cx1} ${cy1}, ${cx2} ${cy2}, 95 ${yEnd}`

  return (
    <m.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={hovered ? 3 : 2}
      strokeLinecap="round"
      opacity={hovered ? 1 : 0.5}
      initial={prefersReduced ? {} : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeInOut' }}
      style={{
        filter: hovered ? `drop-shadow(0 0 6px ${color})` : 'none',
      }}
    />
  )
}

// ─── Patch Bay Panel ──────────────────────────────────────

function PatchBayPanel() {
  const [hoveredPatch, setHoveredPatch] = useState<string | null>(null)

  return (
    <div className="r3-panel-rack p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--r3-edge)]">
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
          PATCH BAY — OUTPUT ROUTING
        </span>
        <span className="r3-mono text-[8px] text-[var(--r3-label)]">
          {PATCHES.length} connections
        </span>
      </div>

      {/* Patch bay visual */}
      <div className="flex items-center gap-4">
        {/* Left jacks */}
        <div className="flex flex-col gap-4 shrink-0">
          {PATCHES.map((patch) => {
            const Icon = patch.icon
            return (
              <div
                key={patch.id}
                className="flex items-center gap-2"
                onMouseEnter={() => setHoveredPatch(patch.id)}
                onMouseLeave={() => setHoveredPatch(null)}
              >
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 transition-all',
                    hoveredPatch === patch.id
                      ? 'shadow-[0_0_8px_currentColor]'
                      : '',
                  )}
                  style={{
                    borderColor: patch.color,
                    backgroundColor:
                      hoveredPatch === patch.id ? patch.color : 'transparent',
                  }}
                />
                <Icon
                  size={14}
                  className="text-[var(--r3-text-mute)]"
                  style={{
                    color: hoveredPatch === patch.id ? patch.color : undefined,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* SVG cables */}
        <div className="flex-1 h-[120px] relative">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {PATCHES.map((patch, i) => (
              <PatchCable
                key={patch.id}
                index={i}
                total={PATCHES.length}
                color={patch.color}
                hovered={hoveredPatch === patch.id}
              />
            ))}
          </svg>
        </div>

        {/* Right jacks + labels */}
        <div className="flex flex-col gap-4 shrink-0">
          {PATCHES.map((patch) => (
            <a
              key={patch.id}
              href={patch.href}
              target={patch.href.startsWith('mailto') ? undefined : '_blank'}
              rel={patch.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 group"
              onMouseEnter={() => setHoveredPatch(patch.id)}
              onMouseLeave={() => setHoveredPatch(null)}
            >
              <div
                className={cn(
                  'h-4 w-4 rounded-full border-2 transition-all',
                  hoveredPatch === patch.id
                    ? 'shadow-[0_0_8px_currentColor]'
                    : '',
                )}
                style={{
                  borderColor: patch.color,
                  backgroundColor:
                    hoveredPatch === patch.id ? patch.color : 'transparent',
                }}
              />
              <span
                className={cn(
                  'r3-mono text-[9px] transition-all hidden sm:inline',
                  hoveredPatch === patch.id
                    ? 'text-[var(--r3-text)]'
                    : 'text-[var(--r3-label)]',
                )}
              >
                {patch.label}
              </span>
              <ExternalLink
                size={10}
                className="text-[var(--r3-label)] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Hover tooltip (mobile-friendly) */}
      <AnimatePresence>
        {hoveredPatch && (
          <m.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-3 sm:hidden r3-panel px-3 py-2"
          >
            <span className="r3-mono text-[10px] text-[var(--r3-text)]">
              {PATCHES.find((p) => p.id === hoveredPatch)?.label}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Bounce Dialog ────────────────────────────────────────

function BounceDialog() {
  const prefersReduced = useReducedMotion()
  const [bouncing, setBouncing] = useState(false)

  const handleBounce = () => {
    setBouncing(true)
    // After animation, open mailto
    setTimeout(() => {
      window.location.href = 'mailto:halo@adityahimaone.space'
    }, 2000)
  }

  return (
    <div className="r3-panel-rack p-5 sm:p-6">
      {/* Dialog header */}
      <div className="space-y-2 border-b border-[var(--r3-edge)] pb-4 mb-4">
        <h2 className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
          EXPORT PROJECT
        </h2>
        <p className="r3-display text-lg font-semibold text-[var(--r3-text)]">
          aditya_himawan_2026.flp
        </p>
      </div>

      {/* Export settings */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
            FORMAT
          </span>
          <span className="r3-mono text-xs text-[var(--r3-text)]">
            COLLABORATION
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
            QUALITY
          </span>
          <span className="r3-mono text-xs text-[var(--r3-text)]">
            MAX (320kbps)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
            DESTINATION
          </span>
          <span className="r3-mono text-xs text-[var(--r3-filament)]">
            YOUR INBOX
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="r3-mono text-xs tracking-widest text-[var(--r3-text-mute)]">
            STEMS
          </span>
          <span className="r3-mono text-xs text-[var(--r3-text)]">
            ALL TRACKS
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {bouncing && (
        <div className="space-y-2 mb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--r3-edge)]">
            <m.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="h-full rounded-full bg-[var(--r3-filament)] shadow-[0_0_8px_var(--r3-filament)]"
            />
          </div>
          <p className="r3-mono text-[9px] text-[var(--r3-filament)] animate-pulse">
            RENDERING... BOUNCING TO DISK...
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 border-t border-[var(--r3-edge)] pt-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 rounded-sm border border-[var(--r3-edge)] bg-transparent px-3 py-2.5 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] transition-colors hover:border-[var(--r3-text-mute)] hover:text-[var(--r3-text)]"
        >
          CANCEL
        </button>
        <button
          onClick={handleBounce}
          disabled={bouncing}
          className={cn(
            'flex-1 rounded-sm border px-3 py-2.5 r3-mono text-[10px] tracking-widest transition-all',
            bouncing
              ? 'border-[var(--r3-filament)]/50 text-[var(--r3-filament)]/50 cursor-wait'
              : 'border-[var(--r3-filament)] bg-[var(--r3-filament)]/10 text-[var(--r3-filament)] hover:bg-[var(--r3-filament)]/20 hover:shadow-[0_0_12px_var(--r3-filament)]/20',
          )}
        >
          {bouncing ? 'BOUNCING...' : 'BOUNCE ▶'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────

export function ContactSection() {
  const prefersReduced = useReducedMotion()

  return (
    <SectionFrame
      id="contact"
      track="06"
      name="CONTACT"
      device="Patch Bay / Bounce"
      color="melody"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Patch Bay */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <PatchBayPanel />
        </m.div>

        {/* Bounce Dialog */}
        <m.div
          initial={prefersReduced ? false : { scale: 0.95, opacity: 0, y: 20 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <BounceDialog />
        </m.div>

        {/* Session end message */}
        <m.div
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center pt-8"
        >
          <p className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)] leading-relaxed">
            Session saved.
            <br />
            <span className="text-[var(--r3-filament)]">// aditya_himawan_2026.flp //</span>
            <br />
            See you in the next one.
          </p>
        </m.div>
      </div>
    </SectionFrame>
  )
}
