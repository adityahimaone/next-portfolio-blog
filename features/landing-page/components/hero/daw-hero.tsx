'use client'

import { useEffect, useRef, useState } from 'react'
import {
  m as motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { Screw } from '@/components/screw'
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

export function DawHero() {
  const [baseDelay, setBaseDelay] = useState(0.15)
  const [activeDevice, setActiveDevice] = useState<string | null>(null)
  const [bootIndex, setBootIndex] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
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
    const hasSeenPreloader = Boolean(sessionStorage.getItem('preloaderShown'))
    if (hasSeenPreloader) setBaseDelay(0)
    if (shouldReduceMotion) return

    const startTimer = window.setTimeout(
      () => {
        if (!hasManualInteraction.current) setBootIndex(0)
      },
      hasSeenPreloader ? 280 : 1380,
    )

    return () => window.clearTimeout(startTimer)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (bootIndex === null || shouldReduceMotion) return

    const stepTimer = window.setTimeout(() => {
      setBootIndex((current) => {
        if (current === null || current >= devices.length - 1) return null
        return current + 1
      })
    }, 230)

    return () => window.clearTimeout(stepTimer)
  }, [bootIndex, shouldReduceMotion])

  const poweredDevice =
    bootIndex === null ? activeDevice : devices[bootIndex]?.id

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-160 w-full overflow-hidden bg-[#16191b] select-none"
    >
      <motion.div
        style={{ y: wallY, opacity }}
        className="absolute inset-0 grid grid-cols-8 grid-rows-12 sm:grid-cols-12 sm:grid-rows-8"
      >
        {devices.map((device, index) => (
          <DeviceTile
            key={device.id}
            active={poweredDevice === device.id}
            baseDelay={baseDelay}
            device={device}
            index={index}
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

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,10,11,0.12)_48%,rgba(8,10,11,0.62)_100%)]" />

      <motion.div
        style={{ y: titleY, opacity }}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
      >
        <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.48em] text-[#e0b75a] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-[11px]">
          DIGITAL / ANALOG / INTERFACE
        </p>
        <h1 className="font-[family-name:var(--font-syne)] text-[clamp(3.3rem,11vw,10.5rem)] leading-[0.74] font-black tracking-[-0.09em] text-[#f1eee5] [text-shadow:0_3px_0_#121313,0_0_28px_rgba(0,0,0,0.85)]">
          ADITYA
          <span className="block pl-[0.1em] text-[#e0b75a]">HIMAONE</span>
        </h1>
        <p className="mt-6 bg-[#101212]/70 px-3 py-1.5 font-mono text-[8px] font-bold tracking-[0.25em] text-white/80 backdrop-blur-sm sm:text-[10px]">
          CREATIVE DEVELOPER · JAKARTA, ID
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
    </section>
  )
}

function DeviceTile({
  device,
  index,
  baseDelay,
  active,
  reduceMotion,
  onToggle,
}: {
  device: Device
  index: number
  baseDelay: number
  active: boolean
  reduceMotion: boolean | null
  onToggle: () => void
}) {
  return (
    <motion.button
      type="button"
      aria-label={`${device.label}: ${active ? 'active' : 'inactive'}. Activate module.`}
      aria-pressed={active}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.965 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.42,
        delay: baseDelay + index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      onClick={onToggle}
      className={cn(
        'group relative min-h-0 overflow-hidden border border-black/70 text-left shadow-[inset_0_1px_rgba(255,255,255,0.12)] transition-[filter,box-shadow] duration-150 ease-out outline-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[#e0b75a] focus-visible:ring-inset',
        active &&
          'z-10 shadow-[inset_0_0_0_1px_rgba(224,183,90,0.65),inset_0_1px_rgba(255,255,255,0.18)] brightness-110',
        device.className,
      )}
    >
      <Hardware active={active && !reduceMotion} type={device.type} />
      <span className="pointer-events-none absolute top-2 left-2 z-10 font-mono text-[6px] font-bold tracking-[0.18em] text-white/55 sm:text-[7px]">
        {device.label}
      </span>
      <span
        className={cn(
          'pointer-events-none absolute right-2 bottom-2 z-10 h-1.5 w-1.5 rounded-full bg-[#535957] transition-[background-color,box-shadow] duration-150',
          active && 'bg-[#d6ad45] shadow-[0_0_8px_#e0b75a]',
        )}
      />
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
    <div className="h-full bg-[#939996] p-[12%] sm:p-[15%]">
      <div className="relative h-full rounded-[14%] border-[3px] border-[#c3c9c5] bg-[#25292a] p-[8%] shadow-[7px_9px_16px_rgba(0,0,0,0.5),inset_1px_1px_rgba(255,255,255,0.22)]">
        <div className="h-[35%] rounded-sm border border-[#070909] bg-[#101718] p-[8%] shadow-inner">
          <div className="h-full w-full bg-[linear-gradient(135deg,#152c2d,#0c1214)]">
            <div
              className={cn(
                'mt-[18%] ml-[10%] h-0.5 w-[70%] bg-[#7abb5e] transition-all duration-200',
                active && 'w-[82%] shadow-[0_0_6px_#7abb5e]',
              )}
            />
            <div
              className={cn(
                'mt-[12%] ml-[10%] h-0.5 w-[45%] bg-[#7abb5e]/60 transition-all duration-200',
                active && 'w-[68%]',
              )}
            />
          </div>
        </div>
        <div
          className={cn(
            'absolute bottom-[10%] left-1/2 grid aspect-square w-[55%] -translate-x-1/2 place-items-center rounded-full border border-white/15 bg-[#141718] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.7)] transition-transform duration-200',
            active && 'rotate-45',
          )}
        >
          <div className="h-[48%] w-[48%] rounded-full border border-white/10" />
        </div>
      </div>
    </div>
  )
}
function Keys({ active }: { active: boolean }) {
  return (
    <div className="flex h-full flex-col justify-end bg-[#d8d5cb] pt-8">
      <div className="relative flex h-[65%] border-t-4 border-[#272a2a]">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'relative flex-1 border-r border-[#878780] bg-[#e9e6da] shadow-[inset_0_-7px_10px_rgba(0,0,0,0.12)]',
              active && i % 4 === 1 && 'translate-y-1 bg-[#d6c78f]',
            )}
          >
            {![2, 6, 9, 13].includes(i) && (
              <span className="absolute top-0 right-[-20%] z-10 h-[56%] w-[40%] rounded-b-sm bg-[#17191a] shadow-md" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
function JogWheel({ active }: { active: boolean }) {
  return (
    <div className="grid h-full place-items-center bg-[#313536] p-4">
      <div
        className={cn(
          'grid aspect-square w-[78%] place-items-center rounded-full border-[9px] border-[#737876] bg-[repeating-radial-gradient(circle,#1b1e1f_0_2px,#25292a_3px_5px)] shadow-[0_0_0_2px_#151718,inset_0_0_18px_black] transition-transform duration-300 ease-out',
          active && 'rotate-[42deg]',
        )}
      >
        <div className="h-[23%] w-[23%] rounded-full border border-white/20 bg-[#454c4a]" />
      </div>
      <div className="absolute bottom-[13%] flex gap-2">
        <i
          className={cn(
            'h-3 w-3 rounded-sm bg-[#633c3c] transition-colors',
            active && 'bg-[#d25555]',
          )}
        />
        <i
          className={cn(
            'h-3 w-3 rounded-sm bg-[#6b5730] transition-colors',
            active && 'bg-[#e0b75a]',
          )}
        />
      </div>
    </div>
  )
}
function Mixer({ active }: { active: boolean }) {
  return (
    <div className="flex h-full justify-around bg-[#777d79] px-2 pt-8">
      {[0, 1, 2].map((channel) => (
        <div
          key={channel}
          className="relative h-full w-[22%] border-x border-black/25 bg-[#646a67]"
        >
          <div
            className={cn(
              'mx-auto mt-3 h-7 w-7 rounded-full border-2 border-[#2c302f] bg-[#a4aaa4] transition-transform duration-200',
              active && 'rotate-45',
            )}
          />
          <div className="mx-auto mt-4 h-[47%] w-1 bg-[#282d2b]">
            <div
              className={cn(
                'absolute -left-2 h-4 w-5 rounded-sm bg-[#d2d4cd] transition-[bottom] duration-200',
                active ? 'bottom-[56%]' : 'bottom-[24%]',
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
    <div className="grid h-full grid-cols-2 gap-2 bg-[#d7a84e] p-[17%] pt-[27%]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'border border-black/30 shadow-[inset_2px_2px_rgba(255,255,255,0.22),2px_2px_rgba(0,0,0,0.25)] transition-transform duration-150',
            active && i % 3 === 1 ? 'scale-90 bg-[#d55c53]' : 'bg-[#c88e3d]',
          )}
        />
      ))}
    </div>
  )
}
function Synth({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[#51665f] p-[13%] pt-[27%]">
      <div className="grid grid-cols-3 gap-[12%]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-full border-2 border-[#25332e] bg-[#b8bd9f] shadow-[inset_2px_2px_3px_rgba(0,0,0,0.35)] transition-transform duration-200',
              active && i % 2 === 0 && 'rotate-45',
            )}
          />
        ))}
      </div>
      <div
        className={cn(
          'mt-[17%] h-[13%] bg-[#1c2926] transition-colors',
          active && 'bg-[#b6d06b]',
        )}
      />
    </div>
  )
}
function Monitor({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#c7c7bf]">
      <div className="grid aspect-square h-[86%] place-items-center rounded-full border-[9px] border-[#333837] bg-[#171a1a] shadow-[inset_0_0_18px_#000]">
        <div
          className={cn(
            'h-[42%] w-[42%] rounded-full border-[5px] border-[#777c78] bg-[#242827] transition-transform duration-200',
            active && 'scale-125',
          )}
        />
      </div>
    </div>
  )
}
function Effects({ active }: { active: boolean }) {
  return (
    <div className="h-full bg-[#745e78] p-[15%] pt-[27%]">
      <div className="h-[28%] border-2 border-[#2c2630] bg-[#1b2221]">
        <div
          className={cn(
            'm-[12%] h-0.5 bg-[#8f6ab3] transition-all duration-200',
            active && 'w-[76%] bg-[#d2a5ff] shadow-[0_0_5px_#b58be0]',
          )}
        />
      </div>
      <div className="mt-[16%] flex justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square w-[22%] rounded-full border-2 border-[#332a35] bg-[#c2a2c4] transition-transform duration-200',
              active && 'rotate-45',
            )}
          />
        ))}
      </div>
    </div>
  )
}
function Sequencer({ active }: { active: boolean }) {
  return (
    <div className="grid h-full grid-cols-8 items-center gap-[4%] bg-[#2d3332] px-[8%] pt-[6%]">
      {Array.from({ length: 16 }).map((_, i) => (
        <i
          key={i}
          className={cn(
            'aspect-square rounded-sm border border-black/35 bg-[#59605d] shadow-[inset_0_1px_rgba(255,255,255,0.16)] transition-colors duration-150',
            active && i % 3 === 0 && 'bg-[#7abb5e] shadow-[0_0_8px_#7abb5e]',
          )}
        />
      ))}
    </div>
  )
}
function Tape({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-center justify-around bg-[#a69e89] px-[16%] pt-[18%]">
      <div
        className={cn(
          'aspect-square w-[34%] rounded-full border-[5px] border-[#3d403c] bg-[radial-gradient(circle,#292c29_0_13%,#b8a473_14%_23%,#474b45_24%_100%)] transition-transform duration-300',
          active && 'rotate-180',
        )}
      />
      <div
        className={cn(
          'aspect-square w-[34%] rounded-full border-[5px] border-[#3d403c] bg-[radial-gradient(circle,#292c29_0_13%,#b8a473_14%_23%,#474b45_24%_100%)] transition-transform duration-300',
          active && '-rotate-180',
        )}
      />
    </div>
  )
}
function Meter({ active }: { active: boolean }) {
  return (
    <div className="flex h-full items-end justify-center gap-[12%] bg-[#1c2422] px-[18%] pt-[30%] pb-[14%]">
      {[35, 58, 76].map((height, i) => (
        <i
          key={i}
          style={{ height: `${active ? Math.min(height + 18, 94) : height}%` }}
          className="w-[16%] bg-[#5f8f61] transition-[height,background-color] duration-200"
        />
      ))}
    </div>
  )
}
function Cassette({ active }: { active: boolean }) {
  return (
    <div className="grid h-full place-items-center bg-[#baa46c] p-[13%] pt-[26%]">
      <div className="relative h-[62%] w-full rounded-sm border-4 border-[#443c2b] bg-[#d8c48c]">
        <div className="absolute inset-x-[16%] top-[20%] h-[36%] bg-[#353831]">
          <div className="flex h-full items-center justify-around">
            {[0, 1].map((i) => (
              <i
                key={i}
                className={cn(
                  'aspect-square w-[27%] rounded-full bg-[#c7ae72] transition-transform duration-300',
                  active && 'rotate-180',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
