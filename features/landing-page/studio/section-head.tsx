'use client'

import { useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { ArrowUpRight } from './doodles'
import { Reveal } from './reveal'
import { ScriptWord } from './script-word'
import { scrollToSection } from './studio-data'

type HeadProps = {
  number: string
  label: string
  script: string
  title: ReactNode
  intro?: ReactNode
  onDark?: boolean
  className?: string
}

/**
 * The page's chapter opener. Six sections share it, which is what makes the
 * numbering, the marker script and the type scale read as one document rather
 * than six landing pages stacked on top of each other.
 */
export function SectionHead({
  number,
  label,
  script,
  title,
  intro,
  onDark,
  className,
}: HeadProps) {
  return (
    <header className={cn('relative', className)} data-reveal-group>
      <Reveal>
        <div
          className={cn(
            'flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase sm:text-[11px]',
            onDark ? 'text-[var(--paper)]/85' : 'text-[var(--muted)]',
          )}
        >
          <span
            className={cn(
              'grid size-7 place-items-center rounded-full border text-[10px] tracking-normal',
              onDark
                ? 'border-[var(--paper)]/30 text-[var(--butter)]'
                : 'border-[var(--ink)]/25 text-[var(--ink)]',
            )}
          >
            {number}
          </span>
          <span className="h-px w-8 bg-current/40" aria-hidden />
          <span>{label}</span>
        </div>
      </Reveal>

      <div className="mt-5 grid gap-5 md:mt-7 md:grid-cols-[minmax(0,1fr)_minmax(15rem,24rem)] md:items-end md:gap-12">
        <div>
          <ScriptWord
            text={script}
            delay={0.05}
            className={cn(
              'mb-2 h-10 w-auto origin-left sm:h-12 md:mb-3 md:h-14',
              onDark ? 'text-[var(--butter)]' : 'text-[var(--tangerine)]',
            )}
          />
          <Reveal delay={0.08}>
            <h2
              className={cn(
                'font-[family-name:var(--deck-font-display)] text-[clamp(2.1rem,4.3vw,4.2rem)] leading-[0.94] font-extrabold tracking-[-0.045em] [text-wrap:balance]',
                onDark ? 'text-[var(--paper)]' : 'text-[var(--ink)]',
              )}
            >
              {title}
            </h2>
          </Reveal>
        </div>
        {intro ? (
          <Reveal delay={0.16}>
            <p
              className={cn(
                'max-w-[38ch] text-sm leading-relaxed sm:text-[15px]',
                onDark ? 'text-[var(--paper)]/85' : 'text-[var(--muted)]',
              )}
            >
              {intro}
            </p>
          </Reveal>
        ) : null}
      </div>
    </header>
  )
}

type NextProps = {
  href: string
  label: string
  note: string
  onDark?: boolean
}

/** The hand-off between chapters. The page should feel like it is leading you on. */
export function SectionNext({ href, label, note, onDark }: NextProps) {
  const reduced = useReducedMotion() ?? false
  return (
    <div
      className={cn(
        'mt-16 flex flex-col gap-4 border-t pt-5 sm:mt-24 sm:flex-row sm:items-center sm:justify-between',
        onDark ? 'border-[var(--paper)]/20' : 'border-[var(--ink)]/15',
      )}
    >
      <p
        className={cn(
          'font-mono text-[10px] tracking-[0.2em] uppercase',
          onDark ? 'text-[var(--paper)]/85' : 'text-[var(--muted)]',
        )}
      >
        Next · {note}
      </p>
      <button
        type="button"
        onClick={() => scrollToSection(href, reduced)}
        className={cn(
          'group inline-flex items-center gap-3 self-start text-left font-[family-name:var(--deck-font-display)] text-2xl font-bold tracking-[-0.03em] transition-colors sm:self-auto sm:text-3xl',
          onDark
            ? 'text-[var(--paper)] hover:text-[var(--butter)]'
            : 'text-[var(--ink)] hover:text-[var(--cobalt)]',
        )}
      >
        {label}
        <span
          className={cn(
            'grid size-9 place-items-center rounded-full border transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
            onDark ? 'border-[var(--paper)]/30' : 'border-[var(--ink)]/25',
          )}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </button>
    </div>
  )
}
