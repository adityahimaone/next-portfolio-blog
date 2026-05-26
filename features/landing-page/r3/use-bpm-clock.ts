'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Drift-free BPM clock. Returns current beat (1..4 within a bar) and bar count.
 * Uses requestAnimationFrame; pauses when tab hidden.
 */
export function useBpmClock(bpm = 120, beatsPerBar = 4) {
  const [beat, setBeat] = useState(1)
  const [bar, setBar] = useState(1)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const beatMs = 60000 / bpm

    const onVis = () => {
      visibleRef.current = !document.hidden
      if (visibleRef.current) {
        startRef.current = performance.now()
      }
    }
    document.addEventListener('visibilitychange', onVis)

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      if (visibleRef.current) {
        const elapsed = now - startRef.current
        const totalBeats = Math.floor(elapsed / beatMs)
        const b = (totalBeats % beatsPerBar) + 1
        const bb = Math.floor(totalBeats / beatsPerBar) + 1
        setBeat(b)
        setBar(bb)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [bpm, beatsPerBar])

  return { beat, bar, bpm }
}
