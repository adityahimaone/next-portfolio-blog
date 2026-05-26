'use client'

import { m as motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

interface SectionConnectorProps {
  variant: 'waveform' | 'cable' | 'frequency' | 'groove'
  label?: string
  channelNumber?: number
}

/**
 * Themed section connectors that create visual narrative between sections.
 * Each variant represents a stage in the audio signal chain.
 */
export function SectionConnector({
  variant = 'waveform',
  label,
  channelNumber,
}: SectionConnectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const pathProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className="relative flex flex-col items-center py-8 md:py-12">
      {/* Channel Label */}
      {(label || channelNumber !== undefined) && (
        <motion.div
          style={{ opacity }}
          className="mb-6 flex items-center gap-3"
        >
          {channelNumber !== undefined && (
            <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.3em] text-copper dark:text-copper-light">
              CH {String(channelNumber).padStart(2, '0')}
            </span>
          )}
          {label && (
            <>
              <div className="h-px w-6 bg-copper/30 dark:bg-copper-light/30" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 dark:text-stone-400">
                {label}
              </span>
            </>
          )}
        </motion.div>
      )}

      {/* Connector Visual */}
      <div className="relative flex w-full max-w-md items-center justify-center">
        {variant === 'waveform' && <WaveformConnector progress={pathProgress} opacity={opacity} />}
        {variant === 'cable' && <CableConnector progress={pathProgress} opacity={opacity} />}
        {variant === 'frequency' && <FrequencyConnector progress={pathProgress} opacity={opacity} />}
        {variant === 'groove' && <GrooveConnector progress={pathProgress} opacity={opacity} />}
      </div>
    </div>
  )
}

/** Animated sine wave — represents audio signal flowing between sections */
function WaveformConnector({ progress, opacity }: { progress: any; opacity: any }) {
  return (
    <motion.div style={{ opacity }} className="relative h-16 w-full max-w-xs overflow-hidden">
      <svg
        viewBox="0 0 300 60"
        fill="none"
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {/* Background waveform (static) */}
        <motion.path
          d="M0 30 Q25 10 50 30 Q75 50 100 30 Q125 10 150 30 Q175 50 200 30 Q225 10 250 30 Q275 50 300 30"
          stroke="currentColor"
          strokeWidth="1"
          className="text-stone-200 dark:text-stone-800"
          fill="none"
        />
        {/* Animated waveform (draws on scroll) */}
        <motion.path
          d="M0 30 Q25 10 50 30 Q75 50 100 30 Q125 10 150 30 Q175 50 200 30 Q225 10 250 30 Q275 50 300 30"
          stroke="currentColor"
          strokeWidth="2"
          className="text-copper dark:text-copper-light"
          fill="none"
          style={{ pathLength: progress }}
          strokeLinecap="round"
        />
        {/* Signal dot */}
        <motion.circle
          r="3"
          fill="currentColor"
          className="text-signal dark:text-signal-light"
          style={{
            offsetPath:
              "path('M0 30 Q25 10 50 30 Q75 50 100 30 Q125 10 150 30 Q175 50 200 30 Q225 10 250 30 Q275 50 300 30')",
            offsetDistance: progress,
          }}
        >
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </motion.circle>
      </svg>
    </motion.div>
  )
}

/** Patch cable with plug endpoints — represents physical audio routing */
function CableConnector({ progress, opacity }: { progress: any; opacity: any }) {
  return (
    <motion.div style={{ opacity }} className="relative flex h-20 w-full max-w-xs items-center justify-center">
      {/* Left jack */}
      <div className="z-10 flex flex-col items-center">
        <div className="h-4 w-4 rounded-full border-2 border-stone-300 bg-stone-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] dark:border-stone-700 dark:bg-stone-800">
          <div className="m-auto mt-0.5 h-2 w-2 rounded-full bg-stone-900/80 dark:bg-stone-950" />
        </div>
      </div>

      {/* Cable path */}
      <svg viewBox="0 0 200 50" fill="none" className="mx-2 h-12 flex-1">
        <motion.path
          d="M0 25 C30 5, 70 45, 100 25 C130 5, 170 45, 200 25"
          stroke="currentColor"
          strokeWidth="3"
          className="text-stone-800 dark:text-stone-300"
          fill="none"
          style={{ pathLength: progress }}
          strokeLinecap="round"
        />
        {/* Highlight stripe on cable */}
        <motion.path
          d="M0 24 C30 4, 70 44, 100 24 C130 4, 170 44, 200 24"
          stroke="currentColor"
          strokeWidth="1"
          className="text-stone-600 dark:text-stone-500"
          fill="none"
          style={{ pathLength: progress }}
          strokeLinecap="round"
        />
      </svg>

      {/* Right jack */}
      <div className="z-10 flex flex-col items-center">
        <div className="h-4 w-4 rounded-full border-2 border-stone-300 bg-stone-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] dark:border-stone-700 dark:bg-stone-800">
          <div className="m-auto mt-0.5 h-2 w-2 rounded-full bg-stone-900/80 dark:bg-stone-950" />
        </div>
      </div>
    </motion.div>
  )
}

/** Animated frequency spectrum bars — represents audio processing */
function FrequencyConnector({ progress, opacity }: { progress: any; opacity: any }) {
  const barCount = 24
  return (
    <motion.div style={{ opacity }} className="flex h-12 items-end justify-center gap-[2px]">
      {Array.from({ length: barCount }).map((_, i) => {
        const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2)
        const maxHeight = (1 - centerDistance * 0.7) * 100
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-t-[1px] bg-gradient-to-t from-copper/80 to-copper-light/60 dark:from-copper-light/80 dark:to-copper/60"
            initial={{ height: 2 }}
            whileInView={{
              height: [2, maxHeight * 0.3, maxHeight * 0.8, maxHeight * 0.5, 2],
            }}
            viewport={{ once: false, margin: '-50px' }}
            transition={{
              duration: 2,
              delay: i * 0.04,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </motion.div>
  )
}

/** Concentric arcs — represents vinyl groove rings */
function GrooveConnector({ progress, opacity }: { progress: any; opacity: any }) {
  return (
    <motion.div style={{ opacity }} className="relative flex h-16 w-full max-w-xs items-center justify-center">
      <svg viewBox="0 0 300 60" fill="none" className="h-full w-full">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 30
          const radius = 8 + i * 7
          return (
            <motion.circle
              key={i}
              cx="150"
              cy={y}
              r={radius}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-stone-300 dark:text-stone-700"
              fill="none"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 0.6, scale: 1 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          )
        })}
        {/* Center dot */}
        <motion.circle
          cx="150"
          cy="30"
          r="3"
          fill="currentColor"
          className="text-copper dark:text-copper-light"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: '-50px' }}
          transition={{ delay: 0.3, type: 'spring' }}
        />
      </svg>
    </motion.div>
  )
}
