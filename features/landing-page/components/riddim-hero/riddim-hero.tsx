'use client'

import { useEffect, useRef, useState } from 'react'

import { TopBar } from '@/features/layout/components/top-bar'
import { HeroIndex, RiddimMachine } from './riddim-device'
import { useRiddimHero } from './use-riddim-hero'
import styles from './riddim-hero.module.css'

/**
 * The hero: the machine, full bleed, and nothing else.
 *
 * The section's height IS the clone's height, so the page's scroll is the
 * machine's face: you start at the port strip and the RIDDIM wordmark, the
 * screen prints ADITYA HIMAWAN at headline size, and scrolling walks you down
 * the console, where the nine numbered pads and the right-hand caps are the
 * site's navigation. The About band begins at the machine's bottom edge, so
 * there is no dead scroll between the two.
 *
 * The machine carries its own copy and its own links (`riddim-content.ts`),
 * which is why there is no floating headline beside it and no separate key
 * list. Two viewport facts decide who owns them:
 *
 *   - below 769px a 84-unit pad is 34px, too small to be the navigation, so
 *     the links move to the stack under the poster and the machine's controls
 *     go back to being drawings;
 *   - below 1181px the machine's own headline scales under ~34px, so the copy
 *     moves to the stack as well.
 *
 * Both are read after mount rather than during render, so the server output —
 * the stack, which is the layout that works everywhere — is also what a client
 * without JS keeps.
 */

const WIDE_QUERY = '(min-width: 1181px)'
const LIVE_QUERY = '(min-width: 769px)'

function useMachineLayout() {
  const [layout, setLayout] = useState({ interactive: false, onMachine: false })

  useEffect(() => {
    const wide = window.matchMedia(WIDE_QUERY)
    const live = window.matchMedia(LIVE_QUERY)
    const sync = () =>
      setLayout({ interactive: live.matches, onMachine: wide.matches })

    sync()
    wide.addEventListener('change', sync)
    live.addEventListener('change', sync)
    return () => {
      wide.removeEventListener('change', sync)
      live.removeEventListener('change', sync)
    }
  }, [])

  return layout
}

export function RiddimHero() {
  const heroRef = useRef<HTMLElement>(null)
  const { interactive, onMachine } = useMachineLayout()

  useRiddimHero({ heroRef })

  return (
    <section
      id="home"
      ref={heroRef}
      className={styles.hero}
      data-rack-section
      data-riddim-hero
    >
      <TopBar />
      <div className={styles.room} aria-hidden="true" />
      <RiddimMachine interactive={interactive} printCopy={onMachine} />
      {onMachine ? null : <HeroIndex showIndex={!interactive} />}
    </section>
  )
}
