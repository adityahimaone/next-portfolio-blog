'use client'

import { useRef } from 'react'
import { m as motion, useScroll, useTransform } from 'motion/react'
import { Screw } from '@/components/screw'

interface CableConnectorProps {
  /** Color of the cable body and LED indicators (hex). Default: '#1a1a1a' */
  color?: string
  /** Label for the output jack. Example: 'ABOUT' */
  fromLabel?: string
  /** Label for the input jack. Example: 'SKILLS' */
  toLabel?: string
  /** Disable scroll animation (for mobile). Renders a static cable. Default: false */
  disabled?: boolean
  /** Direction the cable sways/loops. Default: 'left' */
  sway?: 'left' | 'right'
}

export function CableConnector({
  color = '#1a1a1a',
  fromLabel,
  toLabel,
  disabled = false,
  sway = 'left',
}: CableConnectorProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Scroll transforms for cable opacity and LED glow
  const rawCableOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.3, 1, 1, 0.3]
  )
  const rawLedOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0.15, 1, 1, 0.15]
  )

  const cableOpacity = disabled ? 0.75 : rawCableOpacity
  const ledOpacity = disabled ? 0.6 : rawLedOpacity

  // Single performant transform that calculates the path string dynamically
  const pathD = useTransform(scrollYProgress, (progress) => {
    if (disabled) {
      return sway === 'left'
        ? 'M 100 55 C 55 85, 55 215, 100 185'
        : 'M 100 55 C 145 85, 145 215, 100 185'
    }

    // progress ranges from 0 (top of viewport) to 1 (bottom of viewport)
    // t reaches 0 when the connector is perfectly in the center of the viewport
    const t = Math.abs(progress - 0.5) * 2 // [0, 1] range
    
    // Interpolate sway and droop: relaxed at the center (t=0), tauter at boundaries (t=1)
    const currentSwayWidth = 65 - t * 35  // 65px sway at center, 30px at edges
    const currentDroop = 55 - t * 35      // 55px droop at center, 20px at edges

    const x1 = sway === 'left' ? 100 - currentSwayWidth : 100 + currentSwayWidth
    const x2 = x1
    const y1 = 55 + currentDroop
    const y2 = 185 + currentDroop

    return `M 100 55 C ${x1} ${y1}, ${x2} ${y2}, 100 185`
  })

  return (
    <div
      ref={ref}
      className="flex flex-col items-center py-4 select-none"
    >
      {/* Top Socket Label Badge */}
      {fromLabel && (
        <div className="mb-3.5 flex items-center gap-1.5 rounded-sm bg-zinc-300/40 dark:bg-zinc-800/40 border border-black/15 dark:border-white/5 px-2 py-0.5 shadow-inner backdrop-blur-xs">
          <Screw className="h-1.5 w-1.5 opacity-55" />
          <span className="font-mono text-[8px] font-extrabold tracking-wider text-black/50 dark:text-white/40 uppercase">
            {fromLabel} · OUT
          </span>
          <Screw className="h-1.5 w-1.5 opacity-55" />
        </div>
      )}

      {/* SVG Skeuomorphic Cable Connector Assembly */}
      <svg
        width={200}
        height={240}
        viewBox="0 0 200 240"
        className="overflow-visible my-1"
      >
        <defs>
          {/* Metallic socket ring gradient */}
          <linearGradient id="metal-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4e4e7" />
            <stop offset="35%" stopColor="#a1a1aa" />
            <stop offset="75%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>

          {/* Metallic plug barrel cylindrical shine */}
          <linearGradient id="metal-plug" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="20%" stopColor="#a1a1aa" />
            <stop offset="50%" stopColor="#f4f4f5" />
            <stop offset="80%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>

          {/* LED Active Glow */}
          <filter id="led-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 3D Cable Shadow */}
          <filter id="cable-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="3" dy="10" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* --- CABLE PATHS (Rendered behind the plugs for insertion look) --- */}
        {/* Soft Drop Shadow */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,1)"
          strokeWidth={6.5}
          strokeLinecap="round"
          filter="url(#cable-shadow)"
          style={{ opacity: cableOpacity }}
        />
        {/* Cable Body */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          style={{ opacity: cableOpacity }}
        />
        {/* Cylindrical Highlight / Bevel Sheen */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1.8}
          strokeLinecap="round"
          transform="translate(-1, -1)"
          style={{ opacity: cableOpacity }}
        />

        {/* --- TOP ASSEMBLY (Socket & Inserted Plug) --- */}
        {/* Bezel Collar */}
        <circle cx="100" cy="20" r="13" fill="url(#metal-ring)" stroke="#09090b" strokeWidth="1.5" />
        <circle cx="100" cy="20" r="9.5" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="100" cy="20" r="7" fill="#09090b" stroke="#18181b" />

        {/* LED Glowing Ring */}
        <motion.circle
          cx="100"
          cy="20"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          filter="url(#led-glow)"
          style={{ opacity: ledOpacity }}
        />

        {/* Metal Plug Barrel */}
        <rect x="95" y="20" width="10" height="15" rx="1" fill="url(#metal-plug)" stroke="#09090b" strokeWidth="0.5" />
        {/* Rubber Boot / Sleeve */}
        <rect x="96" y="35" width="8" height="20" rx="1.5" fill={color} stroke="#09090b" strokeWidth="0.5" />
        {/* Ribbed grips */}
        <line x1="97" y1="40" x2="103" y2="40" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="97" y1="45" x2="103" y2="45" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="97" y1="50" x2="103" y2="50" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />


        {/* --- BOTTOM ASSEMBLY (Socket & Inserted Plug) --- */}
        {/* Bezel Collar */}
        <circle cx="100" cy="220" r="13" fill="url(#metal-ring)" stroke="#09090b" strokeWidth="1.5" />
        <circle cx="100" cy="220" r="9.5" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="100" cy="220" r="7" fill="#09090b" stroke="#18181b" />

        {/* LED Glowing Ring */}
        <motion.circle
          cx="100"
          cy="220"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          filter="url(#led-glow)"
          style={{ opacity: ledOpacity }}
        />

        {/* Metal Plug Barrel */}
        <rect x="95" y="205" width="10" height="15" rx="1" fill="url(#metal-plug)" stroke="#09090b" strokeWidth="0.5" />
        {/* Rubber Boot / Sleeve */}
        <rect x="96" y="185" width="8" height="20" rx="1.5" fill={color} stroke="#09090b" strokeWidth="0.5" />
        {/* Ribbed grips */}
        <line x1="97" y1="190" x2="103" y2="190" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="97" y1="195" x2="103" y2="195" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="97" y1="200" x2="103" y2="200" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
      </svg>

      {/* Bottom Socket Label Badge */}
      {toLabel && (
        <div className="mt-3.5 flex items-center gap-1.5 rounded-sm bg-zinc-300/40 dark:bg-zinc-800/40 border border-black/15 dark:border-white/5 px-2 py-0.5 shadow-inner backdrop-blur-xs">
          <Screw className="h-1.5 w-1.5 opacity-55" />
          <span className="font-mono text-[8px] font-extrabold tracking-wider text-black/50 dark:text-white/40 uppercase">
            {toLabel} · IN
          </span>
          <Screw className="h-1.5 w-1.5 opacity-55" />
        </div>
      )}
    </div>
  )
}
