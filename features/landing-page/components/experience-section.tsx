'use client'

import { useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPERIENCES } from '../constants'

const CASSETTE_THEMES = [
  { label: '#f46d0c', dark: '#c94c15', ink: '#20211e', accent: '#fff0bd' },
  { label: '#5f8f9c', dark: '#35616c', ink: '#172526', accent: '#d9f0ed' },
  { label: '#8a9b58', dark: '#596837', ink: '#222916', accent: '#ebf2c9' },
  { label: '#b66d85', dark: '#7d4058', ink: '#2b1920', accent: '#ffe3eb' },
] as const

export function ExperienceSection() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeSubIndex, setActiveSubIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const isStageInView = useInView(stageRef, { once: true, amount: 0.2 })
  const selectedJob = EXPERIENCES[selectedIndex]
  const selectedCourse = selectedJob.items?.[activeSubIndex]
  const selectedDetails = selectedCourse
    ? [selectedCourse.description]
    : (selectedJob.description ?? [])
  const previousIndex =
    (selectedIndex - 1 + EXPERIENCES.length) % EXPERIENCES.length
  const nextIndex = (selectedIndex + 1) % EXPERIENCES.length

  const selectExperience = (index: number) => {
    setSelectedIndex(index)
    setActiveSubIndex(0)
  }

  const moveCarousel = (direction: -1 | 1) => {
    selectExperience(
      (selectedIndex + direction + EXPERIENCES.length) % EXPERIENCES.length,
    )
  }

  return (
    <section
      id="experience"
      className="relative overflow-hidden py-20 lg:py-24"
    >
      {/*<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,164,71,0.13),transparent_42%),linear-gradient(180deg,rgba(244,241,230,0.24),transparent_72%)] dark:bg-[radial-gradient(ellipse_at_50%_34%,rgba(224,183,90,0.1),transparent_43%),radial-gradient(ellipse_at_4%_76%,rgba(122,187,94,0.055),transparent_28%)]" />*/}
      <div className="relative container mx-auto px-4 md:px-6">
              <div className="instrument-module mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
          <div>
            <m.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-[9px] font-bold tracking-[0.28em] text-[#8d6827] uppercase dark:text-[#e0b75a]"
            >
              Career archive / side a
            </m.p>
            <m.h2
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl"
            >
              The Work Mixtape
            </m.h2>
          </div>
          <p className="hidden max-w-48 text-right font-mono text-[8px] font-bold tracking-[0.12em] text-black/40 uppercase sm:block dark:text-white/35">
            Select a tape to hear a chapter.
          </p>
        </div>

        <m.div
          ref={stageRef}
          initial={
            shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 36, scale: 0.97 }
          }
          animate={
            isStageInView || shouldReduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 36, scale: 0.97 }
          }
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-6xl"
        >
          <div className="pointer-events-none absolute top-[34%] right-[15%] left-[15%] h-24 rounded-full bg-[#a97b29]/15 blur-3xl dark:bg-[#e0b75a]/15" />
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Work experience cassette collection"
            className="relative h-[270px] sm:h-[355px] lg:h-[390px]"
          >
            <AnimatePresence initial={false}>
              {[
                { index: previousIndex, position: 'previous' as const },
                { index: selectedIndex, position: 'active' as const },
                { index: nextIndex, position: 'next' as const },
              ].map(({ index, position }) => (
                <Cassette
                  key={EXPERIENCES[index].id}
                  experience={EXPERIENCES[index]}
                  index={index}
                  position={position}
                  selectedIndex={selectedIndex}
                  reduceMotion={shouldReduceMotion}
                  onSelect={() => selectExperience(index)}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="instrument-plate relative mx-auto mt-1 max-w-3xl p-4 pt-5 dark:border-white/10">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={`${selectedJob.id}-${activeSubIndex}`}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <div>
                  <p className="font-mono text-[8px] font-bold tracking-[0.18em] text-[#8d6827] uppercase dark:text-[#e0b75a]">
                    Track {String(selectedIndex + 1).padStart(2, '0')} /{' '}
                    {selectedJob.type} /{' '}
                    {selectedCourse?.period ?? selectedJob.period}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    {selectedCourse?.role ?? selectedJob.role}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-wider text-black/55 uppercase dark:text-white/50">
                    <MapPin className="h-3.5 w-3.5 text-[#587f49] dark:text-[#7abb5e]" />
                    {selectedJob.location}
                  </p>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-black/60 sm:text-right dark:text-white/60">
                  {selectedDetails[0]}
                </p>
              </m.div>
            </AnimatePresence>

            {selectedJob.isGroup && (
              <CourseSelector
                items={selectedJob.items ?? []}
                activeIndex={activeSubIndex}
                onChange={setActiveSubIndex}
              />
            )}
          </div>

          <div className="relative mx-auto mt-5 flex max-w-3xl items-center justify-between border-t border-black/15 pt-3 font-mono text-[7px] font-bold tracking-[0.14em] text-black/45 uppercase dark:border-white/10 dark:text-white/35">
            <span>4 tapes / unlimited loop</span>
            <div className="flex items-center gap-2">
              <CarouselButton
                label="Previous tape"
                onClick={() => moveCarousel(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </CarouselButton>
              <span className="grid h-7 min-w-10 place-items-center border border-black/15 bg-[#d8d7cd] px-2 text-[#6b582b] dark:border-white/10 dark:bg-[#2d332f] dark:text-[#e0b75a]">
                {String(selectedIndex + 1).padStart(2, '0')}
              </span>
              <CarouselButton label="Next tape" onClick={() => moveCarousel(1)}>
                <ChevronRight className="h-4 w-4" />
              </CarouselButton>
            </div>
            <span className="text-[#587f49] dark:text-[#7abb5e]">
              playback ready
            </span>
          </div>
        </m.div>
        </div>
      </div>
    </section>
  )
}

type CassettePosition = 'previous' | 'active' | 'next'

const CASSETTE_POSES: Record<
  CassettePosition,
  {
    x: string
    scale: number
    y: number
    rotate: number
    opacity: number
    zIndex: number
  }
> = {
  previous: {
    x: '-48%',
    scale: 0.62,
    y: 10,
    rotate: -8,
    opacity: 0.7,
    zIndex: 10,
  },
  active: { x: '0%', scale: 1, y: 0, rotate: 0, opacity: 1, zIndex: 20 },
  next: {
    x: '48%',
    scale: 0.62,
    y: 10,
    rotate: 8,
    opacity: 0.7,
    zIndex: 10,
  },
}

function Cassette({
  experience,
  index,
  position,
  selectedIndex,
  reduceMotion,
  onSelect,
}: {
  experience: (typeof EXPERIENCES)[number]
  index: number
  position: CassettePosition
  selectedIndex: number
  reduceMotion: boolean | null
  onSelect: () => void
}) {
  const theme = CASSETTE_THEMES[index]
  const isActive = position === 'active'
  const pose = CASSETTE_POSES[position]
  const entryPose = {
    ...pose,
    x: position === 'previous' ? '-62%' : position === 'next' ? '62%' : '0%',
    opacity: 0,
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.16 } }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      style={{ zIndex: pose.zIndex }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <m.button
        type="button"
        onClick={onSelect}
        aria-label={`${isActive ? 'Selected' : 'Select'} ${experience.company}, ${experience.role}`}
        aria-pressed={isActive}
        initial={entryPose}
        animate={pose}
        whileHover={
          isActive || reduceMotion
            ? undefined
            : { scale: 0.67, y: 3, opacity: 0.92 }
        }
        whileTap={reduceMotion ? undefined : { scale: isActive ? 0.98 : 0.59 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 260, damping: 28, mass: 0.78 }
        }
        className="pointer-events-auto w-[78%] max-w-[520px] cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e0b75a] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
      >
        <div className="relative aspect-[1.58/1] overflow-hidden rounded-[5%] border-[6px] border-[#b5b6a4] bg-[#d5d4bd] p-[4%] shadow-[0_14px_0_rgba(56,59,52,0.22),0_22px_30px_rgba(20,24,22,0.2),inset_0_1px_rgba(255,255,255,0.9)] dark:border-[#737b72] dark:bg-[#b7b6a4] dark:shadow-[0_14px_0_rgba(0,0,0,0.45),0_22px_32px_rgba(0,0,0,0.4),inset_0_1px_rgba(255,255,255,0.35)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 top-0 z-30 h-1/3 bg-linear-to-b from-white/30 to-transparent opacity-70 mix-blend-screen"
          />
          <ScrewDot className="top-[4%] left-[4%]" />
          <ScrewDot className="top-[4%] right-[4%]" />
          <ScrewDot className="bottom-[4%] left-[4%]" />
          <ScrewDot className="right-[4%] bottom-[4%]" />
          <div className="relative h-[64%] overflow-hidden rounded-[2%] border-2 border-[#eeeddd] bg-[#f4f1df] p-[3%] shadow-[inset_0_0_0_2px_rgba(107,111,98,0.3)]">
            <div className="absolute top-[11%] right-[3%] left-[3%] h-px bg-[#929386]/55" />
            <div className="absolute top-[20%] right-[3%] left-[3%] h-px bg-[#929386]/55" />
            <div className="absolute top-[29%] right-[3%] left-[3%] h-px bg-[#929386]/55" />
            <div
              className="absolute top-[5%] right-[9%] left-[9%] z-10 flex items-start justify-between gap-3"
              style={{ color: theme.ink }}
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-[clamp(0.42rem,1.05vw,0.67rem)] font-black tracking-[0.12em] uppercase">
                  {experience.company}
                </p>
                <p className="mt-[2%] truncate text-[clamp(0.52rem,1.35vw,0.85rem)] leading-none font-black tracking-tight">
                  {experience.role}
                </p>
              </div>
              <span className="shrink-0 text-right font-mono text-[clamp(0.32rem,0.75vw,0.5rem)] leading-tight font-bold tracking-wide uppercase">
                {experience.type}
                <br />
                {experience.period.split(' - ')[0]}
              </span>
            </div>
            <div
              className="absolute right-[3%] bottom-0 left-[3%] h-[47%]"
              style={{ backgroundColor: theme.label }}
            />
            <div className="absolute right-[5%] bottom-[5%] left-[5%] flex items-end justify-between">
              <div
                className="leading-[0.76] font-black"
                style={{ color: theme.ink }}
              >
                <span className="block text-[clamp(1.4rem,4vw,3rem)]">A</span>
                <span className="text-[clamp(0.6rem,1.7vw,1.05rem)]">SIDE</span>
              </div>
              <div
                className="mb-[1%] text-right font-mono text-[clamp(0.35rem,1.1vw,0.6rem)] leading-tight font-bold"
                style={{ color: theme.ink }}
              >
                <span className="block">NOISE</span>
                <span className="block">REDUCTION</span>
                <span className="mt-1 block border-t border-current pt-1">
                  ■ IN
                </span>
                <span className="block">□ OUT</span>
              </div>
            </div>
            <div className="absolute top-[38%] left-1/2 z-10 grid h-[41%] w-[52%] -translate-x-1/2 grid-cols-[1fr_0.9fr_1fr] items-center gap-[6%] rounded-full border-2 border-[#c0c1ae] bg-[#d9d9c8] px-[4%] shadow-[inset_0_2px_4px_rgba(63,66,58,0.24)]">
              <CassetteWheel
                direction={-1}
                selectedIndex={selectedIndex}
                active={isActive}
                reduceMotion={reduceMotion}
              />
              <div className="h-[52%] rounded-[8%] border border-[#3d3e38] bg-[#2c302d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]">
                <div
                  className="mx-auto h-full w-[28%]"
                  style={{
                    background: `linear-gradient(90deg, ${theme.dark}, #302b27 26%, #302b27 74%, ${theme.dark})`,
                  }}
                />
              </div>
              <CassetteWheel
                direction={1}
                selectedIndex={selectedIndex}
                active={isActive}
                reduceMotion={reduceMotion}
              />
            </div>
            <div
              className="absolute right-[4%] bottom-[4%] left-[31%] z-20 flex items-end justify-between gap-[4%]"
              style={{ color: theme.ink }}
            >
              <span className="text-[clamp(0.58rem,1.7vw,1.1rem)] font-black whitespace-nowrap italic">
                STEREO CASSETTE
              </span>
              <span className="shrink-0 pr-[2%] font-mono text-[clamp(0.3rem,0.7vw,0.46rem)] font-bold whitespace-nowrap">
                2×30
              </span>
            </div>
          </div>
          <div className="absolute right-[16%] bottom-[6%] left-[16%] h-[19%] border-x-2 border-t-2 border-[#b8b9a8] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]" />
          <div className="absolute right-[28%] bottom-[7.5%] left-[28%] flex justify-between">
            <span className="h-3 w-3 rounded-full border border-[#44463f] bg-[#77786c]" />
            <span className="h-3 w-3 rounded-full border border-[#44463f] bg-[#77786c]" />
          </div>
        </div>
        <span
          className={cn(
            'pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold tracking-[0.16em] whitespace-nowrap uppercase transition-opacity',
            isActive
              ? 'text-[#8d6827] opacity-100 dark:text-[#e0b75a]'
              : 'text-black/35 opacity-0 dark:text-white/30',
          )}
        >
          {experience.company}
        </span>
      </m.button>
    </m.div>
  )
}

function CassetteWheel({
  direction,
  selectedIndex,
  active,
  reduceMotion,
}: {
  direction: -1 | 1
  selectedIndex: number
  active: boolean
  reduceMotion: boolean | null
}) {
  return (
    <m.span
      animate={{
        rotate: reduceMotion
          ? 0
          : direction * (selectedIndex * 48 + (active ? 16 : 0)),
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="grid aspect-square w-full place-items-center rounded-full border-[3px] border-[#a8aa97] bg-[#eef0df] shadow-[inset_0_1px_rgba(255,255,255,0.9),0_1px_2px_rgba(55,58,50,0.26)]"
    >
      <span className="h-[43%] w-[43%] bg-[#a4a692] [clip-path:polygon(50%_0,66%_27%,93%_21%,78%_50%,93%_79%,66%_73%,50%_100%,34%_73%,7%_79%,22%_50%,7%_21%,34%_27%)]" />
      <span className="absolute h-[22%] w-[22%] rounded-full bg-[#f6f5e7]" />
    </m.span>
  )
}

function ScrewDot({ className }: { className: string }) {
  return (
    <span
      className={cn(
        'absolute z-20 h-[6%] min-h-2 w-[4%] min-w-2 rounded-full border border-[#6b6d64] bg-[#929386] shadow-[inset_0_1px_rgba(255,255,255,0.65)]',
        className,
      )}
    >
      <span className="absolute top-1/2 right-[15%] left-[15%] h-px -translate-y-1/2 bg-[#474942]" />
    </span>
  )
}

function CourseSelector({
  items,
  activeIndex,
  onChange,
}: {
  items: readonly { readonly company: string }[]
  activeIndex: number
  onChange: (index: number) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-dashed border-black/20 pt-3 dark:border-white/15">
      <span className="mr-1 py-1 font-mono text-[7px] font-bold tracking-[0.14em] text-black/40 uppercase dark:text-white/35">
        Bonus tracks
      </span>
      {items.map((item, index) => (
        <button
          key={item.company}
          type="button"
          onClick={() => onChange(index)}
          aria-pressed={index === activeIndex}
          className={cn(
            'border-b-2 px-2 py-1 font-mono text-[7px] font-bold tracking-wider uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6827]',
            index === activeIndex
              ? 'border-[#8d6827] text-[#705518] dark:border-[#e0b75a] dark:text-[#e0b75a]'
              : 'border-transparent text-black/40 hover:text-black/70 dark:text-white/35 dark:hover:text-white/70',
          )}
        >
          {item.company}
        </button>
      ))}
    </div>
  )
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-7 w-8 place-items-center border border-black/25 bg-[#d8d7cd] text-[#303531] shadow-[inset_0_1px_rgba(255,255,255,0.5),0_1px_0_rgba(0,0,0,0.2)] transition-[transform,background-color] hover:bg-[#c5c7bd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e0b75a] active:translate-y-px active:shadow-none dark:border-white/10 dark:bg-[#3a403e] dark:text-white/60 dark:shadow-[inset_0_1px_rgba(255,255,255,0.12),0_2px_0_rgba(0,0,0,0.38)] dark:hover:bg-[#4b514e]"
    >
      {children}
    </button>
  )
}
