'use client'

import { useEffect, useRef, useState } from 'react'
import {
  m as motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { Screw } from '@/components/screw'
import { BrokenLightText } from '@/components/broken-light-text'
import {
  BOOT_ORDER_FALLBACK,
  heroSweepIndices,
} from '@/features/landing-page/lib/hero-sweep-order'
import { cn } from '@/lib/utils'

const devices = [
  {
    id: 'dap',
    type: 'dap',
    label: 'PORTABLE PLAYER',
    className:
      'col-start-1 col-end-4 row-start-1 row-end-5 sm:col-start-1 sm:col-end-4 sm:row-start-1 sm:row-end-6',
  },
  {
    id: 'keys',
    type: 'keys',
    label: 'KEYSTATION 49',
    route: 'WORK',
    className:
      'col-start-4 col-end-9 row-start-1 row-end-3 sm:col-start-4 sm:col-end-9 sm:row-start-1 sm:row-end-3',
  },
  {
    id: 'mixer',
    type: 'mixer',
    label: 'MIX BUS',
    className:
      'col-start-4 col-end-6 row-start-3 row-end-6 sm:col-start-9 sm:col-end-11 sm:row-start-1 sm:row-end-5',
  },
  {
    id: 'fx',
    type: 'fx',
    label: 'TAPE ECHO',
    className:
      'col-start-6 col-end-9 row-start-3 row-end-5 sm:col-start-11 sm:col-end-13 sm:row-start-1 sm:row-end-3',
  },
  {
    id: 'jog',
    type: 'jog',
    label: 'DECK A',
    route: 'EXPERIENCE',
    className:
      'col-start-1 col-end-4 row-start-5 row-end-9 sm:col-start-4 sm:col-end-7 sm:row-start-3 sm:row-end-7',
  },
  {
    id: 'sampler',
    type: 'sampler',
    label: 'SAMPLE BANK',
    className:
      'col-start-4 col-end-6 row-start-6 row-end-9 sm:col-start-7 sm:col-end-9 sm:row-start-3 sm:row-end-6',
  },
  {
    id: 'synth',
    type: 'synth',
    label: 'POLY SYNTH',
    className:
      'col-start-6 col-end-9 row-start-5 row-end-7 sm:col-start-11 sm:col-end-13 sm:row-start-3 sm:row-end-6',
  },
  {
    id: 'monitor',
    type: 'monitor',
    label: 'FIELD MONITOR',
    className:
      'col-start-6 col-end-9 row-start-7 row-end-10 sm:col-start-1 sm:col-end-4 sm:row-start-6 sm:row-end-9',
  },
  {
    id: 'sequencer',
    type: 'sequencer',
    label: 'STEP SEQUENCER',
    route: 'TOOLKIT',
    className:
      'col-start-1 col-end-6 row-start-9 row-end-11 sm:col-start-4 sm:col-end-9 sm:row-start-7 sm:row-end-9',
  },
  {
    id: 'tape',
    type: 'tape',
    label: 'TAPE MODULE',
    className:
      'col-start-1 col-end-4 row-start-11 row-end-13 sm:col-start-9 sm:col-end-11 sm:row-start-5 sm:row-end-9',
  },
  {
    id: 'meter',
    type: 'meter',
    label: 'LEVEL METER',
    className:
      'col-start-4 col-end-6 row-start-11 row-end-13 sm:col-start-7 sm:col-end-9 sm:row-start-6 sm:row-end-7',
  },
  {
    id: 'cassette',
    type: 'cassette',
    label: 'ARCHIVE 01',
    className:
      'col-start-6 col-end-9 row-start-10 row-end-13 sm:col-start-11 sm:col-end-13 sm:row-start-6 sm:row-end-9',
  },
] as const

type Device = (typeof devices)[number]
type DeviceType = Device['type']

const collapseVectors = [
  [-118, -72, -8],
  [-24, -116, 5],
  [96, -84, 7],
  [126, -28, -6],
  [-112, -12, 4],
  [102, 12, -5],
  [118, 68, 7],
  [-92, 82, -6],
  [-18, 116, 4],
  [-124, 46, 7],
  [42, 122, -5],
  [124, 92, 6],
] as const

export function DawHero({
  backgroundOnly = false,
}: { backgroundOnly?: boolean } = {}) {
  const [baseDelay, setBaseDelay] = useState(0)
  const [activeDevice, setActiveDevice] = useState<string | null>(null)
  const [bootIndex, setBootIndex] = useState<number | null>(0)
  const [bootOrder, setBootOrder] = useState<readonly number[]>(BOOT_ORDER_FALLBACK)
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const hasManualInteraction = useRef(false)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const wallY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 60],
  )
  const titleY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : -28],
  )
  const opacity = useTransform(scrollYProgress, [0, 0.72], [1, 0])

  useEffect(() => {
    setBaseDelay(0)
  }, [])

  // The rack is hand-authored rather than row-major, so array order is a
  // zig-zag. Measuring the real layout is what makes the sweep read as
  // left-to-right, and it stays correct across the 8- and 12-column layouts.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const frame = requestAnimationFrame(() => {
      setBootOrder(
        heroSweepIndices(
          Array.from(grid.querySelectorAll<HTMLElement>('[data-hero-device]')),
        ),
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (bootIndex === null || shouldReduceMotion) return

    const stepTimer = window.setTimeout(() => {
      setBootIndex((current) => {
        if (current === null || current >= bootOrder.length - 1) return null
        return current + 1
      })
    }, 230)

    return () => window.clearTimeout(stepTimer)
  }, [bootIndex, bootOrder.length, shouldReduceMotion])

  const poweredDevice =
    bootIndex === null ? activeDevice : devices[bootOrder[bootIndex] ?? -1]?.id

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-screen min-h-160 w-full overflow-hidden bg-[#16191b] select-none',
        backgroundOnly && 'absolute inset-0 h-full min-h-0 bg-transparent',
      )}
    >
      <motion.div
        ref={gridRef}
        style={backgroundOnly ? { y: wallY } : { y: wallY, opacity }}
        className="absolute inset-0 grid grid-cols-8 grid-rows-12 sm:grid-cols-12 sm:grid-rows-8"
      >
        {devices.map((device, index) => (
          <DeviceTile
            key={device.id}
            active={poweredDevice === device.id}
            baseDelay={baseDelay}
            device={device}
            index={index}
            immediatelyVisible={backgroundOnly}
            reduceMotion={shouldReduceMotion}
            onToggle={() => {
              hasManualInteraction.current = true
              setBootIndex(null)
              setActiveDevice((current) =>
                current === device.id ? null : device.id,
              )
            }}
          />
        ))}
      </motion.div>

      {!backgroundOnly && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,10,11,0.12)_48%,rgba(8,10,11,0.62)_100%)]" />
      )}

      {!backgroundOnly && (
        <>
          <motion.div
            style={{ y: titleY, opacity }}
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
          >
            <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.48em] text-[#e0b75a] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-[11px]">
              DIGITAL / ANALOG / INTERFACE
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-[clamp(3.3rem,11vw,10.5rem)] leading-[0.74] font-black tracking-[-0.09em] text-[#f1eee5] [text-shadow:0_3px_0_#121313,0_0_28px_rgba(0,0,0,0.85)]">
              <BrokenLightText
                text="ADITYA"
                mode="settle"
                glowColor="#ff5a1f"
              />
              <span className="block pl-[0.1em] text-[#e0b75a]">
                <BrokenLightText
                  text="HIMAWAN"
                  mode="settle"
                  glowColor="#e0b75a"
                />
              </span>
            </h1>
            <p className="mt-6 bg-[#101212]/70 px-3 py-1.5 font-mono text-[8px] font-bold tracking-[0.25em] text-white/80 backdrop-blur-sm sm:text-[10px]">
              FRONTEND DEVELOPER · JAKARTA, ID
            </p>
          </motion.div>

          <div className="pointer-events-none absolute bottom-4 left-4 z-30 font-mono text-[8px] tracking-[0.22em] text-white/45">
            TAP A MODULE · SYSTEM 001
          </div>
          <div className="pointer-events-none absolute right-4 bottom-4 z-30 font-mono text-[8px] tracking-[0.22em] text-white/45">
            SCROLL TO EXPLORE ↓
          </div>
          <Screw className="absolute top-20 left-4 z-30 opacity-75" />
          <Screw className="absolute top-20 right-4 z-30 opacity-75" />
          <Screw className="absolute bottom-12 left-4 z-30 opacity-75" />
          <Screw className="absolute right-4 bottom-12 z-30 opacity-75" />
        </>
      )}
    </div>
  )
}

function DeviceTile({
  device,
  index,
  baseDelay,
  active,
  immediatelyVisible,
  reduceMotion,
  onToggle,
}: {
  device: Device
  index: number
  baseDelay: number
  active: boolean
  immediatelyVisible: boolean
  reduceMotion: boolean | null
  onToggle: () => void
}) {
  const [collapseX, collapseY, collapseRotation] = collapseVectors[index]
  const route = 'route' in device ? device.route : undefined

  return (
    <motion.button
      type="button"
      aria-label={`${device.label}: ${active ? 'active' : 'inactive'}. Activate module.`}
      aria-pressed={active}
      data-hero-device
      data-collapse-x={collapseX}
      data-collapse-y={collapseY}
      data-collapse-rotation={collapseRotation}
      data-rack-anchor={route ? 'true' : undefined}
      initial={
        immediatelyVisible || reduceMotion
          ? false
          : { opacity: 0, scale: 0.965 }
      }
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0,
        delay: 0,
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      onClick={onToggle}
      className={cn(
        'group relative min-h-0 overflow-hidden border bg-[var(--dev-face)] text-left shadow-[var(--dev-tile-shadow)] transition-[filter,box-shadow] duration-150 ease-out outline-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[var(--dev-accent)] focus-visible:ring-inset',
        'border-[var(--dev-tile-edge)]',
        active && 'z-10 shadow-[var(--dev-tile-shadow-active)] brightness-105',
        device.className,
      )}
    >
      <Hardware active={active && !reduceMotion} type={device.type} />
      <span className="pointer-events-none absolute top-2 left-2 z-10 font-mono text-[6px] font-bold tracking-[0.18em] text-[var(--dev-ink)] sm:text-[7px]">
        {device.label}
      </span>
      <span
        className={cn(
          'pointer-events-none absolute right-2 bottom-2 z-10 h-1.5 w-1.5 rounded-full border border-black/20 bg-[var(--dev-ink-dim)] transition-[background-color,box-shadow] duration-150',
          active &&
            'bg-[var(--dev-accent)] shadow-[0_0_6px_var(--dev-accent)]',
        )}
      />
      {route && (
        <span
          data-hero-route
          className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex translate-y-1 items-center justify-between border-t pt-1.5 font-mono text-[6px] font-bold tracking-[0.2em] text-[var(--dev-ink-strong)] opacity-0 sm:text-[7px]"
          style={{ borderColor: 'var(--dev-route-hair)' }}
        >
          {route}
          <i className="h-1.5 w-1.5 rounded-full bg-[var(--dev-accent)]" />
        </span>
      )}
    </motion.button>
  )
}

function Hardware({ type, active }: { type: DeviceType; active: boolean }) {
  switch (type) {
    case 'dap':
      return <Dap active={active} />
    case 'keys':
      return <Keys active={active} />
    case 'jog':
      return <JogWheel active={active} />
    case 'mixer':
      return <Mixer active={active} />
    case 'sampler':
      return <Sampler active={active} />
    case 'synth':
      return <Synth active={active} />
    case 'monitor':
      return <Monitor active={active} />
    case 'sequencer':
      return <Sequencer active={active} />
    case 'tape':
      return <Tape active={active} />
    case 'meter':
      return <Meter active={active} />
    case 'cassette':
      return <Cassette active={active} />
    default:
      return <Effects active={active} />
  }
}

function Dap({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[var(--dev-face-hi)] p-[12%] pt-[18%] sm:p-[15%] sm:pt-[20%]">
      <div className="relative h-full rounded-[7px] border border-[var(--dev-edge)] bg-[var(--dev-face-top)] p-[8%] shadow-[0_2px_5px_rgba(28,31,32,0.24),inset_0_1px_rgba(255,255,255,0.8)]">
        <div className="relative h-[34%] overflow-hidden rounded-[2px] border border-black/70 bg-[var(--dev-screen)] p-[8%] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] after:absolute after:inset-x-0 after:top-0 after:h-1/2 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]">
          <div
            className={cn(
              'mt-[15%] ml-[8%] h-0.5 w-[58%] bg-[var(--dev-amber)] transition-[width,box-shadow] duration-200',
              active &&
                'w-[82%] shadow-[0_0_5px_var(--dev-amber)]',
            )}
          />
          <div
            className={cn(
              'mt-[12%] ml-[8%] h-0.5 w-[40%] bg-[var(--dev-teal)] transition-[width] duration-200',
              active && 'w-[66%]',
            )}
          />
        </div>
        <div
          className={cn(
            'absolute bottom-[10%] left-1/2 grid aspect-square w-[52%] -translate-x-1/2 place-items-center rounded-full border border-[var(--dev-edge-dim)] bg-[var(--dev-slot)] shadow-[inset_0_1px_rgba(255,255,255,0.65),0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200',
            active && 'rotate-45',
          )}
        >
          <div className="h-[46%] w-[46%] rounded-full border border-[var(--dev-edge-deep)] bg-[var(--dev-navy-deep)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
    </div>
  )
}
function Keys({ active }: { active: boolean }) {
  return (
    <div className="flex h-full flex-col justify-end bg-[var(--dev-face-hi)] px-[4%] pt-8 pb-[5%]">
      <div className="mb-[4%] flex h-[11%] items-center gap-[3%] rounded-[2px] border border-black/60 bg-[var(--dev-screen)] px-[3%] shadow-[inset_0_1px_2px_rgba(0,0,0,0.75)]">
        <i className="h-1 w-[18%] bg-[#d4a667]" />
        <i className="h-1 w-[9%] bg-[var(--dev-teal)]" />
      </div>
      <div className="relative flex h-[57%] overflow-hidden rounded-[2px] border border-[var(--dev-edge-dim)] bg-[var(--dev-face-lo)] p-px shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'relative flex-1 origin-top border-r border-[var(--dev-edge-soft)] bg-[var(--dev-face-top)] shadow-[inset_0_-3px_3px_rgba(0,0,0,0.08)] transition-[transform,background-color] duration-100',
              active && i % 4 === 1 && 'scale-y-[0.96] bg-[#d7c7a7]',
            )}
          >
            {![2, 6, 9, 13].includes(i) && (
              <span className="absolute top-0 right-[-20%] z-10 h-[55%] w-[40%] rounded-b-[2px] bg-[var(--dev-navy-deep)] shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
function JogWheel({ active }: { active: boolean }) {
  return (
    <div className="grid h-full place-items-center bg-[var(--dev-face-hi)] p-4 pt-8">
      <div className="absolute inset-[9%] top-[16%] rounded-[6px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] shadow-[inset_0_1px_rgba(255,255,255,0.62)]" />
      <div
        className={cn(
          'z-10 grid aspect-square w-[72%] place-items-center rounded-full border-[3px] border-[var(--dev-edge-dim)] bg-[repeating-radial-gradient(circle,var(--dev-jog)_0_2px,var(--dev-face-mid)_3px_5px)] shadow-[0_0_0_1px_var(--dev-edge-dim),0_2px_4px_rgba(0,0,0,0.3),inset_0_0_8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out',
          active && 'rotate-[42deg]',
        )}
      >
        <div className="h-[24%] w-[24%] rounded-full border border-[var(--dev-edge-dim)] bg-[var(--dev-slot)] shadow-[inset_0_1px_rgba(255,255,255,0.7)]" />
      </div>
      <div className="absolute bottom-[11%] z-10 flex gap-2">
        <i
          className={cn(
            'h-2.5 w-4 rounded-[2px] border border-black/20 bg-[#a79b84] shadow-[0_1px_1px_rgba(0,0,0,0.2)] transition-[background-color,transform] duration-100',
            active && 'scale-[0.96] bg-[var(--dev-accent)]',
          )}
        />
        <i className="h-2.5 w-4 rounded-[2px] border border-black/20 bg-[#394856] shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
      </div>
    </div>
  )
}
function Mixer({ active }: { active: boolean }) {
  return (
    <div className="flex h-full justify-around bg-[var(--dev-face-hi)] px-[9%] pt-[23%] pb-[8%]">
      {[0, 1, 2].map((channel) => (
        <div
          key={channel}
          className="relative h-full w-[25%] rounded-[2px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] shadow-[inset_0_1px_rgba(255,255,255,0.6)]"
        >
          <div
            className={cn(
              'mx-auto mt-[18%] aspect-square w-[65%] rounded-full border border-[#6d7476] bg-[var(--dev-navy)] shadow-[inset_0_1px_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-200',
              active && 'rotate-45',
            )}
          >
            <i className="mx-auto block h-[32%] w-px bg-[#e3c083]" />
          </div>
          <div className="mx-auto mt-[28%] h-[47%] w-[3px] rounded-full bg-[#4c5353] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]">
            <div
              className={cn(
                'absolute left-1/2 h-3 w-[78%] -translate-x-1/2 rounded-[2px] border border-[#777d7d] bg-[var(--dev-face-top)] shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-[bottom] duration-200',
                active ? 'bottom-[49%]' : 'bottom-[15%]',
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
function Sampler({ active }: { active: boolean }) {
  return (
    <div className="grid h-full grid-cols-2 gap-[7%] bg-[var(--dev-face-hi)] p-[16%] pt-[28%]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-[3px] border border-[var(--dev-edge-dim)] bg-[#9b9d96] shadow-[inset_0_1px_rgba(255,255,255,0.35),0_2px_2px_rgba(0,0,0,0.2)] transition-[transform,background-color,box-shadow] duration-100',
            i === 0 && 'bg-[var(--dev-navy)]',
            i === 7 && 'bg-[var(--dev-amber-deep)]',
            active &&
              i % 3 === 1 &&
              'scale-[0.96] bg-[var(--dev-accent)] shadow-[inset_0_1px_rgba(255,255,255,0.25),0_1px_1px_rgba(0,0,0,0.2)]',
          )}
        />
      ))}
    </div>
  )
}
function Synth({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[var(--dev-face-hi)] p-[12%] pt-[27%]">
      <div className="rounded-[4px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] p-[8%] shadow-[inset_0_1px_rgba(255,255,255,0.62)]">
        <div className="grid grid-cols-3 gap-[12%]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-full border border-[#697173] bg-[var(--dev-navy)] shadow-[inset_0_1px_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.24)] transition-transform duration-200',
                i === 2 && 'bg-[#aa9978]',
                i === 7 && 'bg-[var(--dev-accent)]',
                active && i % 2 === 0 && 'rotate-45',
              )}
            >
              <i className="mx-auto block h-[32%] w-px bg-[#e6d6b7]" />
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-[8%] h-[11%] overflow-hidden rounded-[2px] border border-black/60 bg-[var(--dev-screen)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]">
        <div
          className={cn(
            'h-full w-[28%] bg-[var(--dev-teal)] transition-[width,background-color] duration-200',
            active && 'w-[76%] bg-[#d5a969]',
          )}
        />
      </div>
    </div>
  )
}
function Monitor({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--dev-face-hi)] pt-[7%]">
      <div className="grid aspect-square h-[77%] place-items-center rounded-[7px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] shadow-[inset_0_1px_rgba(255,255,255,0.65),0_2px_5px_rgba(0,0,0,0.22)]">
        <div className="grid aspect-square w-[76%] place-items-center rounded-full border-[3px] border-[#4e585d] bg-[#1e292f] shadow-[inset_0_0_9px_rgba(0,0,0,0.65)]">
          <div
            className={cn(
              'h-[43%] w-[43%] rounded-full border-2 border-[var(--dev-edge-dim)] bg-[var(--dev-slot)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] transition-transform duration-200',
              active && 'scale-[1.12]',
            )}
          />
        </div>
      </div>
    </div>
  )
}
function Effects({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[var(--dev-face-hi)] p-[13%] pt-[28%]">
      <div className="relative h-[27%] overflow-hidden rounded-[2px] border border-black/65 bg-[var(--dev-screen)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.75)] after:absolute after:inset-x-0 after:top-0 after:h-1/2 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]">
        <div
          className={cn(
            'm-[10%] h-0.5 w-[38%] bg-[var(--dev-teal)] transition-[width,background-color,box-shadow] duration-200',
            active &&
              'w-[76%] bg-[#d9aa69] shadow-[0_0_5px_rgba(217,170,105,0.65)]',
          )}
        />
      </div>
      <div className="mt-[14%] flex justify-between rounded-[4px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] p-[9%] shadow-[inset_0_1px_rgba(255,255,255,0.6)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square w-[23%] rounded-full border border-[#6c7374] bg-[var(--dev-navy)] shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition-transform duration-200',
              i === 1 && 'bg-[#b1a07d]',
              active && 'rotate-45',
            )}
          >
            <i className="mx-auto block h-[34%] w-px bg-[#e6d5b6]" />
          </div>
        ))}
      </div>
    </div>
  )
}
function Sequencer({ active }: { active: boolean }) {
  return (
    <div className="grid h-full grid-cols-8 items-center gap-[4%] bg-[var(--dev-face-hi)] px-[7%] pt-[8%]">
      {Array.from({ length: 16 }).map((_, i) => (
        <i
          key={i}
          className={cn(
            'aspect-square rounded-[2px] border border-[#7f8481] bg-[#a6a79f] shadow-[inset_0_1px_rgba(255,255,255,0.34),0_1px_1px_rgba(0,0,0,0.18)] transition-[transform,background-color,box-shadow] duration-100',
            i === 4 && 'bg-[var(--dev-navy)]',
            i === 15 && 'bg-[var(--dev-amber-deep)]',
            active &&
              i % 3 === 0 &&
              'scale-[0.96] bg-[var(--dev-accent)] shadow-[0_0_5px_var(--dev-accent)]',
          )}
        />
      ))}
    </div>
  )
}
function Tape({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center justify-around bg-[var(--dev-face-hi)] px-[14%] pt-[18%]">
      <div className="absolute inset-[10%] top-[22%] rounded-[5px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] shadow-[inset_0_1px_rgba(255,255,255,0.6)]" />
      <div
        className={cn(
          'z-10 aspect-square w-[32%] rounded-full border-[3px] border-[#596164] bg-[radial-gradient(circle,var(--dev-face-top)_0_13%,var(--dev-amber-deep)_14%_24%,var(--dev-navy-deep)_25%_100%)] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-300',
          active && 'rotate-180',
        )}
      />
      <div
        className={cn(
          'z-10 aspect-square w-[32%] rounded-full border-[3px] border-[#596164] bg-[radial-gradient(circle,var(--dev-face-top)_0_13%,var(--dev-amber-deep)_14%_24%,var(--dev-navy-deep)_25%_100%)] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-300',
          active && '-rotate-180',
        )}
      />
      <i className="absolute bottom-[14%] left-1/2 h-1.5 w-[28%] -translate-x-1/2 rounded-[2px] bg-[var(--dev-accent)]" />
    </div>
  )
}
function Meter({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[var(--dev-face-hi)] px-[12%] pt-[25%] pb-[10%]">
      <div className="flex h-full items-end justify-center gap-[10%] overflow-hidden rounded-[2px] border border-black/65 bg-[var(--dev-screen)] px-[12%] pt-[8%] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
        {[35, 58, 76].map((height, i) => (
          <i
            key={i}
            style={{
              height: `${active ? Math.min(height + 18, 94) : height}%`,
            }}
            className={cn(
              'w-[16%] rounded-t-[1px] bg-[var(--dev-teal)] transition-[height,background-color] duration-200',
              active && i === 2 && 'bg-[var(--dev-accent)]',
              active && i !== 2 && 'bg-[#d4a968]',
            )}
          />
        ))}
      </div>
    </div>
  )
}
function Cassette({ active }: { active: boolean }) {
  return (
    <div className="grid h-full place-items-center bg-[var(--dev-face-hi)] p-[12%] pt-[25%]">
      <div className="relative h-[64%] w-full rounded-[5px] border border-[var(--dev-edge)] bg-[var(--dev-face-mid)] shadow-[inset_0_1px_rgba(255,255,255,0.65),0_2px_4px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-x-[13%] top-[18%] h-[38%] overflow-hidden rounded-[2px] border border-black/60 bg-[#152024] shadow-[inset_0_1px_2px_rgba(0,0,0,0.72)]">
          <div className="flex h-full items-center justify-around">
            {[0, 1].map((i) => (
              <i
                key={i}
                className={cn(
                  'aspect-square w-[27%] rounded-full border-2 border-[var(--dev-amber-deep)] bg-[radial-gradient(circle,var(--dev-face-top)_0_18%,var(--dev-navy-deep)_20%_100%)] transition-transform duration-300',
                  active && 'rotate-180',
                )}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-[24%] bottom-[12%] h-[12%] rounded-[2px] bg-[var(--dev-amber-deep)]" />
        <i className="absolute right-[8%] bottom-[8%] h-2 w-2 rounded-full bg-[var(--dev-accent)]" />
      </div>
    </div>
  )
}
