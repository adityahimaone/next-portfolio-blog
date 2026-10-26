'use client'

import { ArrowDownRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useAudioEngine } from '../../audio/engine'
import { Waveform } from '../audio/waveform'
import { HeroStatement } from '../motion/reveal'
import { useMagnetic } from '../../interactive/use-pointer'
import { scrollToSection } from '../../scroll/smooth-scroll'
import { formatClock } from '../../lib/format'
import { Turntable } from './turntable'

function PlaybackPill() {
  const {
    isPlaying,
    isMuted,
    track,
    toggle,
    toggleMute,
    currentTime,
    duration,
    error,
  } = useAudioEngine()

  return (
    <div className="lg-glass lg-glass--lit flex w-full max-w-[380px] items-center gap-4 rounded-[22px] p-3 pr-4">
      <button
        type="button"
        onClick={() => void toggle()}
        className="lg-play shrink-0"
        data-playing={isPlaying}
        aria-label={
          isPlaying ? 'Pause the ambient loop' : 'Play the ambient loop'
        }
      >
        {isPlaying ? (
          <Pause size={15} strokeWidth={1.75} fill="currentColor" />
        ) : (
          <Play
            size={14}
            strokeWidth={1.75}
            fill="currentColor"
            className="-ml-[1px]"
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[13px] font-medium tracking-[-0.01em]">
            {track.title}
          </p>
          {/* The clock updates four times a second; it is decorative for a
              screen reader, the track title is not. */}
          <span
            aria-hidden="true"
            className="lg-mono lg-mono--sm shrink-0 text-[10px] text-[var(--lg-ink-faint)]"
          >
            {formatClock(currentTime)} / {formatClock(duration || 222)}
          </span>
        </div>
        <p className="lg-mono mt-0.5 text-[9px] text-[var(--lg-ink-faint)]">
          {track.bpm} BPM · {track.key} · {track.role}
        </p>
        <div className="mt-2 flex items-end gap-3">
          <Waveform bars={38} height={16} className="lg-wave flex-1" />
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMute}
        className="shrink-0 text-[var(--lg-ink-faint)] transition-colors hover:text-[var(--lg-ink)]"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>

      {error ? (
        <p className="lg-sr-only" role="status">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function ListenButton() {
  const ref = useMagnetic<HTMLButtonElement>(0.18, 70)
  const { isPlaying, toggle } = useAudioEngine()

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => void toggle()}
      className="group relative inline-flex h-12 items-center gap-3 rounded-full border border-white/15 bg-white/[0.055] pr-5 pl-2 text-[13px] font-medium tracking-[-0.01em] text-[var(--lg-ink)] transition-colors duration-500 hover:bg-white/[0.09]"
      style={{ willChange: 'transform' }}
    >
      <span className="lg-play h-8 w-8" data-playing={isPlaying}>
        {isPlaying ? (
          <Pause size={11} strokeWidth={2} fill="currentColor" />
        ) : (
          <Play
            size={11}
            strokeWidth={2}
            fill="currentColor"
            className="-ml-[1px]"
          />
        )}
      </span>
      {isPlaying ? 'Pause the room' : 'Play the room'}
      <span className="lg-mono lg-mono--sm text-[9px] text-[var(--lg-ink-faint)]">
        01
      </span>
    </button>
  )
}

export function Hero() {
  const { isPlaying, track } = useAudioEngine()

  return (
    <section
      id="index"
      className="relative flex min-h-[100svh] flex-col justify-between pt-8 pb-28 lg:pt-10"
      aria-labelledby="hero-title"
    >
      {/* Sleeve header */}
      <div className="lg-page flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-[7px] w-[7px] items-center justify-center">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-[var(--lg-amber)] opacity-60"
              style={{
                animation: isPlaying
                  ? 'lg-pulse 2.2s ease-out infinite'
                  : 'none',
              }}
            />
            <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-[var(--lg-amber)]" />
          </span>
          <span className="lg-mono text-[var(--lg-ink-dim)]">
            Aditya Himawan
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="lg-mono hidden text-[var(--lg-ink-faint)] sm:inline">
            Jakarta, ID · GMT+7
          </span>
          <span className="lg-mono text-[var(--lg-ink-faint)]">
            Portfolio — Side Two
          </span>
        </div>
      </div>

      {/* Main stage */}
      <div className="lg-page grid w-full items-center gap-10 py-12 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:py-8">
        <div className="max-w-[560px]">
          <p className="lg-eyebrow lg-mono text-[var(--lg-ink-faint)]">
            Signal · Sound · Systems
          </p>

          <HeroStatement
            lines={['Designing interfaces', 'with a pulse.']}
            className="lg-display mt-6 text-[clamp(2.6rem,6.1vw,4.9rem)] text-[var(--lg-ink)]"
          />

          <p className="lg-body mt-7 max-w-[46ch] text-[15px] sm:text-base">
            Frontend engineer and interface designer. I build sound-first
            digital experiences — quiet surfaces, precise motion, and a little
            warmth.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ListenButton />
            <button
              type="button"
              onClick={() => scrollToSection('#works')}
              className="group inline-flex h-12 items-center gap-2 px-1 text-[13px] font-medium text-[var(--lg-ink-dim)] transition-colors hover:text-[var(--lg-ink)]"
            >
              Selected works
              <ArrowDownRight
                size={15}
                className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.07] pt-5 lg:mt-16">
            <span className="lg-mono text-[var(--lg-ink-faint)]">
              Work 2021 — 2026
            </span>
            <span className="lg-mono text-[var(--lg-ink-faint)]">
              {track.artist}
            </span>
            <span className="lg-mono text-[var(--lg-ink-faint)]">Side B</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 lg:items-end">
          <Turntable />
          <PlaybackPill />
        </div>
      </div>

      {/* Sleeve footer */}
      <div className="lg-page flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => scrollToSection('#works')}
          className="lg-mono group flex items-center gap-3 text-[var(--lg-ink-faint)] transition-colors hover:text-[var(--lg-ink)]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12">
            <ArrowDownRight
              size={13}
              className="transition-transform duration-500 group-hover:translate-y-0.5"
            />
          </span>
          Scroll for Side Two
        </button>

        <span className="lg-mono hidden text-[var(--lg-ink-faint)] lg:inline">
          Signal Records — 2026
        </span>
      </div>
    </section>
  )
}
