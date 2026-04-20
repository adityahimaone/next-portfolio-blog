'use client'

import { useRef, useCallback, useState } from 'react'

type ToneModule = typeof import('tone')

interface AudioEngineState {
  isLoaded: boolean
  isStarted: boolean
  isLoading: boolean
  error: string | null
}

export function useAudioEngine() {
  const toneRef = useRef<ToneModule | null>(null)
  const [state, setState] = useState<AudioEngineState>({
    isLoaded: false,
    isStarted: false,
    isLoading: false,
    error: null,
  })

  const loadAudioEngine = useCallback(async () => {
    if (toneRef.current) return toneRef.current
    if (state.isLoading) return null

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Dynamic import of tone.js - reduces initial bundle size by ~200KB
      const Tone = await import('tone')
      toneRef.current = Tone
      setState((prev) => ({ ...prev, isLoaded: true, isLoading: false }))
      return Tone
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load Tone.js'
      console.error('Failed to load Tone.js:', error)
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [state.isLoading])

  const startAudio = useCallback(async () => {
    if (state.isStarted) return true

    const Tone = toneRef.current || (await loadAudioEngine())
    if (!Tone) return false

    try {
      await Tone.start()
      Tone.Transport.start()
      setState((prev) => ({ ...prev, isStarted: true }))
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start audio context'
      console.error('Failed to start audio context:', error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.isStarted, loadAudioEngine])

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    toneRef,
    isLoaded: state.isLoaded,
    isStarted: state.isStarted,
    isLoading: state.isLoading,
    error: state.error,
    loadAudioEngine,
    startAudio,
    resetError,
  }
}
