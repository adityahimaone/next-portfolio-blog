'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DawChannel } from '@/features/landing-page/constants/daw-channels'
import styles from './daw-hero.module.css'

interface DawChannelStripProps {
  channel: DawChannel
  animDelay?: number
}

export function DawChannelStrip({ channel, animDelay = 0 }: DawChannelStripProps) {
  const [level, setLevel] = useState(channel.level)
  const [isSolo, setIsSolo] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Fader drag logic (mouse + touch)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      isDragging.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !railRef.current) return
    const rail = railRef.current.getBoundingClientRect()
    const rawPct = 1 - (e.clientY - rail.top) / rail.height
    setLevel(Math.round(Math.min(100, Math.max(0, rawPct * 100))))
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Fader cap position: level 0 = bottom, 100 = top. Map to CSS %.
  // Rail height ≈ 160px; cap is 28px tall → travel = 132px
  const capTopPct = 100 - level // 0% at top, 100% at bottom

  // dB readout from level
  const dbVal =
    level === 0
      ? '-∞'
      : level === 100
      ? '+6.0 dB'
      : `${((level / 100) * 6 - 18 + (level / 100) * 12).toFixed(1)} dB`

  return (
    <div
      className={cn(
        'relative flex-1 flex flex-col items-center justify-between px-1.5 py-3 h-full',
        'border-r border-black/10 dark:border-white/[0.04]',
        'select-none',
        isMuted && 'opacity-40',
      )}
      style={{ minWidth: '52px' }}
    >
      {/* ── Scribble Strip Label ── */}
      <div
        className={cn(
          'w-full rounded-[2px] px-1 py-0.5 text-center',
          'border border-black/10 dark:border-white/5',
          'bg-[#F5F0E0] dark:bg-[#1A1B1E]',
        )}
      >
        <span
          className="font-mono text-[6px] font-bold tracking-widest uppercase"
          style={{ color: channel.color }}
        >
          {channel.label}
        </span>
      </div>

      {/* ── SOLO / MUTE Buttons ── */}
      <div className="flex w-full gap-1">
        <button
          onClick={() => setIsSolo((s) => !s)}
          className={cn(
            'flex-1 rounded-[2px] border py-0.5 font-mono text-[6px] font-bold uppercase tracking-wider transition-all',
            'shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-px',
            isSolo
              ? 'border-[#F59E0B]/60 bg-[#F59E0B]/20 text-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.4)]'
              : 'border-black/20 bg-[var(--daw-chassis-raised)] text-black/40 dark:border-white/10 dark:bg-[var(--daw-chassis-raised)] dark:text-white/30',
          )}
        >
          S
        </button>
        <button
          onClick={() => setIsMuted((m) => !m)}
          className={cn(
            'flex-1 rounded-[2px] border py-0.5 font-mono text-[6px] font-bold uppercase tracking-wider transition-all',
            'shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-px',
            isMuted
              ? 'border-[#EF4444]/60 bg-[#EF4444]/20 text-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.4)]'
              : 'border-black/20 bg-[var(--daw-chassis-raised)] text-black/40 dark:border-white/10 dark:bg-[var(--daw-chassis-raised)] dark:text-white/30',
          )}
        >
          M
        </button>
      </div>

      {/* ── Fader Rail + Cap ── */}
      <div
        ref={railRef}
        className="relative flex w-full justify-center"
        style={{ height: '190px' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Rail track */}
        <div
          className={cn(
            'absolute top-0 bottom-0 w-[3px] rounded-full',
            'bg-[var(--daw-fader-rail)]',
            'shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]',
          )}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        {/* Level fill (colored, below fader cap) */}
        <div
          className="absolute bottom-0 w-[3px] rounded-full"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${level}%`,
            background: `linear-gradient(to top, ${channel.color}80, ${channel.color}30)`,
          }}
        />

        {/* Fader cap */}
        <div
          className={cn(
            'absolute cursor-grab active:cursor-grabbing',
            styles.faderCap,
          )}
          style={{
            top: `${capTopPct}%`,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            animationDelay: `${animDelay}s`,
            animationDuration: `${2 + (channel.id % 5) * 0.3}s`,
          } as React.CSSProperties}
          onPointerDown={handlePointerDown}
        >
          {/* Cap body */}
          <div
            className={cn(
              'relative h-7 w-8 rounded-[3px]',
              'border border-white/20 dark:border-white/10',
              'shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.3)]',
            )}
            style={{
              background: `linear-gradient(180deg, #B8B9C4 0%, #8B8C94 40%, #6B6C74 100%)`,
            }}
          >
            {/* Grip ridges */}
            {[20, 35, 50, 65, 80].map((pct) => (
              <div
                key={pct}
                className="absolute right-1 left-1 rounded-full"
                style={{
                  top: `${pct}%`,
                  height: '1px',
                  background: 'rgba(0,0,0,0.25)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.15)',
                }}
              />
            ))}
            {/* Colored indicator line at center */}
            <div
              className="absolute right-0 left-0 rounded-full"
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
                height: '1.5px',
                background: channel.color,
                boxShadow: `0 0 4px ${channel.color}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── dB Readout ── */}
      <div className="font-mono text-[7px] tabular-nums text-black/40 dark:text-white/30">
        {dbVal}
      </div>

      {/* ── Select Button + LED ── */}
      <button
        onClick={() => setIsSelected((s) => !s)}
        className={cn(
          'relative flex flex-col items-center gap-1',
          'rounded-[3px] border px-1.5 py-1',
          'transition-all active:scale-95',
          'shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
          isSelected
            ? 'border-white/20 dark:border-white/10'
            : 'border-black/20 dark:border-white/5',
          'bg-[var(--daw-chassis-raised)]',
        )}
      >
        {/* LED dot */}
        <div
          className={cn(
            'h-2 w-2 rounded-full transition-all',
            isSelected ? styles.selectLed : '',
          )}
          style={{
            background: isSelected ? channel.color : 'var(--daw-led-off)',
            boxShadow: isSelected
              ? `0 0 6px ${channel.color}, 0 0 10px ${channel.color}`
              : 'none',
          }}
        />
        <span className="font-mono text-[6px] tracking-widest text-black/40 dark:text-white/25">
          {channel.id}
        </span>
      </button>
    </div>
  )
}
