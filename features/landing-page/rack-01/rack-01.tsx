'use client'

import { useRef, useState } from 'react'

import { Work } from '../work/work'
import { About } from './section-about'
import { CableDivider } from './section-cabledivider'
import { Contact } from './section-contact'
import { Experience } from './section-experience'
import { Hero } from './section-hero'
import { SignalDivider } from './section-signaldivider'
import { Skills } from './section-skills'
import styles from './rack-01.module.css'
import { useRackAnimations } from './use-rack-animations'

/**
 * The landing page: seven sections stacked in reading order, one scroll
 * container, and the two pieces of state the animations write back into.
 *
 * All scroll-linked motion lives in useRackAnimations rather than here, so
 * this file is only the composition. The section order matters — the about
 * and experience strips scrub off the same scroll position the hero hands off
 * from — so reordering the JSX changes the page, not just the markup.
 */
export default function Rack01LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const projectDividerRef = useRef<HTMLDivElement>(null)
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
    <div ref={rootRef} className={styles.root}>
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
      <Experience
        selected={experienceIndex}
        setSelected={setExperienceIndex}
        projectDividerRef={projectDividerRef}
      />
      <Work />
      <Contact />
    </div>
  )
}
