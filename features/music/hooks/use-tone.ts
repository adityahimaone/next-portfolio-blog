'use client'

import { useRef, useCallback, useState, useEffect } from 'react'

let toneModule: typeof import('tone') | null = null

export async function getTone() {
  if (!toneModule) {
    toneModule = await import('tone')
  }
  return toneModule
}

export function useTone() {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const toneRef = useRef<typeof import('tone') | null>(null)

  const init = useCallback(async () => {
    if (!toneRef.current) {
      const Tone = await getTone()
      toneRef.current = Tone
      await Tone.start()
      setIsReady(true)
    }
    return toneRef.current
  }, [])

  const start = useCallback(async () => {
    const Tone = await init()
    setIsPlaying(true)
    return Tone
  }, [init])

  const stop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup: stop transport if running
      if (toneRef.current) {
        toneRef.current.Transport.stop()
        toneRef.current.Transport.cancel()
      }
    }
  }, [])

  return {
    isReady,
    isPlaying,
    init,
    start,
    stop,
    tone: toneRef.current,
  }
}
