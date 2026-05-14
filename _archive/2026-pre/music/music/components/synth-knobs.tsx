'use client'

import { useState, useRef, useCallback } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/utils'

interface KnobParam {
  label: string
  value: number
  min: number
  max: number
  unit: string
  color: string
}

const INITIAL_PARAMS: KnobParam[] = [
  { label: 'CUTOFF', value: 65, min: 0, max: 100, unit: '%', color: 'text-blue-500' },
  { label: 'RESONANCE', value: 30, min: 0, max: 100, unit: '%', color: 'text-purple-500' },
  { label: 'ATTACK', value: 15, min: 0, max: 100, unit: 'ms', color: 'text-green-500' },
  { label: 'DECAY', value: 45, min: 0, max: 100, unit: 'ms', color: 'text-amber-500' },
  { label: 'SUSTAIN', value: 70, min: 0, max: 100, unit: '%', color: 'text-red-500' },
  { label: 'RELEASE', value: 35, min: 0, max: 100, unit: 'ms', color: 'text-pink-500' },
  { label: 'DETUNE', value: 0, min: -50, max: 50, unit: 'ct', color: 'text-cyan-500' },
  { label: 'MIX', value: 80, min: 0, max: 100, unit: '%', color: 'text-orange-500' },
]

function Knob({ param, onChange }: { param: KnobParam; onChange: (v: number) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleStart = useCallback((y: number) => {
    setIsDragging(true)
    startY.current = y
    startValue.current = param.value
  }, [param.value])

  const handleMove = useCallback((y: number) => {
    if (!isDragging) return
    const delta = (startY.current - y) * 0.5
    const range = param.max - param.min
    const newValue = Math.max(param.min, Math.min(param.max, startValue.current + (delta / 100) * range))
    onChange(newValue)
  }, [isDragging, param.min, param.max, onChange])

  const handleEnd = useCallback(() => setIsDragging(false), [])

  const percentage = ((param.value - param.min) / (param.max - param.min)) * 100
  const angle = -135 + (percentage / 100) * 270

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Knob */}
      <div
        className={cn(
          'relative flex h-16 w-16 cursor-grab items-center justify-center rounded-full border-4 border-zinc-300 bg-zinc-200 shadow-inner active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800',
          isDragging && 'border-zinc-400 dark:border-zinc-500'
        )}
        onMouseDown={(e) => handleStart(e.clientY)}
        onMouseMove={(e) => handleMove(e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      >
        {/* Knob indicator */}
        <div
          className={cn('absolute h-1 w-5 rounded-full', param.color.replace('text-', 'bg-'))}
          style={{
            transform: `rotate(${angle}deg) translateY(-20px)`,
            transformOrigin: 'center center',
          }}
        />
        {/* Center dot */}
        <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
      </div>

      {/* Value */}
      <div className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-200">
        {Math.round(param.value)}
        <span className="ml-0.5 text-[10px] text-zinc-500">{param.unit}</span>
      </div>

      {/* Label */}
      <span className="text-[9px] font-bold tracking-wider text-zinc-500">{param.label}</span>
    </div>
  )
}

export function SynthKnobs({ className }: { className?: string }) {
  const [params, setParams] = useState<KnobParam[]>(INITIAL_PARAMS)

  const updateParam = useCallback((idx: number, value: number) => {
    setParams((prev) => prev.map((p, i) => i === idx ? { ...p, value } : p))
  }, [])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 shadow-xl dark:border-zinc-700 dark:bg-zinc-950',
      className
    )}>
      <div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">SYNTH PANEL</div>
            <div className="text-[9px] text-zinc-500">8-PARAM / DRAG TO ADJUST</div>
          </div>
        </div>
        <m.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setParams(INITIAL_PARAMS)}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          RESET
        </m.button>
      </div>

      {/* Knobs grid */}
      <div className="grid grid-cols-4 gap-4 p-4 sm:gap-6 sm:p-6">
        {params.map((param, i) => (
          <Knob key={i} param={param} onChange={(v) => updateParam(i, v)} />
        ))}
      </div>

      {/* ADSR visual */}
      <div className="mx-4 mb-4 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 text-[9px] font-bold tracking-wider text-zinc-500">ENVELOPE PREVIEW</div>
        <svg viewBox="0 0 200 60" className="h-12 w-full">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-500"
            points={`
              0,50
              ${params[2].value * 1.5},10
              ${params[2].value * 1.5 + params[3].value * 1.2},${50 - params[4].value * 0.35}
              ${200 - params[5].value * 1.5},${50 - params[4].value * 0.35}
              200,50
            `}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-300 bg-zinc-200/50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">ACTIVE</span>
        </div>
        <span className="text-[9px] text-zinc-500">DRAG KNOBS TO ADJUST</span>
      </div>
    </div>
  )
}
