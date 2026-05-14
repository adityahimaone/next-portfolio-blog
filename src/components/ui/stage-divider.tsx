'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface StageDividerProps {
  variant?: 'loading' | 'glitch' | 'door' | 'static'
  label?: string
}

export function StageDivider({ variant = 'loading', label }: StageDividerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full py-8 text-center',
        variant === 'loading' && 'bg-black-true',
      )}
    >
      {variant === 'loading' && (
        <>
          <style>{`
            @keyframes loading-bar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-in .loading-bar {
              animation: loading-bar 800ms steps(8, end) forwards;
            }
          `}</style>
          <div className="mx-auto max-w-xs">
            <p className="t-hud-xs mb-3 text-white-dim">LOADING NEXT STAGE...</p>
            <div className="h-2 w-full border border-white bg-black-true">
              <div className="loading-bar h-full w-0 bg-red" />
            </div>
          </div>
        </>
      )}

      {variant === 'glitch' && (
        <>
          <style>{`
            @keyframes glitch-shake {
              0% { transform: translate(0, 0); }
              20% { transform: translate(-2px, 2px); }
              40% { transform: translate(2px, -2px); }
              60% { transform: translate(-2px, -2px); }
              80% { transform: translate(2px, 2px); }
              100% { transform: translate(0, 0); }
            }
            .animate-in .glitch-text {
              animation: glitch-shake 200ms steps(5, end) forwards;
            }
          `}</style>
          <div className="glitch-text t-heading-m text-red">{label || 'GLITCH'}</div>
        </>
      )}

      {variant === 'door' && (
        <>
          <style>{`
            @keyframes door-close {
              0% { clip-path: inset(0 0 0 0); }
              50% { clip-path: inset(0 50% 0 50%); }
              100% { clip-path: inset(0 100% 0 0); }
            }
            @keyframes door-open {
              0% { clip-path: inset(0 100% 0 0); }
              100% { clip-path: inset(0 0 0 0); }
            }
            .animate-in .door-left {
              animation: door-close 300ms steps(4, end) forwards;
            }
            .animate-in .door-right {
              animation: door-open 300ms steps(4, end) 300ms forwards;
            }
          `}</style>
          <div className="door-left relative h-32 bg-red" />
          <div className="door-right relative h-32 bg-red" />
        </>
      )}
    </div>
  )
}
