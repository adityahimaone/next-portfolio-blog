'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Monitor, Volume2, VolumeX, Sun, Moon, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SfxButton } from '@/components/ui/sfx-button'

interface HUDBarProps {
  currentStage?: { num: string; name: string }
}

export function HUDBar({ currentStage }: HUDBarProps) {
  const [crtOn, setCrtOn] = useState(true)
  const [sfxOn, setSfxOn] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCrt = localStorage.getItem('crt')
    const savedSfx = localStorage.getItem('sfx')
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedCrt !== null) setCrtOn(savedCrt === 'true')
    if (savedSfx !== null) setSfxOn(savedSfx === 'true')
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const toggleCrt = () => {
    const newValue = !crtOn
    setCrtOn(newValue)
    localStorage.setItem('crt', String(newValue))
    localStorage.setItem('crt-enabled', String(newValue))
    window.dispatchEvent(new CustomEvent('crt-toggle', { detail: { enabled: newValue } }))
  }

  const toggleSfx = () => {
    const newValue = !sfxOn
    setSfxOn(newValue)
    localStorage.setItem('sfx', String(newValue))
    window.dispatchEvent(new CustomEvent('sfx-toggle', { detail: { enabled: newValue } }))
  }

  const toggleTheme = () => {
    const newValue = theme === 'dark' ? 'light' : 'dark'
    setTheme(newValue)
    localStorage.setItem('theme', newValue)
    document.documentElement.setAttribute('data-theme', newValue)
  }

  const handleReplay = () => {
    localStorage.removeItem('_has_booted')
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 h-14 border-b-2 border-white bg-gray-deep md:h-16">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        {/* ─── ZONE 1: Brand + Power LED ─── */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={cn(
                'h-3 w-3 rounded-full bg-red',
                mounted && 'animate-pulse',
              )}
              style={{
                animationDuration: '1.6s',
                boxShadow: '0 0 6px #E10600, 0 0 12px #8A0400',
              }}
            />
            <div className="absolute top-1 left-1 h-1 w-1 rounded-full bg-white/50" />
          </div>
          <span className="t-hud text-white-bone">ADIT</span>
        </div>

        {/* ─── ZONE 2: Stage Indicator ─── */}
        <div className="flex items-center gap-2">
          <span className="t-hud-xs text-white-dim">STAGE</span>
          <div className="flex items-center gap-1">
            <span className="t-hud text-red">
              {currentStage?.num ?? '--'}
            </span>
            <span className="t-hud-xs text-white-bone">//</span>
            <span className="t-hud text-white-bone">
              {currentStage?.name ?? 'TITLE'}
            </span>
          </div>
        </div>

        {/* ─── ZONE 3: Navigation Links ─── */}
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { label: 'HOME', href: '/' },
            { label: 'ABOUT', href: '#about' },
            { label: 'WORK', href: '#projects' },
            { label: 'CONTACT', href: '#contact' },
            { label: 'BLOG', href: '/blog' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="t-hud-xs relative text-white-dim transition-colors hover:text-white-bone"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* ─── ZONE 4: Controls Cluster ─── */}
        <div className="flex items-center gap-2">
          <SfxButton
            onClick={toggleCrt}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-none border border-gray-light bg-gray-deep transition-colors hover:bg-gray',
              crtOn && 'border-red bg-red/10',
            )}
            aria-label={crtOn ? 'CRT ON' : 'CRT OFF'}
            aria-pressed={crtOn}
          >
            <Monitor size={14} className={crtOn ? 'text-red' : 'text-white-dim'} />
          </SfxButton>

          <SfxButton
            onClick={toggleSfx}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-none border border-gray-light bg-gray-deep transition-colors hover:bg-gray',
              sfxOn && 'border-red bg-red/10',
            )}
            aria-label={sfxOn ? 'SFX ON' : 'SFX OFF'}
            aria-pressed={sfxOn}
          >
            {sfxOn ? (
              <Volume2 size={14} className="text-red" />
            ) : (
              <VolumeX size={14} className="text-white-dim" />
            )}
          </SfxButton>

          <SfxButton
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-none border border-gray-light bg-gray-deep transition-colors hover:bg-gray"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon size={14} className="text-white-dim" />
            ) : (
              <Sun size={14} className="text-white-dim" />
            )}
          </SfxButton>

          <SfxButton
            onClick={handleReplay}
            className="flex h-8 w-8 items-center justify-center rounded-none border border-gray-light bg-gray-deep transition-colors hover:bg-gray"
            aria-label="Replay boot sequence"
          >
            <RotateCcw size={14} className="text-white-dim" />
          </SfxButton>
        </div>
      </div>
    </header>
  )
}
