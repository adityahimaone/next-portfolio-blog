'use client'

import { useRef, useState } from 'react'

import { Work } from '../work/work'
import type { ArchiveRepo } from '@/features/projects/lib/github'
import { About } from './section-about'
import { CableDivider } from './section-cabledivider'
import { Contact } from './section-contact'
import { Experience } from './section-experience'
import { Hero } from './section-hero'
import { SignalDivider } from './section-signaldivider'
import { Skills } from './section-skills'
import styles from './rack-01.module.css'
import { SEAM_SVH } from '../constants/seam'
import { useRackAnimations } from './use-rack-animations'

/**
 * The landing page: seven sections stacked in reading order, one scroll
 * container, and the two pieces of state the animations write back into.
 *
 * All scroll-linked motion lives in useRackAnimations rather than here, so
 * this file is only the composition. The section order matters — the about
 * and experience strips scrub off the same scroll position the hero hands off
 * from — so reordering the JSX changes the page, not just the markup.
 *
 * `archiveRepos` arrives from the page, the only server boundary above this
 * client tree. It is passed down rather than fetched here because this
 * component cannot await, and an async component rendered inside a client
 * tree throws — taking the whole page's interactivity with it.
 */
export default function Rack01LandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [aboutIndex, setAboutIndex] = useState(0)
  const [aboutProgress, setAboutProgress] = useState(0)
  const [experienceIndex, setExperienceIndex] = useState(0)

  useRackAnimations({
    rootRef,
    setAboutIndex,
    setAboutProgress,
    setExperienceIndex,
  })

  return (
    /* `<main>` rather than a plain div: this wrapper holds every section of the
       page, and as a div all of it sat outside any landmark — a screen-reader
       user had no single place to jump to, and axe flagged 60 nodes as content
       outside landmarks. It is also what the skip link below targets. The
       ref and className are unchanged, so neither the scroll-scrubbing nor the
       layout depends on the element name. */
    <main
      ref={rootRef}
      className={styles.root}
      style={{ '--seam-svh': SEAM_SVH } as React.CSSProperties}
    >
      <a className={styles.skipLink} href="#about">
        Skip to content
      </a>
      <Hero />
      <About
        selected={aboutIndex}
        setSelected={setAboutIndex}
        scrollProgress={aboutProgress}
      />
      <SignalDivider />
      <Skills />
      <CableDivider />
      <Experience selected={experienceIndex} setSelected={setExperienceIndex} />
      <Work archiveRepos={archiveRepos} />
      <Contact />
    </main>
  )
}
