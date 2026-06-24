'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import useClickOutside from '@/hooks/use-click-outside'
import { HOMEPAGE_NAV_ITEMS, SUBPAGE_NAV_ITEMS } from '../constants'
import { useScrollState } from '../hooks/use-scroll-state'
import { StaggeredMenu } from './staggered-menu/staggered-menu'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { Screw } from '@/components/screw'
import { motion, AnimatePresence } from 'motion/react'

// --- 1. Compact Rotary Knob Subcomponent ---
interface HeaderKnobProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  colorClass?: string
  displayValue: string
  onDragStart: () => void
  onDragEnd: () => void
}

function HeaderKnob({
  label,
  value,
  min,
  max,
  onChange,
  colorClass = 'bg-amber-500',
  displayValue,
  onDragStart,
  onDragEnd,
}: HeaderKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleStart = (y: number) => {
    setIsDragging(true)
    onDragStart()
    startY.current = y
    startValue.current = value
  }

  const handleMove = useCallback(
    (y: number) => {
      if (!isDragging) return
      const delta = (startY.current - y) * 1.5 // drag sensitivity
      const range = max - min
      const newValue = Math.max(min, Math.min(max, startValue.current + (delta / 100) * range))
      onChange(newValue)
    },
    [isDragging, min, max, onChange],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    onDragEnd()
  }, [onDragEnd])

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientY)
      const handleGlobalMouseUp = () => handleEnd()

      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  const percentage = ((value - min) / (max - min)) * 100
  const angle = -135 + (percentage / 100) * 270

  return (
    <div className="flex flex-col items-center select-none group cursor-pointer">
      <div
        className={cn(
          'relative flex h-7 w-7 items-center justify-center rounded-full border shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.05)] active:cursor-grabbing',
          'border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800',
          isDragging && 'border-zinc-400 dark:border-zinc-500 scale-105 transition-transform duration-100',
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          handleStart(e.clientY)
        }}
        onTouchStart={(e) => {
          handleStart(e.touches[0].clientY)
        }}
        onTouchMove={(e) => {
          e.preventDefault()
          handleMove(e.touches[0].clientY)
        }}
        onTouchEnd={handleEnd}
        title={`${label}: ${displayValue}`}
      >
        {/* Pointer Line */}
        <div
          className={cn('absolute h-2.5 w-0.5 rounded-full', colorClass)}
          style={{
            transform: `rotate(${angle}deg) translateY(-6.5px)`,
            transformOrigin: 'center center',
          }}
        />
        {/* Knob Cap cap */}
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shadow-inner" />
      </div>
      <span className="text-[6.5px] font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-1">
        {label}
      </span>
    </div>
  )
}

// --- 2. Vintage Metallic Toggle Switch Subcomponent (Theme Selector) ---
interface ToggleSwitchProps {
  isOn: boolean
  onToggle: () => void
}

function ToggleSwitch({ isOn, onToggle }: ToggleSwitchProps) {
  return (
    <div className="flex flex-col items-center select-none">
      <button
        onClick={onToggle}
        className={cn(
          'relative h-7 w-4.5 rounded-sm border shadow-inner flex items-center justify-center cursor-pointer transition-all duration-300',
          'border-zinc-350 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900',
        )}
        aria-label="Toggle Theme Mode"
      >
        {/* Toggle slot */}
        <div className="absolute h-4 w-1 bg-black/40 dark:bg-black/60 rounded" />
        {/* Toggle switch pin */}
        <motion.div
          animate={{ y: isOn ? 4 : -4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={cn(
            'h-2.5 w-2.5 rounded-full border flex items-center justify-center z-10',
            'bg-linear-to-b from-zinc-100 to-zinc-300 border-zinc-450 shadow-[0_1.5px_3px_rgba(0,0,0,0.3)]',
            'dark:from-zinc-300 dark:to-zinc-500 dark:border-zinc-600',
          )}
        >
          <div className="h-0.5 w-1.5 bg-zinc-500 dark:bg-zinc-650 rounded-full" />
        </motion.div>
      </button>
      <span className="text-[6.5px] font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-1">
        THEME
      </span>
    </div>
  )
}

// --- 3. Reactive VU Level Meter Subcomponent ---
function HeaderVUMeter({ isPlaying }: { isPlaying: boolean }) {
  const [levels, setLevels] = useState([false, false, false])

  useEffect(() => {
    if (!isPlaying) {
      setLevels([false, false, false])
      return
    }
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand < 0.25) {
        setLevels([true, false, false])
      } else if (rand < 0.65) {
        setLevels([true, true, false])
      } else {
        setLevels([true, true, true])
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="hidden sm:flex flex-col items-center select-none">
      <div className="flex items-center gap-1 h-7 border border-zinc-350 bg-zinc-200/50 px-1 rounded-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full border border-black/10 transition-all duration-75',
            levels[0]
              ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]'
              : 'bg-emerald-950/60 dark:bg-emerald-950/20',
          )}
        />
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full border border-black/10 transition-all duration-75',
            levels[1]
              ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]'
              : 'bg-emerald-950/60 dark:bg-emerald-950/20',
          )}
        />
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full border border-black/10 transition-all duration-75',
            levels[2]
              ? 'bg-amber-500 shadow-[0_0_4px_#f59e0b]'
              : 'bg-amber-950/60 dark:bg-amber-950/20',
          )}
        />
      </div>
      <span className="text-[6.5px] font-[family-name:var(--font-jetbrains-mono)] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-1">
        VU
      </span>
    </div>
  )
}

// --- 4. Main Header Component Redesign ---
export function HeaderV2() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const navItems = isHomepage ? HOMEPAGE_NAV_ITEMS : SUBPAGE_NAV_ITEMS

  const pageLinks = navItems.filter(
    (item) => !item.href.startsWith('/#') && (isHomepage ? item.href !== '/' : true),
  )
  const scrollLinks = navItems.filter((item) => !pageLinks.includes(item))

  const menuItems = navItems.map((item) => ({
    label: item.name,
    link: item.href,
  }))

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeControl, setActiveControl] = useState<'volume' | 'speed' | null>(null)

  const isScrolled = useScrollState()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Get Spotify/Audio context controls
  const { isPlaying, volume, setVolume, playbackRate, setPlaybackRate, currentTrack } = useAudio()

  useClickOutside(mobileMenuRef, (e) => {
    if (
      isOpen &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // Generate dynamic feedback message for LCD display
  const getLCDText = () => {
    if (activeControl === 'volume') {
      return `VOL: ${Math.round(volume * 100)}%`
    }
    if (activeControl === 'speed') {
      return `PITCH: ${playbackRate.toFixed(2)}X (${Math.round(playbackRate * 128)}BPM)`
    }
    return isPlaying ? currentTrack.toUpperCase() : 'STANDBY / CORE LOADED'
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 flex items-center justify-between transition-all duration-500 border-b select-none',
          isScrolled
            ? 'h-13 bg-zinc-100/90 border-zinc-250/60 dark:bg-zinc-950/90 dark:border-zinc-850/60 backdrop-blur-xl shadow-md shadow-black/5'
            : 'h-16 bg-zinc-100/75 border-zinc-200/40 dark:bg-zinc-950/75 dark:border-zinc-900/30 backdrop-blur-md',
        )}
      >
        {/* Skeuomorphic Rack Ears (Left) */}
        <div className="absolute left-10 top-0 bottom-0 border-r border-zinc-300/40 dark:border-zinc-800/40 hidden md:block" />
        <Screw className="absolute left-4.5 top-1/2 -translate-y-1/2 hidden md:flex opacity-50 text-zinc-400 dark:text-zinc-650 hover:rotate-12 transition-transform duration-300" />

        {/* Skeuomorphic Rack Ears (Right) */}
        <div className="absolute right-10 top-0 bottom-0 border-l border-zinc-300/40 dark:border-zinc-800/40 hidden md:block" />
        <Screw className="absolute right-4.5 top-1/2 -translate-y-1/2 hidden md:flex opacity-50 text-zinc-400 dark:text-zinc-650 hover:-rotate-12 transition-transform duration-300" />

        {/* Content Box */}
        <div className="w-full flex items-center justify-between px-5 md:pl-16 md:pr-16 h-full">
          {/* Logo & Info LED */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all duration-300 border border-black/10',
                  isPlaying
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] scale-105'
                    : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
                  'group-hover:scale-115',
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-800 dark:text-zinc-200">
                ADIT.SYS
              </span>
              <span className="text-[6.5px] font-[family-name:var(--font-jetbrains-mono)] tracking-wider text-zinc-400 dark:text-zinc-600 uppercase -mt-0.5">
                {isPlaying ? 'DAC ON' : 'STANDBY'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 xl:flex">
            {scrollLinks.map((item, i) => {
              const isActive = pathname === item.href
              return (
                <span key={item.name} className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-2.5 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[9px] font-bold tracking-[0.15em] uppercase transition-colors duration-200',
                      isActive
                        ? 'text-zinc-950 dark:text-zinc-50'
                        : 'text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />
                    )}
                  </Link>
                  {i < scrollLinks.length - 1 && (
                    <span className="mx-0.5 text-[7px] text-zinc-300 dark:text-zinc-800">
                      /
                    </span>
                  )}
                </span>
              )
            })}

            {scrollLinks.length > 0 && pageLinks.length > 0 && (
              <span className="mx-2.5 h-3 border-l border-zinc-300/40 dark:border-zinc-800/40" />
            )}

            {pageLinks.map((item, i) => {
              const isActive =
                (pathname.startsWith(item.href) && item.href !== '/') ||
                pathname === item.href
              return (
                <span key={item.name} className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-2.5 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[9px] font-bold tracking-[0.15em] uppercase transition-colors duration-200',
                      isActive
                        ? 'text-zinc-950 dark:text-zinc-50'
                        : 'text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200',
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />
                    )}
                  </Link>
                  {i < pageLinks.length - 1 && (
                    <span className="mx-0.5 text-[7px] text-zinc-300 dark:text-zinc-800">
                      /
                    </span>
                  )}
                </span>
              )
            })}
          </nav>

          {/* Core Hardware Audio Console Panel */}
          <div className="flex items-center gap-4.5">
            {/* 1. Retro LCD status screen */}
            <div className="hidden lg:flex flex-col rounded border shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.6)] overflow-hidden relative w-[170px] h-8 border-zinc-300 dark:border-zinc-800 bg-zinc-950">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.12)_1px,rgba(0,0,0,0.12)_2px)] pointer-events-none z-10 opacity-70" />
              <div className="flex flex-col h-full justify-between font-mono text-[8px] text-emerald-400/90 relative z-0 px-2 py-0.5 select-none">
                <div className="flex justify-between text-[6.5px] text-emerald-500/50 font-bold border-b border-emerald-950/40 pb-0.5">
                  <span>OUT PORT L/R</span>
                  <span className={cn(isPlaying && 'animate-pulse text-emerald-400')}>
                    {isPlaying ? 'PLAYBACK' : 'STOPPED'}
                  </span>
                </div>
                <div className="relative w-full overflow-hidden h-3">
                  {isPlaying && activeControl === null ? (
                    <motion.div
                      animate={{ x: ['100%', '-100%'] }}
                      transition={{ repeat: Infinity, duration: 11, ease: 'linear' }}
                      className="absolute whitespace-nowrap text-[7.5px]"
                    >
                      {getLCDText()}
                    </motion.div>
                  ) : (
                    <div className={cn(
                      "absolute w-full text-center text-[7px] tracking-wider uppercase font-semibold",
                      activeControl ? "text-amber-400" : "text-emerald-500/50"
                    )}>
                      {getLCDText()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Audio Level VU Meter */}
            <HeaderVUMeter isPlaying={isPlaying} />

            {/* 3. Tactical volume dial */}
            <div className="hidden sm:block">
              <HeaderKnob
                label="VOLUME"
                value={volume}
                min={0}
                max={1}
                onChange={setVolume}
                colorClass="bg-emerald-500 shadow-[0_0_3px_#10b981]"
                displayValue={`${Math.round(volume * 100)}%`}
                onDragStart={() => setActiveControl('volume')}
                onDragEnd={() => setActiveControl(null)}
              />
            </div>

            {/* 4. Speed / pitch dial */}
            <div className="hidden sm:block">
              <HeaderKnob
                label="SPEED"
                value={playbackRate}
                min={0.5}
                max={2.0}
                onChange={setPlaybackRate}
                colorClass="bg-blue-500 shadow-[0_0_3px_#3b82f6]"
                displayValue={`${playbackRate.toFixed(2)}x`}
                onDragStart={() => setActiveControl('speed')}
                onDragEnd={() => setActiveControl(null)}
              />
            </div>

            {/* 5. Vintage tactile Toggle Switch for dark mode */}
            <ToggleSwitch
              isOn={mounted && theme === 'dark'}
              onToggle={toggleTheme}
            />

            {/* 6. Mobile menu trigger */}
            <button
              ref={toggleButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'flex h-7 w-7 flex-col items-center justify-center gap-1 rounded-md border transition-all active:scale-95 cursor-pointer xl:hidden',
                'border-zinc-300 bg-zinc-200/50 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80',
              )}
              aria-label="Toggle Menu"
            >
              <div
                className={cn(
                  'h-[1.5px] w-3.5 rounded-full bg-zinc-600 dark:bg-zinc-300 transition-all duration-300',
                  isOpen && 'translate-y-[3.5px] rotate-45',
                )}
              />
              <div
                className={cn(
                  'h-[1.5px] w-3.5 rounded-full bg-zinc-600 dark:bg-zinc-300 transition-all duration-300',
                  isOpen && '-translate-y-[2px] -rotate-45',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Staggered Mobile Menu */}
      <StaggeredMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={menuItems}
        colors={
          theme === 'dark'
            ? ['#f59e0b', '#3a4699', '#1e2866']
            : ['#273281', '#3d468b', '#e2e8f0']
        }
        accentColor={theme === 'dark' ? '#f59e0b' : '#273281'}
      />
    </>
  )
}
