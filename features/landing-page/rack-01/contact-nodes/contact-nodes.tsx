'use client'

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, useMotionValue } from 'motion/react'

import { EMAIL } from '../../constants'
import { FAQ_ITEMS } from '../contact-desk/contact-content'
import { useReveal } from '../contact-desk/use-reveal'
import { MagneticCta } from './contact-cta'
import { ContactDetail, type StageOrigin } from './contact-detail'
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

const DETAIL_ID = 'faq-detail'

/** The colour of a closing expansion that did not start from a node. */
function centreOrigin(): StageOrigin {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  return {
    top: cy - 34,
    bottom: cy - 34,
    left: cx - 120,
    right: cx - 120,
  }
}

/**
 * The Contact FAQ, rebuilt as a magnetic field.
 *
 * Nine questions are nodes on the warm architectural grid. The category
 * filters are spotlights on three orbits rather than tabs: they change the
 * wireframe and pull the matching nodes forward while the rest recede. The
 * pointer is read into two motion values, never React state, so a sweep across
 * the cluster costs no renders.
 *
 * Clicking a node expands it from its own rectangle into a full-viewport
 * editorial stage; the other eight compress into the orbital dock at the
 * bottom. The page behind the stage is made inert, the question and answer
 * cascade in word by word, and the whole thing is reachable by keyboard and
 * by `#question-hash`.
 */
export function ContactNodes({ email = EMAIL }: { email?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const headingId = `${uid}-heading`
  const [reveal, revealState] = useReveal<HTMLElement>(0.1)
  const [filter, setFilter] = useState<Filter>('All')
  const [active, setActive] = useState<number | null>(null)
  const [origin, setOrigin] = useState<StageOrigin | null>(null)
  const still = useMediaQuery('(prefers-reduced-motion: reduce)')
  const finePointer =
    useMediaQuery('(hover: hover) and (pointer: fine)') && !still

  const pointerX = useMotionValue(Infinity)
  const pointerY = useMotionValue(Infinity)

  const openNode = useCallback((index: number, node: HTMLElement) => {
    const box = node.getBoundingClientRect()
    setOrigin({
      top: box.top,
      right: window.innerWidth - box.right,
      bottom: window.innerHeight - box.bottom,
      left: box.left,
    })
    setActive(index)
    const item = FAQ_ITEMS[index]
    if (item) {
      history.replaceState(
        history.state,
        '',
        `${window.location.pathname}${window.location.search}#${item.id}`,
      )
    }
  }, [])

  const close = useCallback(() => {
    setActive(null)
    history.replaceState(
      history.state,
      '',
      `${window.location.pathname}${window.location.search}`,
    )
  }, [])

  const select = useCallback((index: number) => {
    setActive(index)
    const item = FAQ_ITEMS[index]
    if (item) {
      history.replaceState(
        history.state,
        '',
        `${window.location.pathname}${window.location.search}#${item.id}`,
      )
    }
  }, [])

  // Deep links and the browser's hash changes open the matching node. This is
  // the same contract the old launcher had: every question has a stable URL.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!id) return
      const index = indexOfId(id)
      if (index < 0) return
      setOrigin(centreOrigin())
      setActive(index)
    }
    // Defer the first read by a task: it lets the markup paint closed and
    // keeps the state write out of the effect body.
    const first = window.setTimeout(fromHash, 0)
    window.addEventListener('hashchange', fromHash)
    return () => {
      window.clearTimeout(first)
      window.removeEventListener('hashchange', fromHash)
    }
  }, [])

  const onFieldMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!finePointer) return
    pointerX.set(event.clientX)
    pointerY.set(event.clientY)
  }

  const onFieldLeave = () => {
    pointerX.set(Infinity)
    pointerY.set(Infinity)
  }

  const accent = accentFor(filter, active)
  const accentInk = accentInkFor(filter, active)
  const shape = shapeFor(filter, active)
  const activeItem = active === null ? null : FAQ_ITEMS[active]
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
        <ContactWireframe
          shape={shape}
          color={accent}
          paused={active !== null}
        />
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
          Nine questions, three orbits. Hover to feel the field, then choose a
          node to <strong>dock it</strong> and read the answer.
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
                  onClick={() => setFilter(key)}
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
        onBlur={onFieldLeave}
      >
        {FAQ_ITEMS.map((item, index) => (
          <ContactNode
            key={item.id}
            item={item}
            index={index}
            pointerX={pointerX}
            pointerY={pointerY}
            active={active === index}
            muted={filter !== 'All' && item.track !== filter}
            controlId={DETAIL_ID}
            onOpen={openNode}
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

      {activeItem && origin
        ? createPortal(
            <AnimatePresence>
              <ContactDetail
                key="faq-detail"
                item={activeItem}
                index={active ?? 0}
                origin={origin}
                onClose={close}
                onSelect={select}
                email={email}
              />
            </AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  )
}
