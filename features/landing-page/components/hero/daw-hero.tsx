'use client'

import { useRef, useState, useEffect } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { DawDisplay } from './daw-display'
import { DawChannelStrip } from './daw-channel-strip'
import { DawMasterKnob } from './daw-master-knob'
import { HeroTransport } from './hero-transport' // reuse existing transport bar
import { DAW_CHANNELS } from '@/features/landing-page/constants/daw-channels'
import { useAudio } from '@/features/landing-page/spotify/audio-context'

// Left sidebar button data
const LEFT_BUTTONS = [
  { label: 'FADER', sub: 'MODE' },
  { label: 'PAN' },
  { label: 'SEND 1', sub: 'SEND 4' },
  { label: 'SEND 2', sub: 'SEND 5' },
  { label: 'SEND 3', sub: 'SEND 6' },
  { label: 'PARAM' },
  { label: 'VOLUME' },
  { label: 'SHIFT', accent: true },
]

// Right sidebar button data
const RIGHT_BUTTONS = [
  { label: 'SETTINGS', sub: 'FUNC MODE' },
  { label: 'PRESETS', sub: 'SAVE' },
  { label: 'LOAD STRIP', sub: 'SECTION' },
  { label: 'FADER', sub: 'TRIM' },
]

export function DawHero() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { resolvedTheme } = useTheme()
  const { playbackRate } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.97])

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) setBaseDelay(0.1)
  }, [])

  const bpm = Math.round(playbackRate * 128)

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative h-screen w-full overflow-hidden select-none',
        // DAW chassis background
        'bg-[var(--daw-chassis)] dark:bg-[var(--daw-chassis)]',
      )}
    >
      {/* ── Corner Mounting Screws ── */}
      <Screw className="absolute top-[72px] left-4 z-40 opacity-70 transition-transform duration-300 hover:rotate-12" />
      <Screw className="absolute top-[72px] right-4 z-40 opacity-70 transition-transform duration-300 hover:-rotate-12" />
      <Screw className="absolute bottom-16 left-4 z-40 opacity-70 transition-transform duration-300 hover:-rotate-12" />
      <Screw className="absolute bottom-16 right-4 z-40 opacity-70 transition-transform duration-300 hover:rotate-12" />

      {/* ── Horizontal chassis seam lines ── */}
      <div className="pointer-events-none absolute top-16 right-0 left-0 z-30 border-b border-black/15 dark:border-black/40" />
      <div className="pointer-events-none absolute bottom-12 right-0 left-0 z-30 border-t border-black/15 dark:border-black/40" />

      {/* ── Brushed texture overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px)',
        }}
      />

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 flex h-full flex-col items-stretch justify-between pt-[96px] pb-[60px] px-8 gap-4"
      >

        {/* ── Brand label (top right, like "∿ Softube") ── */}
        <div className="absolute top-[72px] right-14 flex items-center gap-1 z-30">
          <span className="font-mono text-[9px] tracking-[0.25em] text-black/30 dark:text-white/25 uppercase">
            ∿ adityahimaone
          </span>
        </div>

        {/* ── ROW 1: LED Display Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: baseDelay }}
          className="mx-6"
        >
          <DawDisplay baseDelay={baseDelay + 0.2} />
        </motion.div>

        {/* ── ROW 2: Channel Strips + Sidebars ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: baseDelay + 0.3 }}
          className="flex flex-1 items-stretch gap-0 overflow-hidden"
        >
          {/* Left Sidebar */}
          <LeftSidebar buttons={LEFT_BUTTONS} />

          {/* Channel Strips (scrollable on narrow screens) */}
          <div className="flex flex-1 items-stretch overflow-x-auto no-scrollbar border-x border-black/10 dark:border-white/5">
            {DAW_CHANNELS.map((channel, i) => (
              <DawChannelStrip
                key={channel.id}
                channel={channel}
                animDelay={baseDelay + 0.4 + i * 0.08}
              />
            ))}
          </div>

          {/* Right Sidebar */}
          <RightSidebar bpm={bpm} />
        </motion.div>

      </motion.div>

      {/* ── Transport Bar (bottom) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: baseDelay + 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroTransport />
      </motion.div>
    </section>
  )
}

/* ── Left Sidebar ── */
function LeftSidebar({ buttons }: { buttons: typeof LEFT_BUTTONS }) {
  const [active, setActive] = useState<string | null>('VOLUME')

  return (
    <div className="hidden sm:flex w-16 shrink-0 flex-col items-center gap-1.5 py-2 pr-2 pl-1">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={() => setActive((a) => (a === btn.label ? null : btn.label))}
          className={cn(
            'relative w-full flex-col items-center rounded-[3px] border px-1 py-1.5 text-center',
            'transition-all active:scale-95',
            'shadow-[0_2px_0_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]',
            'active:shadow-none active:translate-y-px',
            btn.accent
              ? 'border-[#C9A447]/40 bg-[#C9A447]/10 text-[#C9A447]'
              : active === btn.label
              ? 'border-black/30 dark:border-white/20 bg-black/10 dark:bg-white/10'
              : 'border-black/15 dark:border-white/8 bg-[var(--daw-chassis-raised)]',
          )}
        >
          <span className="block font-mono text-[6px] font-bold tracking-widest uppercase text-black/50 dark:text-white/40">
            {btn.label}
          </span>
          {btn.sub && (
            <span className="hidden md:block font-mono text-[5px] tracking-wider text-black/25 dark:text-white/20 uppercase">
              {btn.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ── Right Sidebar ── */
function RightSidebar({ bpm }: { bpm: number }) {
  return (
    <div className="hidden sm:flex w-24 shrink-0 flex-col items-center gap-3 py-2 pl-3 pr-2">
      {/* Right function buttons */}
      {RIGHT_BUTTONS.map((btn) => (
        <button
          key={btn.label}
          className={cn(
            'w-full rounded-[3px] border border-black/15 dark:border-white/8',
            'bg-[var(--daw-chassis-raised)] px-1.5 py-1.5 text-center',
            'transition-all active:scale-95',
            'shadow-[0_2px_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-px',
          )}
        >
          <span className="block font-mono text-[6px] font-bold tracking-widest uppercase text-black/45 dark:text-white/35">
            {btn.label}
          </span>
          {btn.sub && (
            <span className="hidden md:block font-mono text-[5px] tracking-wide text-black/25 dark:text-white/20 uppercase">
              {btn.sub}
            </span>
          )}
        </button>
      ))}

      {/* Page navigation arrows */}
      <div className="flex items-center gap-1">
        <button className="flex h-6 w-6 items-center justify-center rounded border border-black/15 dark:border-white/8 bg-[var(--daw-chassis-raised)] font-mono text-[8px] text-black/40 dark:text-white/30 transition-all active:scale-95">
          ◀
        </button>
        <span className="font-mono text-[7px] text-black/30 dark:text-white/25 uppercase">pg</span>
        <button className="flex h-6 w-6 items-center justify-center rounded border border-black/15 dark:border-white/8 bg-[var(--daw-chassis-raised)] font-mono text-[8px] text-black/40 dark:text-white/30 transition-all active:scale-95">
          ▶
        </button>
      </div>

      {/* Solo / Mute section buttons */}
      <div className="flex w-full gap-1">
        <button className="flex-1 rounded-[3px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 py-1 font-mono text-[6px] font-bold uppercase tracking-widest text-[#F59E0B]/70 transition-all active:scale-95">
          SOLO
        </button>
        <button className="flex-1 rounded-[3px] border border-[#EF4444]/30 bg-[#EF4444]/10 py-1 font-mono text-[6px] font-bold uppercase tracking-widest text-[#EF4444]/70 transition-all active:scale-95">
          MUTE
        </button>
      </div>

      {/* Master Knob */}
      <div className="mt-auto">
        <DawMasterKnob label="PAN/WIDTH" defaultAngle={20} />
      </div>
    </div>
  )
}
