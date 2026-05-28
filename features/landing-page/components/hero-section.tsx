'use client'

import { useRef, useEffect, useState } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { ArrowDown, Mail } from 'lucide-react'
import { Magnetic } from '@/components/magnetic'
import { useAudio } from '@/features/landing-page/spotify/audio-context'
import { OP1Device } from './hero/OP1Device'
import { LCDMarquee } from './hero/LCDMarquee'

export function HeroSection() {
  const [baseDelay, setBaseDelay] = useState(1)
  const { isPlaying } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('preloaderShown')) {
      setBaseDelay(0.1)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const deskY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const op1Y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <>
      <section
        ref={containerRef}
        className="signal-chain-root relative flex min-h-screen w-full flex-col items-center justify-end overflow-hidden"
        style={{ background: '#0D0B0A' }}
      >
        {/* ============ PARALLAX LAYER 0: Desk surface background ============ */}
        <m.div
          className="absolute inset-0 z-0"
          style={{
            y: deskY,
            background: `
              radial-gradient(ellipse at 50% 30%, #1A1513 0%, #0D0B0A 70%),
              radial-gradient(ellipse at 30% 80%, rgba(0,180,216,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(255,85,0,0.04) 0%, transparent 50%)
            `,
          }}
        />

        {/* Desk texture grid (studio desk surface) */}
        <m.div
          className="absolute bottom-0 left-0 w-full z-[1]"
          style={{ y: deskY }}
        >
          <div
            className="mx-auto w-full max-w-[960px] bg-repeat opacity-[0.03]"
            style={{
              height: '100px',
              backgroundImage:
                `linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px),` +
                `linear-gradient(0deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </m.div>

        {/* ============ PARALLAX LAYER 1: Screen glow reflection ============ */}
        <m.div
          className="pointer-events-none absolute z-[2]"
          style={{
            top: '30%',
            left: '50%',
            width: '600px',
            height: '400px',
            transform: 'translate(-50%, -60%)',
            opacity: glowOpacity,
            background:
              'radial-gradient(ellipse, rgba(0,180,216,0.15) 0%, rgba(0,180,216,0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* ============ PARALLAX LAYER 2: OP-1 Device (centerpiece) ============ */}
        <m.div
          className="relative z-10 w-full px-4 pb-4 sm:pb-8"
          style={{ y: op1Y }}
        >
          <OP1Device className="mx-auto" />

          {/* ============ PARALLAX LAYER 3: CTA below device ============ */}
          <m.div
            className="mx-auto mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            {/* [▶ VIEW PORTFOLIO] */}
            <Magnetic intensity={0.15}>
              <a
                href="#projects"
                className="group flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold tracking-wider transition-all"
                style={{
                  background: '#FF5500',
                  color: '#fff',
                  fontFamily: 'var(--sc-font-mono)',
                  boxShadow: '0 2px 12px rgba(255,85,0,0.4)',
                }}
              >
                <span className="text-base">▶</span>
                <span>VIEW PORTFOLIO</span>
              </a>
            </Magnetic>

            {/* [● RECORD SESSION] */}
            <Magnetic intensity={0.15}>
              <a
                href="#contact"
                className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-bold tracking-wider transition-all hover:bg-white/5"
                style={{
                  borderColor: '#FF3344',
                  color: '#FF3344',
                  fontFamily: 'var(--sc-font-mono)',
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: '#FF3344', boxShadow: '0 0 8px rgba(255,51,68,0.5)' }}
                />
                <span>RECORD SESSION</span>
              </a>
            </Magnetic>
          </m.div>

          {/* ============ Subtitle text ============ */}
          <m.p
            className="mx-auto mt-4 max-w-lg text-center text-xs leading-relaxed sm:text-sm"
            style={{
              color: '#8A8682',
              fontFamily: 'var(--sc-font-body)',
              opacity: contentOpacity,
            }}
          >
            Orchestrating code and rhythm into immersive digital experiences.
            <br className="hidden sm:block" />
            Frontend Developer & Audio Enthusiast.
          </m.p>
        </m.div>

        {/* ============ Floating music notes (parallax layer 4) ============ */}
        <m.div
          className="pointer-events-none fixed"
          style={{
            top: '25%',
            right: '12%',
            fontSize: '2rem',
            opacity: useTransform(scrollYProgress, [0, 0.2], [0.12, 0]),
            y: useTransform(scrollYProgress, [0, 1], [0, -60]),
          }}
        >
          <span style={{ color: '#00B4D8' }}>♪</span>
        </m.div>
        <m.div
          className="pointer-events-none fixed"
          style={{
            top: '40%',
            left: '10%',
            fontSize: '1.5rem',
            opacity: useTransform(scrollYProgress, [0, 0.2], [0.1, 0]),
            y: useTransform(scrollYProgress, [0, 1], [0, -40]),
          }}
        >
          <span style={{ color: '#FF5500' }}>♫</span>
        </m.div>
        <m.div
          className="pointer-events-none fixed"
          style={{
            bottom: '20%',
            right: '20%',
            fontSize: '1.8rem',
            opacity: useTransform(scrollYProgress, [0, 0.2], [0.08, 0]),
            y: useTransform(scrollYProgress, [0, 1], [0, -50]),
          }}
        >
          <span style={{ color: '#00FF41' }}>♬</span>
        </m.div>

        {/* ============ Scroll indicator (bottom center) ============ */}
        <m.div
          className="pointer-events-none absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: contentOpacity }}
        >
          <span
            className="text-[9px] font-bold tracking-[0.3em]"
            style={{ color: '#555', fontFamily: 'var(--sc-font-mono)' }}
          >
            SCROLL
          </span>
          <m.div
            className="h-6 w-4 rounded-full border"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <m.div
              className="mx-auto mt-1 h-1.5 w-0.5 rounded-full"
              style={{ background: '#00FF41' }}
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </m.div>
        </m.div>
      </section>

      {/* ============ LCD MARQUEE TICKER (below hero) ============ */}
      <LCDMarquee />
    </>
  )
}
