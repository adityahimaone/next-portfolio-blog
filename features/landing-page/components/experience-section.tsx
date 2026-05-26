'use client'

/**
 * Track 04 — Tour History.
 *
 * Vintage concert tour poster. Each role is a tour date. As the row scrolls
 * into view, a ticket stub slides out with the role&rsquo;s responsibilities.
 * Reuses EXPERIENCES from constants (no data duplication).
 */
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronRight, MapPin, Calendar } from 'lucide-react'
import { TrackSection } from '@/components/track-section'
import { EXPERIENCES } from '../constants'

export function ExperienceSection() {
  const [openId, setOpenId] = useState<number | null>(EXPERIENCES[0]?.id ?? null)
  const prefersReduced = useReducedMotion()

  return (
    <TrackSection
      trackNumber="04"
      id="experience"
      title="Tour History"
      subtitle="Past gigs, residencies, and side stages. Tap a date to pull the ticket stub."
    >
      <div className="relative">
        {/* Poster header */}
        <div className="mb-8 flex items-center justify-between border-y border-accent/40 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-[0.3em] text-accent">
              ★ ★ ★
            </span>
            <span className="font-mono text-xs tracking-widest text-text-muted">
              ALL DATES — ALL VENUES — ALL AGES
            </span>
          </div>
          <span className="meta-label hidden md:inline">{EXPERIENCES.length} STOPS</span>
        </div>

        {/* Tour dates */}
        <ol className="divide-y divide-edge border-y border-edge">
          {EXPERIENCES.map((item, idx) => {
            const isOpen = openId === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="group grid w-full grid-cols-12 items-center gap-3 py-5 text-left transition-colors hover:bg-elevated/40 md:py-6"
                >
                  {/* Date badge */}
                  <div className="col-span-3 md:col-span-2">
                    <span className="font-mono text-[10px] tracking-widest text-accent">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="mt-1 font-mono text-xs text-text-muted md:text-sm">
                      {item.period.split(' - ')[0]}
                    </div>
                  </div>

                  {/* Role + venue */}
                  <div className="col-span-7 md:col-span-7">
                    <div className="display-heading text-xl md:text-3xl">
                      {item.role}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted md:text-sm">
                      <span className="text-text-main">{item.company}</span>
                      <span className="hidden md:inline">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {item.location}
                      </span>
                    </div>
                  </div>

                  {/* Type tag */}
                  <div className="col-span-2 hidden md:block">
                    <span className="rounded-sm border border-edge px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {item.type}
                    </span>
                  </div>

                  {/* Chevron */}
                  <div className="col-span-2 flex justify-end md:col-span-1">
                    <motion.span
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-text-muted group-hover:text-accent"
                    >
                      <ChevronRight size={20} />
                    </motion.span>
                  </div>
                </button>

                {/* Ticket stub reveal */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="ml-0 mb-4 border-l-2 border-accent bg-elevated/30 p-5 md:ml-[15%] md:p-6">
                        <div className="mb-3 flex items-center gap-2 text-text-muted">
                          <Calendar size={12} />
                          <span className="meta-label">{item.period}</span>
                        </div>

                        {item.description && (
                          <ul className="space-y-2 text-sm leading-relaxed text-text-main md:text-base">
                            {item.description.map((d, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="meta-label mt-1 text-accent shrink-0">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.isGroup && item.items && (
                          <div className="mt-2 space-y-4">
                            {item.items.map((sub, i) => (
                              <div key={i} className="rounded-sm border border-edge p-3">
                                <div className="font-mono text-sm text-text-main">
                                  {sub.role}
                                </div>
                                <div className="meta-label mt-0.5">
                                  {sub.company} · {sub.period}
                                </div>
                                <p className="mt-2 text-sm text-text-muted">
                                  {sub.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>
      </div>
    </TrackSection>
  )
}
