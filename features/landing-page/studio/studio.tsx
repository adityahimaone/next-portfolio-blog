'use client'

import { About } from './about'
import { ChapterRail } from './chapter-rail'
import { Contact } from './contact'
import { Sparkle } from './doodles'
import { Hero } from './hero'
import { Projects } from './projects'
import { Showcase } from './showcase'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { Skills } from './skills'
import { usePagePosition } from './use-page-position'
import styles from './studio.module.css'

const MARQUEE_WORDS = [
  'Design engineering',
  'Motion',
  'Type',
  'Code',
  'Systems',
  'The details',
] as const

function Marquee() {
  return (
    <div className={styles.marqueeWrap} aria-hidden>
      <div className={styles.marquee}>
        {[0, 1].map((group) => (
          <div className={styles.marqueeGroup} key={group}>
            {MARQUEE_WORDS.map((word) => (
              <span key={word} className="flex items-center gap-4">
                {word}
                <Sparkle className="size-4 text-[var(--butter)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Side A: one scroll, six chapters, a wall of things made after hours, and a
 * footer that writes its own name. The DAW timeline this page used to be is
 * still here in the connective tissue — chapter numbers, a playhead-style rail,
 * a running tempo of stickers — but the machine is now a pinboard rather than
 * a mixing desk.
 */
export default function Studio() {
  const { active, scrolled, footerVisible } = usePagePosition()

  return (
    <div className={`${styles.root} ${styles.grain}`}>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-full focus:bg-[var(--butter)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--ink)]"
      >
        Skip to content
      </a>

      <SiteHeader
        active={active}
        scrolled={scrolled}
        footerVisible={footerVisible}
      />
      {footerVisible ? null : <ChapterRail active={active} />}

      <main>
        <Hero />
        <Marquee />
        <About />
        <Showcase />
        <Projects />
        <Skills />
        <Contact />
      </main>

      <SiteFooter />
    </div>
  )
}
