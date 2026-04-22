'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface JogWheelProps {
  cover: string
  isPlaying: boolean
  color: string
  ringColor: string
  isYoutube?: boolean
}

export const JogWheel = memo(
  ({
    cover,
    isPlaying,
    color,
    ringColor,
    isYoutube = false,
  }: JogWheelProps) => {
    return (
      <div
        className={cn(
          'relative flex aspect-square w-48 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#050505] p-2 sm:w-64 lg:w-80 xl:w-96',
          color,
        )}
      >
        <motion.div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[15px] border-[#151515] border-t-[#222] shadow-inner"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{
            rotate: isPlaying
              ? { repeat: Infinity, duration: 1.8, ease: 'linear' }
              : { duration: 0 },
          }}
        >
          <div className="absolute inset-2 rounded-full border-[2px] border-white/5" />
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <div className="absolute inset-14 rounded-full border border-white/5" />
          <div className="absolute inset-20 rounded-full border border-white/5" />

          <div
            className={cn(
              'absolute inset-0 rounded-full border-[4px] opacity-40',
              ringColor,
            )}
          />

          <div className="relative h-28 w-28 overflow-hidden rounded-full border-[6px] border-[#2a2a2c] bg-black">
            <Image
              src={cover}
              alt="center"
              fill
              className={cn(
                'object-cover saturate-50 transition-transform duration-500',
                isYoutube
                  ? 'scale-[1.4] opacity-80 mix-blend-screen'
                  : 'opacity-70',
              )}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-4 w-4 rounded-full border border-zinc-700 bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]" />
            </div>
          </div>
        </motion.div>
      </div>
    )
  },
)

JogWheel.displayName = 'JogWheel'
