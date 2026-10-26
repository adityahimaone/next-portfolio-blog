'use client'

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { useHeroDockVisibility } from '../components/arrangement/use-hero-dock-visibility'
import { Bolt, Burst, Daisy, Smiley, Sun } from './doodles'
import { Reveal } from './reveal'
import { HERO_FACTS, CHAPTERS, scrollToSection } from './studio-data'
import styles from './studio.module.css'

const NEXT = CHAPTERS[1]

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  useHeroDockVisibility({ sectionRef })

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 })

  const smileX = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const smileY = useTransform(sy, [-0.5, 0.5], [-8, 8])
  const burstX = useTransform(sx, [-0.5, 0.5], [11, -11])
  const burstY = useTransform(sy, [-0.5, 0.5], [7, -7])
  const daisyX = useTransform(sx, [-0.5, 0.5], [7, -7])
  const daisyY = useTransform(sy, [-0.5, 0.5], [-11, 11])
  const noteX = useTransform(sx, [-0.5, 0.5], [-4, 4])
  const noteY = useTransform(sy, [-0.5, 0.5], [3, -3])

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = artRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((event.clientX - rect.left) / rect.width - 0.5)
    my.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.heroHalo} aria-hidden />
      <div className={styles.heroDots} aria-hidden />

      <div className={cn(styles.shell, styles.heroGrid)}>
        <div>
          <Reveal>
            <span className={styles.nameTag} data-hero-name-clip>
              <span aria-hidden>✳</span>
              Aditya Himawan
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <div className={cn(styles.heroEyebrow, 'mt-5')}>
              <span className="dot" aria-hidden />
              <span>Design engineer</span>
              <span aria-hidden>·</span>
              <span>Jakarta, GMT+7</span>
              <span aria-hidden>·</span>
              <span>open to good problems</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 id="hero-title" className={styles.heroTitle}>
              Interfaces
              <br />
              with a <span className={styles.pulseWord}>pulse</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className={styles.heroLede}>
              I&apos;m Aditya, a design engineer who builds product interfaces
              in React and TypeScript, then sweats the{' '}
              <strong>motion, type and tiny moments</strong> that make them feel
              alive. Four years in, still convinced the details are the product.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => scrollToSection('work', reduced)}
              >
                See the work
                <ArrowRight size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.ghostLink}
                onClick={() => scrollToSection('contact', reduced)}
              >
                Say hello
                <ArrowUpRight size={15} aria-hidden />
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className={styles.heroStats}>
              {HERO_FACTS.map((fact) => (
                <div key={fact.label} className={styles.heroStat}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    <b>{fact.value}</b>
                    <span aria-hidden>{fact.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.36}>
            <button
              type="button"
              className={styles.heroScroll}
              onClick={() => scrollToSection(NEXT.id, reduced)}
            >
              <span>
                {NEXT.number} · {NEXT.label}
              </span>
              <svg
                viewBox="0 0 24 34"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                <path d="M12 2v25" />
                <path d="M5 21l7 8 7-8" />
              </svg>
            </button>
          </Reveal>
        </div>

        <Reveal delay={0.14} y={34}>
          <div
            ref={artRef}
            className={styles.heroArt}
            onPointerMove={onMove}
            onPointerLeave={reset}
          >
            <div className={styles.artStage}>
              <motion.div
                style={{ x: noteX, y: noteY, rotate: -5 }}
                className={cn(styles.sheetNote, 'z-[7]')}
              >
                <b>currently</b>
                Building a habit tracker that refuses to guilt you. Drawing
                stickers in code when it gets quiet.
              </motion.div>

              <div className={styles.sheet}>
                <span className={cn(styles.tape, styles.tapeTop)} aria-hidden />
                <div className={styles.sheetTop}>
                  <span>Side A / design engineer</span>
                  <span className={styles.sheetBadge}>
                    <span
                      className="size-1.5 rounded-full bg-[var(--ink)]"
                      aria-hidden
                    />
                    open for work
                  </span>
                </div>

                <Sun className={styles.sheetSun} title="A smiling sun" />

                <p className={styles.sheetLine}>
                  Good interfaces are a small act of hospitality.
                </p>

                <div className={styles.sheetFoot}>
                  <span>Jakarta · GMT+7</span>
                  <span className={styles.sheetSwatches} aria-hidden>
                    <i style={{ background: 'var(--cobalt)' }} />
                    <i style={{ background: 'var(--tangerine)' }} />
                    <i style={{ background: 'var(--butter)' }} />
                    <i style={{ background: 'var(--pink)' }} />
                  </span>
                  <span>Est. 2021</span>
                </div>
              </div>

              <motion.div
                style={{ x: smileX, y: smileY }}
                className={cn(styles.heroSticker, styles.heroStickerSmiley)}
              >
                <span className={styles.heroFloat}>
                  <Smiley className="w-full" title="Smiley sticker" />
                </span>
              </motion.div>

              <motion.div
                style={{ x: burstX, y: burstY }}
                className={cn(styles.heroSticker, styles.heroStickerBurst)}
              >
                <span className={styles.heroFloat}>
                  <Burst text="hi!" className="w-full" title="Hi sticker" />
                </span>
              </motion.div>

              <motion.div
                style={{ x: daisyX, y: daisyY }}
                className={cn(styles.heroSticker, styles.heroStickerDaisy)}
              >
                <span className={styles.heroFloat}>
                  <Daisy className="w-full" title="Daisy sticker" />
                </span>
              </motion.div>

              <div className={cn(styles.heroSticker, styles.heroStickerBolt)}>
                <span className={styles.heroFloat}>
                  <Bolt className="w-full" title="Lightning bolt sticker" />
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
