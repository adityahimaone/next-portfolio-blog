'use client'

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { useMotionValue } from 'motion/react'

import { EMAIL } from '../../constants'
import { FAQ_ITEMS } from '../contact-desk/contact-content'
import { useReveal } from '../contact-desk/use-reveal'
import { MagneticCta } from './contact-cta'
import { ContactNode } from './contact-node'
import {
  FILTERS,
  TRACK_META,
  accentFor,
  accentInkFor,
  countFor,
  indexOfId,
  metaFor,
  shapeFor,
  type Filter,
} from './contact-orbit'
import { ContactWireframe } from './contact-wireframe'
import { useMediaQuery } from './use-media'
import styles from './contact-nodes.module.css'

/**
 * The Contact FAQ as a compact magnetic field of pills.
 *
 * Nine questions float on the same warm grid as the rest of Contact. The
 * category filters are spotlights on three orbits rather than tabs: they
 * change the wireframe and pull the matching pills forward while the rest
 * recede. Opening a pill expands it in place — the question grows, the card
 * turns from a capsule into an editorial panel, and the answer cascades in
 * word by word. No modal, no scroll lock, no portal: the question is the
 * disclosure and the page never leaves the field.
 *
 * The pointer is read into two motion values, never React state, so a sweep
 * across the cluster costs no renders. Deep links (#see-the-work) still open
 * the matching pill and bring it into view.
 */
export function ContactNodes({ email = EMAIL }: { email?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const headingId = `${uid}-heading`
  const [reveal, revealState] = useReveal<HTMLElement>(0.1)
  const [filter, setFilter] = useState<Filter>('All')
  const [active, setActive] = useState<number | null>(null)

  const still = useMediaQuery('(prefers-reduced-motion: reduce)')
  const finePointer =
    useMediaQuery('(hover: hover) and (pointer: fine)') && !still

  const pointerX = useMotionValue(Infinity)
  const pointerY = useMotionValue(Infinity)

  const updateHash = useCallback((index: number | null) => {
    const base = `${window.location.pathname}${window.location.search}`
    const item = index === null ? null : FAQ_ITEMS[index]
    history.replaceState(history.state, '', item ? `${base}#${item.id}` : base)
  }, [])

  const closeActive = useCallback(
    (restoreFocus = false) => {
      if (active !== null && restoreFocus) {
        const id = `${uid}-trigger-${active}`
        window.setTimeout(
          () => document.getElementById(id)?.focus({ preventScroll: true }),
          0,
        )
      }
      setActive(null)
      updateHash(null)
    },
    [active, uid, updateHash],
  )

  const toggle = useCallback(
    (index: number) => {
      if (active === index) {
        closeActive()
        return
      }
      // Opening a pill outside the current spotlight resets the spotlight to
      // All, so the field never reads as half-muted around an open answer.
      if (filter !== 'All' && FAQ_ITEMS[index]?.track !== filter) {
        setFilter('All')
      }
      setActive(index)
      updateHash(index)
    },
    [active, closeActive, filter, updateHash],
  )

  // Escape collapses the open pill and puts focus back on its question.
  useEffect(() => {
    if (active === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeActive(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, closeActive])

  // Deep links and browser hash changes open the matching pill. The trigger is
  // centred rather than the whole card, so the answer expands into view below.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!id) return
      const index = indexOfId(id)
      if (index < 0) return
      setActive(index)
      window.setTimeout(() => {
        document.getElementById(`${uid}-trigger-${index}`)?.scrollIntoView({
          block: 'center',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'auto'
            : 'smooth',
        })
      }, 120)
    }
    const first = window.setTimeout(fromHash, 0)
    window.addEventListener('hashchange', fromHash)
    return () => {
      window.clearTimeout(first)
      window.removeEventListener('hashchange', fromHash)
    }
  }, [uid])

  const onFieldMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!finePointer) return
    pointerX.set(event.clientX)
    pointerY.set(event.clientY)
  }

  const onFieldLeave = () => {
    pointerX.set(Infinity)
    pointerY.set(Infinity)
  }

  const chooseFilter = (next: Filter) => {
    setFilter(next)
    if (
      active !== null &&
      next !== 'All' &&
      FAQ_ITEMS[active]?.track !== next
    ) {
      closeActive()
    }
  }

  const accent = accentFor(filter, active)
  const accentInk = accentInkFor(filter, active)
  const shape = shapeFor(filter, active)
  const activeFilter = metaFor(filter)
  const mutedCount =
    filter === 'All'
      ? 0
      : FAQ_ITEMS.filter((item) => item.track !== filter).length

  return (
    <section
      ref={reveal}
      className={styles.faq}
      data-reveal={still ? 'in' : revealState}
      data-open={active !== null}
      aria-labelledby={headingId}
      style={
        {
          '--accent': accent,
          '--accent-ink': accentInk,
        } as CSSProperties
      }
    >
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.wireframeLayer}>
        <ContactWireframe shape={shape} color={accent} />
      </div>

      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Open channel / FAQ index
          </p>
          <h2 id={headingId} className={styles.heading}>
            Pull a question out of the air.
          </h2>
        </div>
        <p className={styles.lede}>
          Nine questions, three orbits. Hover to feel the field, then open a
          pill in place.
        </p>
      </header>

      <div className={styles.filterRow}>
        <div className={styles.filterShell}>
          <div
            className={styles.filters}
            role="group"
            aria-label="Spotlight a question orbit"
          >
            {FILTERS.map((key) => {
              const meta = metaFor(key)
              const selected = filter === key
              return (
                <button
                  key={key}
                  type="button"
                  className={styles.filter}
                  data-active={selected}
                  aria-pressed={selected}
                  onClick={() => chooseFilter(key)}
                  style={
                    {
                      '--filter-accent': meta?.color ?? 'var(--ink)',
                      '--filter-ink': meta?.ink ?? 'var(--paper)',
                    } as CSSProperties
                  }
                >
                  <span className={styles.filterDot} aria-hidden="true" />
                  <span className={styles.filterLabel}>
                    {key === 'All' ? 'All' : meta?.label}
                  </span>
                  <span className={styles.filterCount} aria-hidden="true">
                    {String(countFor(key)).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <span className={styles.filterHint} aria-hidden="true">
          {filter === 'All'
            ? '03 orbits / 09 nodes'
            : `${activeFilter?.label ?? ''} ${activeFilter?.span ?? ''} — ${mutedCount} outside the orbit`}
        </span>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {filter === 'All'
          ? 'All nine questions are in view.'
          : `${activeFilter?.label} orbit in focus. ${mutedCount} questions recede.`}
      </p>

      <div
        className={styles.cluster}
        onPointerMove={onFieldMove}
        onPointerLeave={onFieldLeave}
      >
        {FAQ_ITEMS.map((item, index) => (
          <ContactNode
            key={item.id}
            item={item}
            index={index}
            pointerX={pointerX}
            pointerY={pointerY}
            active={active === index}
            muted={
              active !== index && filter !== 'All' && item.track !== filter
            }
            reduced={still}
            triggerId={`${uid}-trigger-${index}`}
            panelId={`${uid}-panel-${index}`}
            email={email}
            onToggle={toggle}
          />
        ))}
      </div>

      <MagneticCta email={email} enabled={finePointer} />

      <noscript>
        <style>{`.${styles.cluster},.${styles.filterRow},.${styles.wireframeLayer},.${styles.glow}{display:none}`}</style>
        <dl className={styles.plain}>
          {FAQ_ITEMS.map((item) => (
            <div key={item.id}>
              <dt>
                {TRACK_META[item.track].label} — {item.question}
              </dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </noscript>
    </section>
  )
}
