'use client'

import Link from 'next/link'
import { RESUME_URL } from './shared'
import { useEffect, useState } from 'react'
import { DawHero } from '../components/hero'
import { TextCascade } from '../components/text-cascade'
import { TopBar } from '@/features/layout/components/top-bar'
import { SilkscreenLabel } from './primitives'
import styles from './rack-01.module.css'
import { SectionHeading } from './section-heading'
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Pause,
  Play,
  Square,
} from 'lucide-react'
import { Screw } from '@/components/ui/screw'

const HERO_MARQUEE_ITEMS = [
  'ADITYA HIMAWAN / FRONTEND ENGINEER',
  'REACT / NEXT.JS / TYPESCRIPT',
  'FRONTEND SYSTEMS / PRODUCT UI',
  'APP + DATA / GO / NODE.JS',
  'DOCKER / NGINX / OBSERVABILITY',
  'JAKARTA, ID',
  '4+ YEARS EXPERIENCE',
  '15K+ USER PLATFORM',
] as const

export function Hero() {
  const [heroTitleTop, setHeroTitleTop] = useState('Hello')
  const [heroTitleBottom, setHeroTitleBottom] = useState('こんにちは')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHeroTitleTop('ADITYA')
      setHeroTitleBottom('HIMAWAN')
    }, 720)
    return () => window.clearTimeout(timer)
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--hero-pointer-x',
      `${event.clientX - rect.left}px`,
    )
    event.currentTarget.style.setProperty(
      '--hero-pointer-y',
      `${event.clientY - rect.top}px`,
    )
  }

  return (
    <section id="home" className={styles.hero} data-rack-section>
      <div className={styles.heroStage} onPointerMove={handlePointerMove}>
        {/* Inside the stage so the bar scrolls away with the hero instead of
            sitting above it. Placed before the wall in the DOM; .topBar is
            z-50 and the wall is z-0, so it still paints on top. */}
        <TopBar />
        <div className={styles.heroBootSequence} aria-hidden="true">
          <i />
          <span>Routing signal</span>
        </div>
        <div
          className={styles.heroDeviceWall}
          aria-label="Interactive collection of music devices"
        >
          <DawHero backgroundOnly />
        </div>
        <div className={styles.heroBackdropName} aria-hidden="true">
          <TextCascade
            text={heroTitleTop}
            className={styles.heroBackdropCascade}
            animateInitial={false}
          />
          <TextCascade
            text={heroTitleBottom}
            className={styles.heroBackdropCascade}
            animateInitial={false}
          />
        </div>
        <div className={styles.heroAtmosphere} aria-hidden="true" />

        <main className={styles.heroImmersiveContent}>
          <div className={styles.heroEditorialPanel}>
            <div className={styles.heroKicker}>
              <span>Frontend Engineer</span>
              <i aria-hidden="true" />
              <span>Jakarta, Indonesia</span>
            </div>
            <h1 className={styles.srOnly}>Aditya Himawan, Frontend Engineer</h1>
            <strong className={styles.heroPanelTitle}>
              Built for the moment after launch.
            </strong>
            <p>
              Frontend systems for products that need to work clearly, reliably,
              and at scale. React, Next.js, and TypeScript across products used
              by more than 15,000 people.
            </p>
            <div className={styles.heroActions}>
              <a href="#work" className={styles.primaryButton}>
                <span>See the works</span>
                <ArrowDownRight size={18} aria-hidden="true" />
              </a>
              <Link href="/blog" className={styles.heroResumeLink}>
                Read the notes <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className={styles.heroResumeLink}
              >
                Open résumé <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div
              className={styles.heroInlineProof}
              aria-label="Career highlights"
            >
              <span>
                <b>4+</b> years
              </span>
              <span>
                <b>3</b> product teams
              </span>
              <span>
                <b>15K+</b> users
              </span>
            </div>
          </div>
        </main>

        <div className={styles.heroBottomRail}>
          <span>Interactive device wall</span>
          <a href="#about">
            Continue <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className={styles.heroAboutHandoff} aria-hidden="true">
          <span>Next signal / 02</span>
          <strong>Profile</strong>
        </div>
      </div>
    </section>
  )
}
