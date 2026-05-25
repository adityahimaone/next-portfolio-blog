'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { m, useMotionValue, animate, useReducedMotion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'
import { Screw } from '@/components/screw'
import { Power } from 'lucide-react'

import { MIXER_DATA } from '../constants'

// --- Helper Components ---

const RackScrew = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex h-2 w-2 items-center justify-center rounded-full border shadow-inner',
      'border-[var(--color-border-default)] bg-[var(--color-surface)]',
      className,
    )}
  >
    <div className="h-px w-full rotate-45 bg-[var(--color-border-strong)]" />
    <div className="absolute h-px w-full -rotate-45 bg-[var(--color-border-strong)]" />
  </div>
)

const LEDIndicator = ({ level, isOn }: { level: number; isOn: boolean }) => {
  const getColor = () => {
    if (!isOn) return 'bg-zinc-800'
    if (level >= 90) return 'bg-[var(--color-moss)] shadow-[0_0_8px_var(--color-moss)]'
    if (level >= 70) return 'bg-[var(--color-ochre)] shadow-[0_0_8px_var(--color-ochre)]'
    return 'bg-[var(--color-terracotta)] shadow-[0_0_6px_var(--color-terracotta)]'
  }

  return (
    <div
      className={cn(
        'h-1.5 w-1.5 rounded-full transition-all duration-300',
        getColor(),
      )}
    />
  )
}

const VUMeter = ({ level, isOn }: { level: number; isOn: boolean }) => {
  const bars = 12

  return (
    <div className="flex h-full w-8 flex-col-reverse gap-0.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-charcoal)] p-1">
      {[...Array(bars)].map((_, i) => {
        const isActive = isOn && i < Math.floor((level / 100) * bars)
        const isPeak = i >= bars - 2
        const isHot = i >= bars - 4 && i < bars - 2

        return (
          <m.div
            key={i}
            className={cn(
              'h-full w-full rounded-[1px]',
              isActive
                ? isPeak
                  ? 'bg-[var(--color-terracotta)]'
                  : isHot
                    ? 'bg-[var(--color-ochre)]'
                    : 'bg-[var(--color-moss)]'
                : 'bg-zinc-800/50',
            )}
            animate={
              isActive
                ? { opacity: [0.7, 1, 0.7] }
                : { opacity: 0.3 }
            }
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.05,
            }}
          />
        )
      })}
    </div>
  )
}

const RackFader = ({
  value,
  label,
  index = 0,
  isOn,
}: {
  value: number
  label: string
  index?: number
  isOn: boolean
}) => {
  const maxTravel = 80
  const initialY = -((value / 100) * maxTravel)
  const y = useMotionValue(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) {
      y.set(initialY)
      return
    }
    const controls = animate(y, initialY, {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1],
      delay: index * 0.08,
    })
    return () => controls.stop()
  }, [initialY, index, prefersReduced])

  return (
    <div className="group relative flex h-full touch-none flex-col items-center gap-2">
      <span
        className="pointer-events-none absolute -top-5 z-20 rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] text-[var(--color-ochre)] opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
        style={{ fontFamily: 'var(--font-mono)' }}
        aria-hidden="true"
      >
        {value}%
      </span>
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isOn ? value : 0}
        aria-orientation="vertical"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault()
            const newY = Math.max(-maxTravel, y.get() - 4)
            y.set(newY)
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault()
            const newY = Math.min(0, y.get() + 4)
            y.set(newY)
          }
        }}
        className="relative flex h-32 w-10 justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-charcoal)] py-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)] focus:ring-offset-2 focus:ring-offset-[var(--color-charcoal)]"
      >
        {/* Track */}
        <div className="absolute top-3 bottom-3 w-1 rounded-full bg-zinc-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />

        {/* Ticks */}
        <div className="absolute top-3 bottom-3 left-1.5 flex flex-col justify-between py-0.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-px w-1 bg-[var(--color-border-default)]" />
          ))}
        </div>

        {/* Fader Cap */}
        <m.div
          className="absolute bottom-3 left-1/2 z-10 flex h-10 w-7 min-h-[44px] -translate-x-1/2 cursor-grab items-center justify-center rounded border-t shadow-[0_4px_6px_rgba(0,0,0,0.5)] active:cursor-grabbing"
          style={{
            y,
            borderColor: 'var(--color-ochre)',
            background: 'linear-gradient(to bottom, var(--color-ochre), rgb(180, 140, 60))',
          }}
          drag="y"
          dragConstraints={{ top: -maxTravel, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
        >
          <div className="mb-0.5 h-px w-full bg-zinc-950/30" />
          <div className="h-px w-full bg-zinc-950/30" />
          <div className="mt-0.5 h-px w-full bg-zinc-950/30" />
        </m.div>
      </div>
      <span
        className="text-[9px] font-bold tracking-widest text-[var(--color-slate)] uppercase select-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
    </div>
  )
}

const RackKnob = ({
  value,
  label,
  index = 0,
  isOn,
}: {
  value: number
  label: string
  index?: number
  isOn: boolean
}) => {
  const minDeg = -135
  const maxDeg = 135
  const startDeg = (value / 100) * 270 - 135
  const rotation = useMotionValue(minDeg)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) {
      rotation.set(startDeg)
      return
    }
    const controls = animate(rotation, startDeg, {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
      delay: index * 0.08,
    })
    return () => controls.stop()
  }, [startDeg, index, prefersReduced])

  const handlePan = (_: any, info: { delta: { y: number } }) => {
    const current = rotation.get()
    const delta = -info.delta.y * 2
    const newRot = Math.min(maxDeg, Math.max(minDeg, current + delta))
    rotation.set(newRot)
  }

  return (
    <div className="group relative flex touch-none flex-col items-center gap-2">
      <span
        className="pointer-events-none absolute -top-5 rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] text-[var(--color-ochre)] opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
        style={{ fontFamily: 'var(--font-mono)' }}
        aria-hidden="true"
      >
        {value}%
      </span>
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isOn ? value : 0}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault()
            const newDeg = Math.min(maxDeg, rotation.get() + 13.5)
            rotation.set(newDeg)
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault()
            const newDeg = Math.max(minDeg, rotation.get() - 13.5)
            rotation.set(newDeg)
          }
        }}
        className="relative flex h-16 w-16 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ochre)] focus:ring-offset-2 focus:ring-offset-[var(--color-charcoal)]"
      >
        {/* Ticks */}
        {[...Array(11)].map((_, i) => {
          const rot = (i / 10) * 270 - 135
          return (
            <div
              key={i}
              className="absolute h-full w-full"
              style={{ transform: `rotate(${rot}deg)` }}
            >
              <div
                className="absolute top-1 left-1/2 h-1 w-px -translate-x-1/2 bg-[var(--color-border-strong)]"
              />
            </div>
          )
        })}

        {/* The Knob */}
        <m.div
          className="relative h-12 w-12 cursor-grab rounded-full border border-zinc-950 shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] active:cursor-grabbing"
          style={{
            rotate: rotation,
            background:
              'radial-gradient(circle at 30% 30%, var(--color-surface), var(--color-charcoal))',
          }}
          onPan={handlePan}
        >
          {/* Indicator Dot */}
          <div
            className="absolute top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-[0_0_5px_var(--color-ochre)]"
            style={{ backgroundColor: 'var(--color-ochre)' }}
          />
        </m.div>
      </div>
      <span
        className="text-[9px] font-bold tracking-widest text-[var(--color-slate)] uppercase select-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
    </div>
  )
}

// --- Rack Unit Component (each skill category) ---

const RackSection = ({
  group,
  index,
  isOn,
}: {
  group: (typeof MIXER_DATA)[number]
  index: number
  isOn: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReduced = useReducedMotion()
  const is2U = group.type === 'fader'

  return (
    <m.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : undefined}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: index * 0.15,
      }}
      className={cn(
        'relative rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.3)]',
        is2U ? 'min-h-[280px]' : 'min-h-[200px]',
      )}
    >
      {/* Rack screw holes */}
      <RackScrew className="absolute top-3 left-3" />
      <RackScrew className="absolute top-3 right-3" />
      <RackScrew className="absolute bottom-3 left-3" />
      <RackScrew className="absolute right-3 bottom-3" />

      {/* Unit Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <div className="flex items-center gap-3">
          <LEDIndicator level={isOn ? 90 : 0} isOn={isOn} />
          <h4
            className="text-sm font-bold tracking-widest text-[var(--color-highlight)] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {group.label}
          </h4>
        </div>
        <span
          className="text-[10px] text-[var(--color-slate)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {group.type === 'fader' ? 'FADER BANK' : 'ROTARY CTRL'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-end justify-center gap-3 md:gap-4">
        <div className="hidden sm:block">
          <VUMeter
            level={isOn ? Math.max(...group.channels.map((c) => c.level)) : 0}
            isOn={isOn}
          />
        </div>

        <div
          className={cn(
            'flex flex-wrap items-end justify-center gap-3 md:gap-5',
            group.type === 'fader' ? 'gap-2 md:gap-4' : 'gap-4 md:gap-6',
          )}
        >
          {group.channels.map((skill, i) =>
            group.type === 'fader' ? (
              <RackFader
                key={skill.name}
                value={isOn ? skill.level : 0}
                label={skill.name}
                index={i}
                isOn={isOn}
              />
            ) : (
              <RackKnob
                key={skill.name}
                value={isOn ? skill.level : 0}
                label={skill.name}
                index={i}
                isOn={isOn}
              />
            ),
          )}
        </div>

        <div className="hidden sm:block">
          <VUMeter
            level={
              isOn
                ? Math.round(
                    group.channels.reduce((a, c) => a + c.level, 0) /
                      group.channels.length,
                  )
                : 0
            }
            isOn={isOn}
          />
        </div>
      </div>

      {/* Bottom LED strip */}
      <div className="mt-4 flex items-center justify-center gap-2 border-t border-[var(--color-border-subtle)] pt-3">
        {group.channels.map((skill) => (
          <div key={skill.name} className="flex flex-col items-center gap-1">
            <LEDIndicator level={skill.level} isOn={isOn} />
          </div>
        ))}
      </div>
    </m.div>
  )
}

// --- Power Switch ---

const PowerSwitch = ({
  isOn,
  onToggle,
}: {
  isOn: boolean
  onToggle: () => void
}) => (
  <button
    onClick={onToggle}
    aria-label={isOn ? 'Turn Rack Power Off' : 'Turn Rack Power On'}
    className={cn(
      'relative flex h-12 w-12 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300',
      isOn
        ? 'border-[var(--color-ochre)] bg-[var(--color-surface)] shadow-[0_0_20px_var(--color-ochre),inset_0_0_10px_rgba(0,0,0,0.3)]'
        : 'border-[var(--color-border-default)] bg-[var(--color-charcoal)] shadow-inner',
    )}
  >
    <Power
      className={cn(
        'h-5 w-5 transition-colors duration-300',
        isOn ? 'text-[var(--color-ochre)]' : 'text-[var(--color-slate)]',
      )}
    />
  </button>
)

// --- Main Section Export ---

export function SkillsSection() {
  const [isOn, setIsOn] = useState(true)
  const prefersReduced = useReducedMotion()

  return (
    <section
      id="skills"
      className="relative overflow-hidden py-24"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      {/* Background rack texture - subtle screw hole pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-slate) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <m.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2 rounded-full border border-[var(--color-border-default)] px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-ochre)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ochre)] shadow-[0_0_6px_var(--color-ochre)]" />
            <span>THE RACK</span>
          </m.div>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              color: 'var(--color-highlight)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Outboard Gear
          </h2>
          <p
            className="mt-3 max-w-md text-sm"
            style={{
              color: 'var(--color-slate)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Each unit represents a skill &mdash; proficiency drives the signal level
          </p>
        </div>

        {/* The Rack Enclosure */}
        <div
          className="relative mx-auto max-w-5xl rounded-2xl border p-3 shadow-2xl md:p-5"
          style={{
            borderColor: 'var(--color-border-default)',
            backgroundColor: 'var(--color-charcoal)',
          }}
        >
          {/* Rack Rails (left and right) */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-0 w-3 rounded-l-2xl md:w-5"
            style={{
              background:
                'linear-gradient(to right, var(--color-surface), transparent)',
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 bottom-0 w-3 rounded-r-2xl md:w-5"
            style={{
              background:
                'linear-gradient(to left, var(--color-surface), transparent)',
            }}
          />

          {/* Inner Panel */}
          <div
            className="relative rounded-xl border p-4 md:p-8"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            {/* Corner Screws */}
            <Screw className="absolute top-3 left-3" />
            <Screw className="absolute top-3 right-3" />
            <Screw className="absolute bottom-3 left-3" />
            <Screw className="absolute right-3 bottom-3" />

            {/* Top Panel: Branding & Power */}
            <div
              className="mb-8 flex items-center justify-between border-b pb-5"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="hidden h-10 w-10 items-center justify-center rounded border sm:flex"
                  style={{
                    borderColor: 'var(--color-ochre)',
                    backgroundColor: 'var(--color-charcoal)',
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-ochre)' }}
                  >
                    ⚡
                  </span>
                </div>
                <div>
                  <h3
                    className="text-lg font-bold tracking-widest uppercase"
                    style={{
                      color: 'var(--color-highlight)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    RACK-MASTER{' '}
                    <span style={{ color: 'var(--color-ochre)' }}>2026</span>
                  </h3>
                  <p
                    className="text-[10px] uppercase"
                    style={{
                      color: 'var(--color-slate)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Professional Outboard Signal Processor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Master VU */}
                <div className="hidden h-24 md:flex">
                  <VUMeter level={isOn ? 85 : 0} isOn={isOn} />
                </div>

                {/* Power */}
                <div className="flex flex-col items-center gap-1">
                  <PowerSwitch isOn={isOn} onToggle={() => setIsOn(!isOn)} />
                  <span
                    className="text-[8px] font-bold tracking-wider"
                    style={{
                      color: 'var(--color-slate)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    PWR
                  </span>
                </div>
              </div>
            </div>

            {/* Rack Units - grouped by category */}
            <div className="flex flex-col gap-4">
              {MIXER_DATA.map((group, i) => (
                <React.Fragment key={group.id}>
                  {i > 0 && (
                    <div
                      className="mx-auto h-px w-3/4"
                      style={{
                        backgroundColor: 'var(--color-ochre)',
                        opacity: 0.3,
                      }}
                    />
                  )}
                  <RackSection group={group} index={i} isOn={isOn} />
                </React.Fragment>
              ))}
            </div>

            {/* Bottom Label */}
            <div
              className="mt-8 border-t pt-4 text-center"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <p
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{
                  color: 'var(--color-slate)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Designed &amp; Engineered by One &mdash; Serial No. AH-2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
