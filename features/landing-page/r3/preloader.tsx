'use client'

/**
 * Ravemped 3.0 — Preloader
 * "DAW boots up. Plugins scan. Project file opens."
 *
 * Sequence: black screen → init log lines → PROJECT OPENED → fade
 * Skips entirely on return visits (sessionStorage), and respects
 * prefers-reduced-motion (collapse to instant).
 */

import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'

const BOOT_LINES = [
  { text: '> Initializing audio engine...', tone: 'mute' as const },
  { text: '> Loading VST plugins... [23/23]', tone: 'mute' as const },
  { text: '> Scanning MIDI devices...', tone: 'mute' as const },
  { text: '> Routing master bus...', tone: 'mute' as const },
  { text: '> Opening project: aditya_himawan_2026.flp', tone: 'highlight' as const },
  { text: '> Project ready. Press PLAY.', tone: 'signal' as const },
]

export function Preloader() {
  const prefersReduced = useReducedMotion()
  const [visible, setVisible] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    if (prefersReduced) {
      // skip animation, show all lines instantly, dismiss after 250ms
      setVisible(BOOT_LINES.length)
      const t = setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true
          window.dispatchEvent(new CustomEvent('r3:preloader-done'))
        }
      }, 250)
      return () => clearTimeout(t)
    }
    let i = 0
    const tick = () => {
      i++
      setVisible(i)
      if (i < BOOT_LINES.length) {
        timer = window.setTimeout(tick, 180)
      } else {
        timer = window.setTimeout(() => {
          if (!doneRef.current) {
            doneRef.current = true
            window.dispatchEvent(new CustomEvent('r3:preloader-done'))
          }
        }, 350)
      }
    }
    let timer = window.setTimeout(tick, 220)
    return () => window.clearTimeout(timer)
  }, [prefersReduced])

  return (
    <m.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--r3-studio,#090912)] r3-grid"
      aria-hidden
    >
      {/* corner brand */}
      <div className="absolute top-5 left-5 r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
        AH/DAW · v3.0.0
      </div>
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <span className="r3-led r3-led--clip r3-pulse" aria-hidden />
        <span className="r3-mono text-[10px] tracking-widest text-[var(--r3-text-mute)]">
          BOOTING
        </span>
      </div>
      <div className="absolute bottom-5 left-5 r3-mono text-[10px] text-[var(--r3-text-mute)] tabular-nums">
        120 BPM · 4/4 · -∞ dB
      </div>
      <div className="absolute bottom-5 right-5 r3-mono text-[10px] text-[var(--r3-text-mute)]">
        © 2026 aditya_himawan
      </div>

      <div className="w-full max-w-2xl px-6">
        <div className="r3-panel p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--r3-signal)]/40 to-transparent" />
          <div className="r3-label mb-4 flex justify-between">
            <span>Console / boot.log</span>
            <span>session 001</span>
          </div>
          <div className="space-y-1.5 r3-mono text-xs sm:text-sm leading-relaxed">
            {BOOT_LINES.slice(0, visible).map((line, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  line.tone === 'signal'
                    ? 'text-[var(--r3-signal)]'
                    : line.tone === 'highlight'
                      ? 'text-[var(--r3-filament)]'
                      : 'text-[var(--r3-text-mute)]'
                }
              >
                {line.text}
                {i === visible - 1 && (
                  <span className="inline-block w-2 h-3 ml-1 bg-current align-middle r3-blink" aria-hidden />
                )}
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </m.div>
  )
}

export function PreloaderLayer({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('r3:preloader-done')
  })

  useEffect(() => {
    if (!loading) return
    const onDone = () => {
      setLoading(false)
      try {
        sessionStorage.setItem('r3:preloader-done', '1')
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('r3:preloader-done', onDone)
    // safety fallback
    const t = window.setTimeout(onDone, 4000)
    return () => {
      window.removeEventListener('r3:preloader-done', onDone)
      clearTimeout(t)
    }
  }, [loading])

  return (
    <>
      <AnimatePresence mode="wait">{loading && <Preloader />}</AnimatePresence>
      {children}
    </>
  )
}
