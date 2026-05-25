'use client'

import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence, useInView } from 'motion/react'
import { Calendar, MapPin, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPERIENCES } from '../constants'

const T = [0.34, 1.56, 0.64, 1] as const

/* ─── Tape Reel ─── */
function TapeReel() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <m.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-[3px]" style={{ borderColor: 'var(--color-ochre)' }} />
      <m.div animate={{ rotate: -360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        className="h-12 w-12 rounded-full border-2" style={{ borderColor: 'var(--color-ochre)', opacity: 0.7 }} />
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 96 96" fill="none">
        <line x1="48" y1="8" x2="48" y2="88" stroke="var(--color-ochre)" strokeWidth="1.5" opacity="0.3" />
        <line x1="8" y1="48" x2="88" y2="48" stroke="var(--color-ochre)" strokeWidth="1.5" opacity="0.3" />
      </svg>
    </div>
  )
}

/* ─── LED ─── */
function Led({ s }: { s: 'active' | 'completed' | 'current' }) {
  const c = { active: 'var(--color-ochre)', completed: 'var(--color-moss)', current: 'var(--color-terracotta)' }
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c[s] }} />
}

/* ─── Mute/Solo ─── */
function Ms({ l }: { l: string }) {
  return (
    <button className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
      style={{ backgroundColor: 'var(--color-surface)', color: l === 'MUTE' ? 'var(--color-terracotta)' : 'var(--color-ochre)', border: '1px solid var(--color-border-subtle)' }}>
      {l}
    </button>
  )
}

/* ─── Tape Segment (for group items) ─── */
function TSeg({ role, company, period, description, i }: { role: string; company: string; period: string; description: string; i: number }) {
  const ref = useRef(null)
  const iv = useInView(ref, { once: true, margin: '-40px' })
  return (
    <m.div ref={ref} initial={{ opacity: 0, x: -40 }} animate={iv ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.12, ease: T }}
      className="relative rounded-lg border p-4" style={{ borderColor: 'var(--color-border-subtle)', background: 'linear-gradient(135deg, var(--color-surface), var(--color-bg-tertiary, oklch(0.20 0.02 30)))' }}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{role}</h4>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{company}</span>
        </div>
        <span className="whitespace-nowrap text-[10px] uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}>{period}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{description}</p>
    </m.div>
  )
}

/* ─── Main ─── */
export function ExperienceSection() {
  const [sid, setSid] = useState(EXPERIENCES[0].id)
  const job = EXPERIENCES.find((e) => e.id === sid) || EXPERIENCES[0]
  const sr = useRef<HTMLElement>(null)
  const siv = useInView(sr, { once: true, margin: '-80px' })

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '[') { e.preventDefault(); const p = EXPERIENCES.findIndex((x) => x.id === sid) - 1; setSid(EXPERIENCES[(p + EXPERIENCES.length) % EXPERIENCES.length].id) }
      if (e.key === ']') { e.preventDefault(); const n = (EXPERIENCES.findIndex((x) => x.id === sid) + 1) % EXPERIENCES.length; setSid(EXPERIENCES[n].id) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [sid])

  useEffect(() => {
    if (window.innerWidth < 1024) document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [sid])

  return (
    <section id="experience" ref={sr} className="relative overflow-hidden py-24" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Tape guide lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[20, 40, 60, 80].map((p) => (
          <div key={p} className="absolute left-0 right-0 h-px"
            style={{ top: `${p}%`, backgroundColor: 'var(--color-border-subtle)', opacity: 0.3 }} />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Header */}
        <m.div initial={{ opacity: 0, y: 20 }} animate={siv ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: T }}
          className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-ochre)', border: '1px solid var(--color-border-subtle)' }}>
            <Radio className="h-4 w-4" /><span>SESSION LOG</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>The Sessions</h2>
          <p className="mt-2 max-w-md text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            A recording of the career journey &mdash; each job, a tape session.
          </p>
        </m.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ── Track Selector ── */}
          <div className="lg:col-span-5">
            <m.div initial={{ opacity: 0, x: -30 }} animate={siv ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: T }}
              className="flex flex-col gap-2 rounded-2xl p-2"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}>
              <div className="mb-2 flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: 'var(--color-slate)' }} id="experience-tablist-label">
                <span>Track Selector</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}>{sid} / {EXPERIENCES.length}</span>
              </div>

              {EXPERIENCES.map((exp, idx) => {
                const sel = sid === exp.id
                const ls: 'current' | 'active' | 'completed' = exp.id === 1 ? 'current' : sel ? 'active' : 'completed'
                return (
                  <m.div key={exp.id} initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1, ease: T }}>
                    <button role="tab" aria-selected={sel} aria-controls="experience-detail-panel"
                      tabIndex={sel ? 0 : -1} onClick={() => setSid(exp.id)}
                      onKeyDown={(e) => {
                        const ci = EXPERIENCES.findIndex((x) => x.id === exp.id)
                        let ni: number | null = null
                        if (e.key === 'ArrowDown') { e.preventDefault(); ni = (ci + 1) % EXPERIENCES.length }
                        if (e.key === 'ArrowUp') { e.preventDefault(); ni = (ci - 1 + EXPERIENCES.length) % EXPERIENCES.length }
                        if (ni !== null) setSid(EXPERIENCES[ni].id)
                      }}
                      className="group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all sm:p-4"
                      style={{ backgroundColor: sel ? 'var(--color-bg-elevated, oklch(0.22 0.02 30))' : 'transparent', border: sel ? '1px solid var(--color-border-accent)' : '1px solid transparent' }}>
                      {sel && (
                        <m.div layoutId="ochre-indicator" className="absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full"
                          style={{ backgroundColor: 'var(--color-ochre)', height: 40 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                      )}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <Led s={ls} />
                        <span className="text-xs font-bold transition-colors" style={{ fontFamily: 'var(--font-mono)', color: sel ? 'var(--color-ochre)' : 'var(--color-slate)' }}>
                          S{String(exp.id).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: sel ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                            {exp.role}
                          </h3>
                          <span className={cn('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider', !sel && 'opacity-40')}
                            style={{ borderColor: sel ? 'var(--color-border-accent)' : 'var(--color-border-subtle)', color: sel ? 'var(--color-ochre)' : 'var(--color-slate)', fontFamily: 'var(--font-mono)' }}>
                            {exp.type}
                          </span>
                        </div>
                        <p className="truncate text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{exp.company}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]" style={{ color: 'var(--color-slate)' }}>
                          <span className="flex items-center gap-1 truncate">
                            <Calendar className="h-2.5 w-2.5 shrink-0" />
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{exp.period}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />{exp.location}
                          </span>
                        </div>
                      </div>
                      <div className="hidden shrink-0 flex-col gap-1 sm:flex">
                        <Ms l="MUTE" /><Ms l="SOLO" />
                      </div>
                    </button>
                  </m.div>
                )
              })}
            </m.div>
          </div>

          {/* ── Detail Panel ── */}
          <div className="lg:col-span-7">
            <m.div initial={{ opacity: 0, x: 30 }} animate={siv ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25, ease: T }}
              className="relative h-full min-h-[480px] overflow-hidden rounded-3xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}>
              <AnimatePresence mode="wait">
                <m.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }} className="pointer-events-none absolute inset-0 blur-3xl"
                  style={{ backgroundColor: 'var(--color-ochre)' }} />
              </AnimatePresence>
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, var(--color-ochre) 40px, var(--color-ochre) 41px)' }} />

              <div role="tabpanel" id="experience-detail-panel" aria-labelledby="experience-tablist-label"
                className="relative flex h-full flex-col p-5 sm:p-8 md:p-10">
                {/* Header + Reel */}
                <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      <m.div key={`h-${job.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: T }}>
                        <div className="mb-3 inline-block rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                          style={{ backgroundColor: 'var(--color-ochre)', color: 'var(--color-charcoal)', fontFamily: 'var(--font-mono)' }}>
                          Session {String(job.id).padStart(2, '0')}
                        </div>
                        <h3 className="text-2xl font-bold sm:text-3xl"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{job.role}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--color-ochre)' }}>{job.company}</span>
                          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--color-slate)' }} />
                          <span className="flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                        </div>
                      </m.div>
                    </AnimatePresence>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <AnimatePresence mode="wait">
                      <m.div key={job.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.4, ease: T }}>
                        <TapeReel />
                      </m.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Period + Current badge */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-bg-elevated, oklch(0.22 0.02 30))', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-mono)', color: 'var(--color-ochre)' }}>
                    <Calendar className="h-3 w-3" />{job.period}
                  </div>
                  {sid === 1 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--color-terracotta)', color: 'var(--color-highlight)', fontFamily: 'var(--font-mono)', opacity: 0.85 }}>
                      <Led s="current" />Now Recording
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <AnimatePresence mode="wait">
                    <m.div key={job.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: T }} className="space-y-5">
                      {job.isGroup ? (
                        <div className="space-y-4">
                          {job.items?.map((item, i) => (
                            <TSeg key={i} role={item.role} company={item.company} period={item.period} description={item.description} i={i} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {job.description?.map((item, i) => (
                            <m.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08, ease: T }}
                              className="flex items-start gap-3 rounded-lg p-3"
                              style={{ backgroundColor: 'var(--color-bg-tertiary, oklch(0.20 0.02 30))', border: '1px solid var(--color-border-subtle)' }}>
                              <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: 'var(--color-ochre)', opacity: 0.2 }}>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-ochre)' }} />
                              </div>
                              <span className="text-base leading-relaxed"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{item}</span>
                            </m.div>
                          ))}
                        </div>
                      )}
                    </m.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Controls */}
                <div className="mt-6 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <m.div key={i} className="w-1 rounded-full" style={{ height: '8px', backgroundColor: 'var(--color-ochre)', transformOrigin: 'bottom' }}
                          animate={{ scaleY: [1, 2, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: 'var(--color-ochre)', fontFamily: 'var(--font-mono)' }}>Now Playing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const p = EXPERIENCES.findIndex((e) => e.id === sid) - 1; setSid(EXPERIENCES[(p + EXPERIENCES.length) % EXPERIENCES.length].id) }}
                      aria-label="Previous session"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                      style={{ backgroundColor: 'var(--color-bg-tertiary, oklch(0.20 0.02 30))', border: '1px solid var(--color-border-subtle)', color: 'var(--color-ochre)' }}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="min-w-[4ch] text-center text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate)' }}>
                      S{sid}/{EXPERIENCES.length}
                    </span>
                    <button onClick={() => { const n = (EXPERIENCES.findIndex((e) => e.id === sid) + 1) % EXPERIENCES.length; setSid(EXPERIENCES[n].id) }}
                      aria-label="Next session"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                      style={{ backgroundColor: 'var(--color-bg-tertiary, oklch(0.20 0.02 30))', border: '1px solid var(--color-border-subtle)', color: 'var(--color-ochre)' }}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  )
}
