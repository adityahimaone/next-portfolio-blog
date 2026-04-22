'use client'

import { memo, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface InteractiveKnobProps {
  label: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  defaultValue?: number
  ringColor?: string
}

export const InteractiveKnob = memo(
  ({
    label,
    size = 'sm',
    color = 'zinc',
    defaultValue = 50,
    ringColor = '',
  }: InteractiveKnobProps) => {
    const [val, setVal] = useState(defaultValue)
    const rotation = -135 + (val / 100) * 270
    const sizeMap = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' }
    const markerMap = { sm: 'h-1/2', md: 'h-[55%]', lg: 'h-[60%]' }

    return (
      <div className="group relative flex flex-col items-center gap-1.5">
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full border-b-2 border-zinc-800 bg-[#050505] p-[2px] shadow-[0_5px_10px_rgba(0,0,0,0.8)]',
            sizeMap[size],
            ringColor,
          )}
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#333] to-[#151515] shadow-inner"
          >
            <div
              className={cn(
                'absolute top-[2px] left-1/2 w-[1.5px] origin-bottom -translate-x-1/2 rounded-full bg-white',
                markerMap[size],
              )}
              style={{ boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}
            />
          </motion.div>
          <input
            type="range"
            min="0"
            max="100"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <span className="font-mono text-[7px] font-bold tracking-widest whitespace-nowrap text-zinc-500 uppercase transition-colors group-hover:text-zinc-300">
          {label}
        </span>
      </div>
    )
  },
)

InteractiveKnob.displayName = 'InteractiveKnob'
