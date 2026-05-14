'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SfxName = 'click' | 'select' | 'hover' | 'transition' | 'error' | 'success' | 'start'

interface UseSfxOptions {
  enabled?: boolean
  volume?: number
}

/**
 * RETRO CONSOLE SFX — Web Audio synthesized sounds
 * No external assets needed, all generated from oscillators
 */
export function useSfx({ enabled = false, volume = 0.3 }: UseSfxOptions = {}) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [sfxEnabled, setSfxEnabled] = useState(enabled)

  useEffect(() => {
    // Read SFX preference from localStorage
    const stored = localStorage.getItem('sfx')
    if (stored !== null) {
      setSfxEnabled(stored === 'true')
    }

    const handleSfxToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>
      setSfxEnabled(customEvent.detail.enabled)
    }
    window.addEventListener('sfx-toggle', handleSfxToggle)

    return () => window.removeEventListener('sfx-toggle', handleSfxToggle)
  }, [])

  const getAudioCtx = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return null
      audioCtxRef.current = new AudioCtx()
    }
    return audioCtxRef.current
  }, [])

  const playSfx = useCallback(
    (name: SfxName) => {
      if (!sfxEnabled) return
      const ctx = getAudioCtx()
      if (!ctx) return

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      // Configure SFX based on type
      switch (name) {
        case 'click':
          osc.type = 'square'
          osc.frequency.setValueAtTime(800, now)
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05)
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
          osc.start(now)
          osc.stop(now + 0.05)
          break

        case 'select':
          osc.type = 'square'
          osc.frequency.setValueAtTime(440, now)
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
          osc.start(now)
          osc.stop(now + 0.1)
          break

        case 'hover':
          osc.type = 'sine'
          osc.frequency.setValueAtTime(1200, now)
          gain.gain.setValueAtTime(volume * 0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
          osc.start(now)
          osc.stop(now + 0.03)
          break

        case 'transition':
          // Stage transition — descending sweep
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(800, now)
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
          osc.start(now)
          osc.stop(now + 0.3)
          break

        case 'error':
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(220, now)
          osc.frequency.setValueAtTime(180, now + 0.1)
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          osc.start(now)
          osc.stop(now + 0.2)
          break

        case 'success':
          // Two-note ascending arpeggio
          osc.type = 'square'
          osc.frequency.setValueAtTime(523, now) // C5
          osc.frequency.setValueAtTime(659, now + 0.08) // E5
          osc.frequency.setValueAtTime(784, now + 0.16) // G5
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
          osc.start(now)
          osc.stop(now + 0.3)
          break

        case 'start':
          // Famicom-style start jingle
          osc.type = 'square'
          osc.frequency.setValueAtTime(659, now) // E5
          osc.frequency.setValueAtTime(784, now + 0.1) // G5
          osc.frequency.setValueAtTime(1047, now + 0.2) // C6
          gain.gain.setValueAtTime(volume, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
          osc.start(now)
          osc.stop(now + 0.4)
          break
      }
    },
    [sfxEnabled, volume, getAudioCtx],
  )

  return { playSfx, sfxEnabled }
}
