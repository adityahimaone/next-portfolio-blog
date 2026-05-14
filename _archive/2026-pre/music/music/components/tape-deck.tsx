'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { m } from 'motion/react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TapeDeck({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [counter, setCounter] = useState(0)
  const animRef = useRef<number>(0)
  const lastTime = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animRef.current)
      return
    }
    const animate = (time: number) => {
      if (lastTime.current) {
        const delta = time - lastTime.current
        setRotation((prev) => prev + delta * 0.15)
        setCounter((prev) => prev + delta * 0.01)
      }
      lastTime.current = time
      animRef.current = requestAnimationFrame(animate)
    }
    lastTime.current = 0
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
    setIsRecording(false)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setIsRecording(false)
  }, [])

  const rewind = useCallback(() => {
    setIsPlaying(false)
    setRotation(0)
    setCounter(0)
  }, [])

  const toggleRecord = useCallback(() => {
    if (!isPlaying) setIsPlaying(true)
    setIsRecording((p) => !p)
  }, [isPlaying])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      {/* Top panel */}
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">TAPE DECK</div>
            <div className="text-[9px] text-zinc-500">CASSETTE / DOLBY NR</div>
          </div>
        </div>
        <div className="font-mono text-sm font-bold text-zinc-600 dark:text-zinc-400">
          {String(Math.floor(counter / 60)).padStart(2, '0')}:{String(Math.floor(counter % 60)).padStart(2, '0')}
        </div>
      </div>

      {/* Cassette window */}
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="relative w-full max-w-sm">
          {/* Cassette body */}
          <div className="relative overflow-hidden rounded-lg border-4 border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
            {/* Top screws */}
            <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-zinc-700" />
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-zinc-700" />

            {/* Label area */}
            <div className="mb-3 rounded border border-zinc-700 bg-zinc-100 p-2 dark:bg-zinc-800">
              <div className="text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase">A-SIDE</div>
              <div className="text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">Mixtape 2026</div>
            </div>

            {/* Window with reels */}
            <div className="relative flex items-center justify-center rounded border border-zinc-700 bg-zinc-800 py-4">
              {/* Left reel */}
              <div
                className="relative h-20 w-20 rounded-full border-4 border-zinc-600 bg-zinc-700"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="absolute inset-2 rounded-full border-2 border-zinc-500" />
                <div className="absolute inset-4 rounded-full border border-zinc-400" />
                <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
                {/* Spokes */}
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute top-1/2 left-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 bg-zinc-500"
                    style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                  />
                ))}
              </div>

              {/* Tape path */}
              <div className="mx-2 h-1 w-12 bg-zinc-600" />

              {/* Right reel */}
              <div
                className="relative h-20 w-20 rounded-full border-4 border-zinc-600 bg-zinc-700"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="absolute inset-2 rounded-full border-2 border-zinc-500" />
                <div className="absolute inset-4 rounded-full border border-zinc-400" />
                <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute top-1/2 left-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 bg-zinc-500"
                    style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom label */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[8px] text-zinc-500">TYPE I / NORMAL BIAS</span>
              <span className="text-[8px] text-zinc-500">60 MIN</span>
            </div>

            {/* Bottom screws */}
            <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-zinc-700" />
            <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-zinc-700" />
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-3 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={rewind}
          className="flex h-10 w-10 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <RotateCcw size={16} />
        </m.button>

        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg transition-colors',
            isPlaying
              ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
              : 'border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
          )}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </m.button>

        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={stop}
          className="flex h-10 w-10 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <Square size={14} />
        </m.button>

        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleRecord}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition-colors',
            isRecording
              ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
              : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          )}
        >
          <div className={cn('h-3.5 w-3.5 rounded-full', isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-400')} />
        </m.button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', isPlaying ? 'animate-pulse bg-green-500' : 'bg-zinc-400')} />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
            {isRecording ? 'RECORDING' : isPlaying ? 'PLAYING' : 'STOPPED'}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500">AUTO REVERSE</span>
      </div>
    </div>
  )
}
