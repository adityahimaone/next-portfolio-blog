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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="fixed right-2 bottom-8 z-50 md:right-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className={cn(
              'flex items-center gap-2.5 rounded-2xl border p-1.5 transition-all duration-500',
              'bg-white/[0.04] backdrop-blur-xl',
              isPlaying
                ? 'border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.08)]'
                : 'border-white/[0.08]',
            )}
            layout
          >
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-90',
                isPlaying
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                  : 'bg-white/[0.08] text-zinc-400 hover:bg-white/[0.12] hover:text-zinc-200',
              )}
            >
              {isPlaying ? (
                <Pause size={16} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play
                  size={16}
                  fill="currentColor"
                  className="ml-0.5"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Expanded Controls */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex items-center gap-2.5 overflow-hidden"
                  initial={{ scaleX: 0, opacity: 0, transformOrigin: 'left' }}
                  animate={{ scaleX: 1, opacity: 1, transformOrigin: 'left' }}
                  exit={{ scaleX: 0, opacity: 0, transformOrigin: 'left' }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Divider */}
                  <div className="h-6 w-px bg-white/[0.08]" />

                  {/* Volume Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
                      className="text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {isMuted ? (
                        <VolumeX size={14} aria-hidden="true" />
                      ) : (
                        <Volume2 size={14} aria-hidden="true" />
                      )}
                    </button>
                    <Slider
                      defaultValue={[0.5]}
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.01}
                      className="w-20"
                    />
                  </div>

                  {/* Visualizer */}
                  <div className="flex h-4 items-end gap-[2px]">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          'w-[3px] rounded-full',
                          isPlaying ? 'bg-emerald-400/70' : 'bg-white/15',
                        )}
                        animate={{
                          height: isPlaying ? [4, 14, 8, 12, 4] : 4,
                          opacity: isPlaying ? 1 : 0.4,
                        }}
                        transition={{
                          duration: 0.4,
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
