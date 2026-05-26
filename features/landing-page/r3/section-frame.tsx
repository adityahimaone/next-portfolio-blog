'use client'

/**
 * Wrapper for every r3 section. Renders a consistent container with
 * track strip header, scroll-margin offset, and proper section semantics.
 *
 * Usage:
 *   <SectionFrame id="about" track="02" name="ABOUT" device="..." color="clip">
 *     <PianoRoll ... />
 *   </SectionFrame>
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TrackStrip } from './track-strip'

interface SectionFrameProps {
  id: string
  track: string
  name: string
  device: string
  color?: 'clip' | 'beat' | 'signal' | 'filament' | 'melody'
  status?: string
  bpm?: number
  className?: string
  children: ReactNode
}

export function SectionFrame({
  id,
  track,
  name,
  device,
  color = 'signal',
  status = 'ARMED',
  bpm = 120,
  className,
  children,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-20 px-4 py-10 sm:px-6 sm:py-16 lg:px-10 lg:py-24',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <TrackStrip
          trackNumber={track}
          trackName={name}
          deviceLabel={device}
          color={color}
          status={status}
          bpm={bpm}
          className="mb-6 sm:mb-10"
        />
        {children}
      </div>
    </section>
  )
}
