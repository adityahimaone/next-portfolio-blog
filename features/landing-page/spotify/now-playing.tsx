'use client'

import { useState, useEffect } from 'react'
import { AudioLines } from 'lucide-react'
import { NowPlayingResponse } from '@/types'
import Image from 'next/image'
import { m as motion } from 'motion/react'
import { cn } from '@/lib/utils'

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch(`/api/now-playing?t=${Date.now()}`)
        if (res.ok) {
          const newData: NowPlayingResponse = await res.json()
          setData(newData)
        }
      } catch (error) {
        console.error('Error fetching now playing:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 10000)
    return () => clearInterval(interval)
  }, [])

  const isPlaying = data?.isPlaying ?? false

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:border-white/[0.12]">
      {/* Ambient glow from album art */}
      {isPlaying && data?.albumImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-15 blur-3xl transition-opacity duration-700"
          style={{
            backgroundImage: `url(${data.albumImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className="relative z-10 flex gap-4 p-5">
        {/* Album Art — rounded, polished */}
        <div className="group/art relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-white/5 shadow-lg">
          {isPlaying && data?.albumImageUrl ? (
            <>
              <Image
                src={data.albumImageUrl}
                alt="Album Art"
                width={112}
                height={112}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/art:scale-105"
              />
              {/* Shine overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/art:opacity-100" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5">
              <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/30 animate-spin opacity-40" />
            </div>
          )}
        </div>

        {/* Track Info + Visualizer */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          {/* Status + Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-500',
                  isPlaying
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse'
                    : 'bg-zinc-500',
                )}
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>
            <p className="truncate text-sm font-semibold text-zinc-100">
              {isPlaying ? data?.title : 'No Signal'}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {isPlaying ? data?.artist : 'Waiting for input...'}
            </p>
          </div>

          {/* Visualizer Bars */}
          <div className="mt-3 flex h-5 items-end gap-[3px]">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'flex-1 rounded-full',
                  isPlaying
                    ? 'bg-emerald-400/60'
                    : 'bg-white/10',
                )}
                animate={{
                  height: isPlaying
                    ? [`${15 + Math.random() * 85}%`, `${15 + Math.random() * 85}%`]
                    : '15%',
                }}
                transition={{
                  duration: 0.35 + Math.random() * 0.15,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.04,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer — Spotify link */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Spotify
        </span>
        <a
          href={data?.songUrl || '#'}
          target="_blank"
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300',
            isPlaying
              ? 'bg-white/[0.08] text-zinc-200 hover:bg-white/[0.14] active:scale-95'
              : 'pointer-events-none bg-white/[0.03] text-zinc-500 opacity-50',
          )}
        >
          <AudioLines size={12} />
          Open in Spotify
        </a>
      </div>
    </div>
  )
}
