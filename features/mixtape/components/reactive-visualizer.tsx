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
    <div className="pointer-events-none absolute inset-0 z-0 flex items-end justify-between gap-1 overflow-hidden px-4 opacity-40 lg:px-20">
      {bars.map((value, index) => {
        const normalized = value / 255
        
        // Studio EQ color mapping (green -> yellow -> red)
        const getColor = (val: number) => {
          if (val > 0.8) return '#ef4444' // Red peak
          if (val > 0.5) return '#f59e0b' // Amber mid
          return '#10b981' // Green low
        }

        const color = getColor(normalized)

        return (
          <motion.div
            key={index}
            className="relative flex-1 rounded-sm"
            style={{
              height: '100%',
              transformOrigin: 'bottom',
              background: `repeating-linear-gradient(to top, 
                ${color} 0px, 
                ${color} 6px, 
                transparent 6px, 
                transparent 8px
              )`,
            }}
            animate={{
              scaleY: normalized,
              opacity: normalized > 0.05 ? 1 : 0.1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              restDelta: 0.001
            }}
          >
            {/* High-intensity peak glow */}
            {normalized > 0.7 && (
              <div 
                className="absolute top-0 left-0 w-full h-2 rounded-full blur-[4px]" 
                style={{ backgroundColor: color }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
