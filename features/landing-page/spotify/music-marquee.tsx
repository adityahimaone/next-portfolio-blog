'use client'

import { cn } from '@/lib/utils'
import { useAudio } from './audio-context'

interface MusicMarqueeProps {
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'left' | 'right'
}

const signalPhrases = [
  'DIGITAL / ANALOG / INTERFACE',
  'CREATIVE DEVELOPER',
  'JAKARTA, ID',
  'SYSTEM 001',
  'CODE IN RHYTHM',
  'FRONTEND SIGNAL CHAIN',
]

const speedMap = {
  slow: '60s',
  normal: '40s',
  fast: '25s',
}

export function MusicMarquee({
  className,
  speed = 'normal',
  direction = 'left',
}: MusicMarqueeProps) {
  const { isPlaying, currentTrack } = useAudio()
  const animationClass =
    direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
  const marqueePhrases = isPlaying
    ? [currentTrack, ...signalPhrases]
    : signalPhrases

  return (
    <section
      aria-label="Creative developer signal"
      className={cn(
        'relative isolate overflow-hidden border-y border-[#d6ad45]/25 bg-[#16191b] py-3 text-[#f1eee5] shadow-[inset_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.18)]',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(255,255,255,0.025)_4px)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#16191b] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#16191b] to-transparent"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="hidden shrink-0 items-center gap-2 border-r border-white/10 pr-3 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7abb5e] shadow-[0_0_7px_#7abb5e]" />
          <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/45">
            LIVE BUS
          </span>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className={cn('flex w-max whitespace-nowrap', animationClass)}
            style={{ animationDuration: speedMap[speed] }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center">
                {marqueePhrases.map((phrase) => (
                  <div
                    key={`${copy}-${phrase}`}
                    className="mx-5 flex items-center gap-5"
                  >
                    <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-[#f1eee5]/80 sm:text-[11px]">
                      {phrase}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-[#e0b75a] shadow-[0_0_6px_#e0b75a]"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 border-l border-white/10 pl-3 md:flex">
          <span className="font-mono text-[8px] tracking-[0.18em] text-white/35">
            120 BPM
          </span>
          <span className="h-1 w-8 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-2/3 bg-[#e0b75a] shadow-[0_0_6px_#e0b75a]" />
          </span>
        </div>
      </div>
    </section>
  )
}
