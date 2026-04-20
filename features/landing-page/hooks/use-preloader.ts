'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'preloaderShown'

export function usePreloader(duration = 1200) {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem(STORAGE_KEY)
  })

  useEffect(() => {
    // If not loading (preloader skipped), don't set any timer
    if (!isLoading) return

    const timer = setTimeout(() => {
      setIsLoading(false)
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }, duration)

    return () => clearTimeout(timer)
  }, [isLoading, duration])

  return isLoading
}
