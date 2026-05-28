'use client'

import { m } from 'motion/react'
import { HeroScreen } from './HeroScreen'

interface OP1DeviceProps {
  className?: string
}

/**
 * Full OP-1 Field illustration — top-down view.
 * Teal OLED screen with animated oscilloscope.
 */
export function OP1Device({ className }: OP1DeviceProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={className}
    >
      <div className="relative w-full max-w-[680px] mx-auto">
        {/* Device body — aluminum panel */}
        <div
          className="sc-panel sc-brushed-metal relative rounded-2xl border border-white/5 p-4 sm:p-6"
          style={{
            background: 'linear-gradient(135deg, #D9D4CE 0%, #C4BFB9 30%, #D4CFCA 60%, #BEB9B3 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          {/* Noise texture */}
          <div className="sc-noise absolute inset-0 rounded-2xl z-0" style={{ opacity: 0.03 }} />

          {/* Top edge bar */}
          <div className="relative z-10 mb-3 flex items-center justify-between">
            <span
              className="text-[10px] font-bold tracking-[0.25em] uppercase"
              style={{ color: '#6A6560', fontFamily: 'var(--sc-font-mono)' }}
            >
              OP-1 field
            </span>
            <div className="flex items-center gap-2">
              <div className="sc-led sc-led--green h-2 w-2" />
              <span
                className="text-[9px] font-medium tracking-wider"
                style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
              >
                ● REC
              </span>
            </div>
          </div>

          {/* OLED SCREEN — the main display */}
          <div className="relative z-10 mb-4 overflow-hidden rounded-lg border-2 border-black/30" style={{ background: '#000' }}>
            {/* Screen bezel */}
            <div className="p-[6px] sm:p-2">
              <div className="relative overflow-hidden rounded" style={{ aspectRatio: '16/7' }}>
                {/* Scanlines */}
                <div className="sc-scanlines pointer-events-none absolute inset-0 z-10 rounded" />

                {/* Oscilloscope canvas */}
                <HeroScreen className="absolute inset-0 z-0" />

                {/* Name overlay on screen */}
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                  style={{ fontFamily: 'var(--sc-font-mono)' }}
                >
                  <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-[clamp(18px,5vw,40px)] font-black tracking-tighter"
                    style={{
                      color: '#00B4D8',
                      textShadow: '0 0 20px rgba(0,180,216,0.5), 0 0 60px rgba(0,180,216,0.2)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ADITYA
                  </m.span>
                  <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-[clamp(10px,2.5vw,18px)] font-bold tracking-[0.3em]"
                    style={{
                      color: '#FF5500',
                      textShadow: '0 0 12px rgba(255,85,0,0.4)',
                    }}
                  >
                    HIMAONE
                  </m.span>
                </div>

                {/* Status readout at bottom of screen */}
                <div
                  className="absolute right-0 bottom-0 left-0 z-20 flex justify-between px-3 py-1.5"
                  style={{ background: 'rgba(0,0,0,0.6)', fontFamily: 'var(--sc-font-mono)' }}
                >
                  <span className="text-[8px] sm:text-[10px] tracking-wider" style={{ color: '#00B4D8' }}>
                    WAVEFORM
                  </span>
                  <span className="text-[8px] sm:text-[10px] tracking-wider" style={{ color: '#00FF41' }}>
                    STEREO
                  </span>
                  <span className="text-[8px] sm:text-[10px] tracking-wider" style={{ color: '#FFB000' }}>
                    FREQ 440→1440
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Knob row — 4 encoder knobs (OP-1 layout) */}
          <div className="relative z-10 mb-3 grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: 'WHITE', color: '#E8E4DF' },
              { label: 'BLUE', color: '#00B4D8' },
              { label: 'ORANGE', color: '#FF5500' },
              { label: 'GREEN', color: '#00FF41' },
            ].map((enc) => (
              <div key={enc.label} className="flex flex-col items-center gap-2">
                <m.div
                  className="sc-knob cursor-pointer"
                  style={{ width: 44, height: 44 }}
                  whileHover={{ rotate: 45 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    className="absolute top-[6px] left-1/2 h-3.5 w-[2px] rounded-full"
                    style={{
                      background: enc.color,
                      transform: 'translateX(-50%) rotate(0deg)',
                      transformOrigin: 'bottom center',
                    }}
                  />
                </m.div>
                <span
                  className="text-[8px] font-bold tracking-widest"
                  style={{ color: '#6A6560', fontFamily: 'var(--sc-font-mono)' }}
                >
                  {enc.label}
                </span>
              </div>
            ))}
          </div>

          {/* Transport buttons row */}
          <div className="relative z-10 flex items-center justify-between px-2">
            <div className="flex gap-3">
              {[
                { label: 'REC', icon: '●', color: '#FF3344' },
                { label: 'PLAY', icon: '▶', color: '#00FF41' },
                { label: 'STOP', icon: '■', color: '#999' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="flex flex-col items-center gap-1"
                  aria-label={btn.label}
                >
                  <m.div
                    className="flex h-9 w-9 items-center justify-center rounded border border-black/15"
                    style={{
                      background: 'linear-gradient(180deg, #E8E4DF, #C4BFB9)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                      color: btn.color,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm">{btn.icon}</span>
                  </m.div>
                  <span
                    className="text-[7px] font-bold tracking-widest"
                    style={{ color: '#777', fontFamily: 'var(--sc-font-mono)' }}
                  >
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Shift + Help buttons */}
            <div className="flex gap-2">
              {['SHIFT', 'HELP'].map((label) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-1"
                  aria-label={label}
                >
                  <m.div
                    className="flex h-7 w-10 items-center justify-center rounded border border-black/10"
                    style={{
                      background: 'linear-gradient(180deg, #E8E4DF, #C4BFB9)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      color: '#555',
                      fontFamily: 'var(--sc-font-mono)',
                      fontSize: 8,
                      fontWeight: 700,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {label}
                  </m.div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  )
}
