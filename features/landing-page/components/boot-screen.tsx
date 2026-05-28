'use client'

import { useEffect, useState, useCallback } from 'react'
import { m, AnimatePresence } from 'motion/react'

const BOOT_STEPS = [
  'op-1 field',
  'BOOTING...',
  'LOADING ENGINES ████████░░',
  'CALIBRATING KNOBS ██████████',
  'WELCOME, ADITYA',
] as const

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [shouldSkip, setShouldSkip] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shown = sessionStorage.getItem('sc-boot-shown')
    if (shown) {
      setShouldSkip(true)
      onComplete()
      return
    }
    setShouldSkip(false)
  }, [onComplete])

  const finish = useCallback(() => {
    sessionStorage.setItem('sc-boot-shown', '1')
    onComplete()
  }, [onComplete])

  useEffect(() => {
    if (shouldSkip) return
    const stepTimer = setInterval(() => {
      setStepIdx((i) => {
        if (i >= BOOT_STEPS.length - 1) {
          clearInterval(stepTimer)
          setTimeout(finish, 600)
          return i
        }
        return i + 1
      })
    }, 280)

    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progTimer)
          return 100
        }
        return Math.min(p + 4, 100)
      })
    }, 50)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progTimer)
    }
  }, [shouldSkip, finish])

  if (shouldSkip) return null

  const pct = `${Math.round(progress)}%`

  return (
    <m.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: '#0D0B0A' }}
    >
      {/* Scanlines */}
      <div className="sc-scanlines pointer-events-none absolute inset-0 z-0" />

      {/* Main screen frame */}
      <div
        className="relative z-10 w-[90vw] max-w-md rounded-lg border border-white/5 p-6 sm:p-8"
        style={{
          background: 'linear-gradient(180deg, #1A1A1A 0%, #111 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Brand */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="text-xs font-bold tracking-[0.3em] uppercase"
            style={{ color: '#D4CFCA', fontFamily: 'var(--sc-font-mono)' }}
          >
            OP-1 field
          </span>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
        </div>

        {/* OLED screen area */}
        <div className="relative rounded border border-white/5 bg-black p-4" style={{ minHeight: 140 }}>
          {/* Scanline overlay inside OLED */}
          <div className="sc-scanlines pointer-events-none absolute inset-0 z-10 rounded" />

          <AnimatePresence mode="wait">
            <m.div
              key={stepIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="z-0 space-y-2"
              style={{ fontFamily: 'var(--sc-font-mono)', color: '#00FF41' }}
            >
              {stepIdx === 0 ? (
                <span className="text-lg font-bold tracking-wider">
                  {BOOT_STEPS[0]}
                </span>
              ) : (
                <>
                  <div className="text-sm tracking-wider">
                    {BOOT_STEPS[stepIdx]}
                    {stepIdx >= 2 && stepIdx < 4 && (
                      <span style={{ color: '#FFB000' }}>
                        {' '}{pct}
                      </span>
                    )}
                  </div>
                </>
              )}
            </m.div>
          </AnimatePresence>

          {/* VU meter bar */}
          <div className="absolute right-0 bottom-4 left-0 mx-4 h-1 overflow-hidden rounded bg-white/5">
            <m.div
              className="h-full rounded"
              style={{
                background: `linear-gradient(90deg, #00FF41 0%, #00FF41 ${Math.min(progress * 0.8, 70)}%, #FFB000 ${Math.min(progress * 0.8, 70)}% 85%, #FF3344 85% 100%)`,
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>

        {/* Knob row at bottom */}
        <div className="mt-5 flex justify-between px-2">
          {['1', '2', '3', '4'].map((n) => (
            <div key={n} className="flex flex-col items-center gap-1">
              <div className="sc-knob" style={{ width: 28, height: 28 }} />
              <span
                className="text-[8px] font-bold tracking-widest"
                style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
              >
                {['SYNTH', 'FX', 'DRUM', 'T4'][Number(n) - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </m.div>
  )
}
