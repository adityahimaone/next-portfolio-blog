'use client'
import { motion } from 'motion/react'

interface ReactiveVisualizerProps {
  frequencyData: Uint8Array
}

export const ReactiveVisualizer = ({
  frequencyData,
}: ReactiveVisualizerProps) => {
  // Take 24 bins for a wider, more detailed studio EQ look
  const bars = Array.from(frequencyData).slice(0, 24)

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-end justify-between gap-1 overflow-hidden px-4 pb-10 opacity-40 lg:px-20">
      {bars.map((value, index) => {
        const normalized = value / 255
        // Studio EQ color mapping (green -> yellow -> red based on height)
        const getGlowColor = (val: number) => {
          if (val > 0.8) return 'rgba(239, 68, 68, 0.8)' // Red peak
          if (val > 0.5) return 'rgba(245, 158, 11, 0.8)' // Amber mid
          return 'rgba(16, 185, 129, 0.5)' // Green low
        }

        return (
          <div
            key={index}
            className="flex h-full flex-1 flex-col justify-end gap-[2px]"
          >
            {/* Create segmented LED blocks instead of a single solid bar */}
            {[...Array(20)].map((_, segmentIndex) => {
              // 20 total segments. If normalized height * 20 > current segment, light it up.
              const threshold = (19 - segmentIndex) / 20
              const isActive = normalized > threshold

              return (
                <motion.div
                  key={segmentIndex}
                  className="h-3 w-full rounded-[1px] md:h-4"
                  initial={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  animate={{
                    backgroundColor: isActive
                      ? getGlowColor(normalized)
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: isActive
                      ? `0 0 10px ${getGlowColor(normalized)}`
                      : 'none',
                  }}
                  transition={{
                    type: 'tween',
                    duration: 0.05,
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
