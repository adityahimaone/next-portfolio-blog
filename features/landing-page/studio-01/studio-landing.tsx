'use client'

import { useEffect, useRef } from 'react'

import type { ArchiveRepo } from '@/features/projects/lib/github'
import { SignalRail } from './signal-rail'
import { SignalHero } from './signal-hero'
import { About, Contact, Practice, Record, Work } from './studio-sections'
import { useStudioMotion } from './use-studio-motion'
import { setInterfaceVisibility } from '@/hooks/use-hide-interface'
import styles from './studio.module.css'

/**
 * The landing page, rebuilt around one object and one line.
 *
 * The previous rack was a room full of instruments. This page is a single
 * listening room: the chrome ring in the hero is the source, the vertical
 * rail under it is the cable, and the sections are what the cable plugs into.
 * Nothing is pinned, nothing is hijacked, and the whole thing is a document
 * that happens to move.
 *
 * `archiveRepos` still crosses the server boundary here. It is narrowed by
 * `app/page.tsx` before it arrives, and the work section prints its length
 * rather than fetching anything client-side.
 */
export default function StudioLandingPage({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  const rootRef = useRef<HTMLElement>(null)
  useStudioMotion({ rootRef })

  // The head script in the root layout retires the floating dock for the
  // landing route before hydration. The old rack's hero restored it on the way
  // out; this page owns that hand-off now. The boot attribute is cleared here
  // too, because this page has no preloader to withdraw it.
  useEffect(() => {
    setInterfaceVisibility('hidden')
    document.documentElement.removeAttribute('data-boot')
    document.documentElement.style.removeProperty('--boot-play')
    return () => setInterfaceVisibility('visible')
  }, [])

  return (
    <main ref={rootRef} className={styles.root} data-studio>
      <a className={styles.skipLink} href="#index">
        Skip to content
      </a>

      <SignalHero />

      <SignalRail
        index="01"
        label="Index"
        href="#index"
        meta="Portrait / statement"
      />
      <About />

      <SignalRail
        index="02"
        label="Practice"
        href="#practice"
        meta="Console / meters"
      />
      <Practice />

      <SignalRail
        index="03"
        label="Record"
        href="#record"
        meta="Timeline / 2018-2026"
      />
      <Record />

      <SignalRail
        index="04"
        label="Work"
        href="#work"
        meta="Releases / 2022-2026"
      />
      <Work archiveRepos={archiveRepos} />

      <SignalRail
        index="05"
        label="Contact"
        href="#contact"
        meta="Mailto / footer"
        variant="bridge"
      />
      <Contact />
    </main>
  )
}
