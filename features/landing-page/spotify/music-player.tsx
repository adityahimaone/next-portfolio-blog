'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/slider'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import useClickOutside from '@/hooks/use-click-outside'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MusicPlayer() {
  const { isPlaying, togglePlay, isMuted, toggleMute, volume, setVolume } =
    useAudio()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog'
  const isMusicPage = pathname.startsWith('/music')
  const shouldRenderPlayer =
    isVisible && !(isBlogPost && !isPlaying) && !isMusicPage

  useClickOutside(containerRef, () => {
    setIsHovered(false)
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0])
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 1000)
  }

  return (
    <AnimatePresence>
      {shouldRenderPlayer && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{
            opacity: showScrollTop ? 1 : 0,
            scale: showScrollTop ? 1 : 0.8,
            y: showScrollTop ? 0 : 50,
          }}
          transition={{ duration: 0.4 }}
          className={cn(
            'fixed right-3 bottom-24 z-50 md:right-8',
            !showScrollTop && 'pointer-events-none',
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Audio Chassis Widget */}
          <motion.div
            className="group relative flex items-center gap-2.5 rounded-lg border border-[#3e423c] bg-[#121412] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_1px_rgba(255,255,255,0.12),0_0_0_1px_#070807] transition-all"
            layout
          >
            {/* Micro Screws */}
            <div className="absolute top-1 left-1 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-[#2e312c] opacity-60">
              <div className="h-0.5 w-1 rotate-45 bg-[#0d0e0d]" />
            </div>
            <div className="absolute top-1 right-1 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-[#2e312c] opacity-60">
              <div className="h-0.5 w-1 -rotate-45 bg-[#0d0e0d]" />
            </div>

            {/* Tactile Play/Pause Button */}
            <div className="relative">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-md border transition-all active:scale-95',
                  isPlaying
                    ? 'border-[#ff5a1f]/60 bg-gradient-to-b from-[#2a1d17] to-[#171311] text-[#ff5a1f] shadow-[0_0_12px_rgba(255,90,31,0.35),inset_0_1px_rgba(255,255,255,0.15)]'
                    : 'border-[#4a4d47] bg-gradient-to-b from-[#252824] to-[#151715] text-[#a0a49c] hover:border-[#686c64] hover:text-[#e4e1d7] shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.08)]',
                )}
              >
                {isPlaying ? (
                  <Pause size={17} fill="currentColor" aria-hidden="true" />
                ) : (
                  <Play
                    size={17}
                    fill="currentColor"
                    className="ml-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Status LED */}
              <div
                className={cn(
                  'absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-[#0d0e0d] transition-colors',
                  isPlaying
                    ? 'bg-[#5cd6a3] shadow-[0_0_8px_#5cd6a3]'
                    : 'bg-[#5c2424]',
                )}
              />
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex items-center gap-3 overflow-hidden pr-1"
                  initial={{ scaleX: 0, opacity: 0, transformOrigin: 'left' }}
                  animate={{ scaleX: 1, opacity: 1, transformOrigin: 'left' }}
                  exit={{ scaleX: 0, opacity: 0, transformOrigin: 'left' }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  {/* Separator Line */}
                  <div className="h-8 w-px bg-[#2e312c]" />

                  {/* Volume Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
                      className="text-[#969b90] transition-colors hover:text-[#5cd6a3]"
                    >
                      {isMuted ? (
                        <VolumeX size={15} aria-hidden="true" />
                      ) : (
                        <Volume2 size={15} aria-hidden="true" />
                      )}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between font-mono text-[7px] font-bold tracking-wider text-[#82877c]">
                        <span>VOL</span>
                        <span>{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                      </div>
                      <Slider
                        defaultValue={[0.5]}
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.01}
                        className="w-20 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Spectrum Visualizer */}
                  <div className="flex h-5 items-end gap-0.5 pl-1">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-xs bg-[#ff5a1f]"
                        animate={{
                          height: isPlaying ? [4, 16, 7, 13, 4] : 4,
                          opacity: isPlaying ? 1 : 0.25,
                        }}
                        transition={{
                          duration: 0.35,
                          repeat: Infinity,
                          delay: i * 0.08,
                          repeatType: 'reverse',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
