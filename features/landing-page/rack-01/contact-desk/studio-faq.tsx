'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  FAQ_TICKER,
  type FaqEntry,
} from './contact-content'
import styles from './contact-desk.module.css'
import {
  highlightRuns,
  itemIds,
  matches,
  nextFocus,
  snippet,
  toggled,
  wordsOf,
} from './faq-logic'
import { SlitTitle } from './slit-title'
import { useIntro } from './use-intro'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** How long the closing wipe takes before a row is put away. Matches the CSS. */
const WIPE_OUT_MS = 320

function Marked({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightRuns(text, query).map((run, index) =>
        run.hit ? (
          <mark key={index} className={styles.mark}>
            {run.text}
          </mark>
        ) : (
          <Fragment key={index}>{run.text}</Fragment>
        ),
      )}
    </>
  )
}

/** Nine bars that play while a row is open, a level meter for the track. */
function Wave() {
  return (
    <span className={styles.wave} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} style={{ '--b': i } as CSSProperties} />
      ))}
    </span>
  )
}

function Plus() {
  return (
    <span className={styles.cell} aria-hidden="true">
      <svg className={styles.plus} viewBox="0 0 32 32" fill="none">
        <path d="M16 1v30M1 16h30" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3 9h11M10 4.5 14.5 9 10 13.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The FAQ, as the last act of the Contact section: the studio's slit-type FAQ.
 *
 * ## What it does
 *
 * - The headline rises letter by letter through a hard slit as the band arrives,
 *   and a **playhead** sweeps the ruler beneath it once.
 * - A question is a ruled row, a *track*. Opening one **floods it with signal
 *   orange from the left, led by a bright playhead line**, and the question
 *   inverts exactly where the line has passed, because a dark copy of the row
 *   is clipped in step with the flood. The answer is printed in the dark, so the
 *   flood is what reveals it; its words settle in after the line. Closing wipes
 *   the orange out to the right, the line trailing the edge. The + becomes an ×.
 * - Moving over a closed row draws a scrub line that follows the pointer.
 * - Once the headline has landed, the first question opens by itself, so the
 *   band arrives mid-performance rather than as a bare list. If the visitor has
 *   touched anything by then, or came in on a `#hash`, it does not.
 *
 * ## What it keeps from a real FAQ
 *
 * Question buttons with `aria-expanded` and `aria-controls`; up, down, Home and
 * End between them; a `#hash` deep link per question and a copy-link button;
 * search with highlighted matches and an excerpt under each closed match;
 * topic chips with live counts; an empty state that offers the way out. The
 * moving line pauses on hover, on focus and on a button.
 *
 * ## Motion
 *
 * Reduced motion is a complete alternative, not a subtraction: the headline is
 * set whole, the first question is simply open, a row's state changes without a
 * wipe, and the moving line does not move.
 */
export function StudioFaq({
  items = FAQ_ITEMS,
  headline = 'Before you\npress record',
  ticker = FAQ_TICKER,
  email,
}: {
  items?: readonly FaqEntry[]
  headline?: string
  ticker?: readonly string[]
  email: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [band, intro] = useIntro<HTMLElement>(0.18)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const timers = useRef<Record<string, number>>({})
  const touched = useRef(false)

  const ids = useMemo(
    () =>
      itemIds(
        items.map((item) => item.question),
        [],
      ),
    [items],
  )
  const texts = useMemo(
    () => items.map((item) => `${item.question} ${item.answer}`),
    [items],
  )

  const [open, setOpen] = useState<string[]>([])
  const [closing, setClosing] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)

  const reduced = useCallback(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // A row that closes wipes its orange out before it is put away. The layout
  // effect lands the `closing` state before paint, so the flood never blinks.
  const previous = useRef<string[]>(open)
  const openKey = open.join('|')
  useIsoLayoutEffect(() => {
    const before = previous.current
    previous.current = open
    const added = open.filter((id) => !before.includes(id))
    const removed = before.filter((id) => !open.includes(id))
    if (added.length) {
      added.forEach((id) => window.clearTimeout(timers.current[id]))
      setClosing((current) => current.filter((id) => !added.includes(id)))
    }
    if (removed.length && !reduced()) {
      setClosing((current) => [
        ...current.filter((id) => !removed.includes(id)),
        ...removed,
      ])
      removed.forEach((id) => {
        window.clearTimeout(timers.current[id])
        timers.current[id] = window.setTimeout(
          () => setClosing((current) => current.filter((c) => c !== id)),
          WIPE_OUT_MS,
        )
      })
    }
  }, [openKey, reduced])

  useEffect(() => {
    const pending = timers.current
    return () => Object.values(pending).forEach((t) => window.clearTimeout(t))
  }, [])

  // A #hash that names a question opens it and brings it into view.
  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      const at = ids.indexOf(hash)
      if (at < 0) return
      touched.current = true
      setOpen([hash])
      window.setTimeout(
        () =>
          buttons.current[at]?.scrollIntoView({
            block: 'center',
            behavior: reduced() ? 'auto' : 'smooth',
          }),
        80,
      )
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [ids, reduced])

  // The band arrives mid-performance: once the headline has landed, open the
  // first question, unless the visitor has already done something.
  useEffect(() => {
    if (intro !== 'done') return
    const id = window.setTimeout(
      () => {
        if (touched.current) return
        setOpen((current) => (current.length ? current : [ids[0]]))
      },
      reduced() ? 0 : 900,
    )
    return () => window.clearTimeout(id)
  }, [intro, ids, reduced])

  const toggle = (id: string) => {
    touched.current = true
    setOpen((current) => toggled(current, id, true))
    if (typeof history !== 'undefined') {
      const own =
        decodeURIComponent(window.location.hash.replace(/^#/, '')) === id
      const isOpen = open.includes(id)
      if (!isOpen || own) {
        history.replaceState(
          history.state,
          '',
          `${window.location.pathname}${window.location.search}${isOpen ? '' : `#${id}`}`,
        )
      }
    }
  }

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* A browser that refuses the clipboard still has the hash in the address bar. */
    }
    setCopied(id)
    window.clearTimeout(timers.current.__copy)
    timers.current.__copy = window.setTimeout(() => setCopied(null), 1800)
  }

  const counts = useMemo(() => {
    const out: Record<string, number> = {}
    items.forEach((item, i) => {
      if (matches(texts[i], query))
        out[item.category] = (out[item.category] || 0) + 1
    })
    return out
  }, [items, texts, query])

  const total = texts.filter((text) => matches(text, query)).length
  const visible = items
    .map((item, i) => ({ item, i, id: ids[i] }))
    .filter(
      ({ item, i }) =>
        (!category || item.category === category) && matches(texts[i], query),
    )
  const filtering = query.trim() !== '' || category !== null

  const onKey = (event: KeyboardEvent, position: number) => {
    const to = nextFocus(event.key, position, visible.length)
    if (to < 0) return
    event.preventDefault()
    buttons.current[visible[to].i]?.focus()
  }

  // The scrub line: where the pointer is along a row, as a custom property on
  // that row only, so moving the pointer restyles one element.
  const scrub = (event: PointerEvent<HTMLLIElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty(
      '--mx',
      `${event.clientX - box.left}px`,
    )
  }

  return (
    <section
      ref={band}
      className={styles.faq}
      data-intro={intro}
      aria-labelledby={`${uid}-h`}
    >
      {/* Without a script nothing can open a row, so the answers would stay
          folded. This puts them all open, in the ink colour, and nowhere else. */}
      <noscript>
        <style>{`.${styles.panel}{grid-template-rows:1fr}.${styles.panelIn}{visibility:visible!important}.${styles.answer}{color:var(--k)}.${styles.tools}{display:none}`}</style>
      </noscript>
      <div className={styles.faqInner}>
        <div className={styles.kicker}>
          <span>
            <i aria-hidden="true" />
            FAQ
          </span>
          <span>{String(items.length).padStart(2, '0')} tracks</span>
        </div>

        <SlitTitle id={`${uid}-h`} text={headline} slit={0.42} />

        <div className={styles.ruler} aria-hidden="true">
          {['01', '02', '03', '04'].map((bar, i) => (
            <span key={bar} style={{ left: `${i * 25}%` }}>
              {bar}
            </span>
          ))}
          <div className={styles.sweep}>
            <i />
          </div>
        </div>

        {ticker.length ? (
          <div className={styles.ticker} data-paused={paused}>
            <p className={styles.srOnly}>{ticker.join('. ')}</p>
            <div className={styles.tickerMask} aria-hidden="true">
              <div className={styles.tickerTrack}>
                {[0, 1].map((copy) => (
                  <div className={styles.tickerRun} key={copy}>
                    {[...ticker, ...ticker].map((phrase, k) => (
                      <span key={k}>{phrase}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className={styles.tickerToggle}
              aria-label={
                paused ? 'Play the moving line' : 'Pause the moving line'
              }
              aria-pressed={paused}
              onClick={() => setPaused((v) => !v)}
            >
              {paused ? (
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3.5 2v10l8.5-5z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 2h3v10H3zM8 2h3v10H8z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        ) : null}

        <div className={styles.meta}>
          <p className={styles.intro}>
            What people ask before they write, answered straight. Pick a track
            to play it.
          </p>
          <div className={styles.search} role="search">
            <label htmlFor={`${uid}-q`}>Search the answers</label>
            <div className={styles.field}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m13 13 5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                id={`${uid}-q`}
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={query}
                placeholder="Try “backend”"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && query) {
                    event.preventDefault()
                    setQuery('')
                  }
                  if (event.key === 'ArrowDown' && visible.length) {
                    event.preventDefault()
                    buttons.current[visible[0].i]?.focus()
                  }
                }}
              />
              {query ? (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => setQuery('')}
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className={styles.count} aria-live="polite">
              {filtering ? `${visible.length} of ${items.length} tracks` : ''}
            </div>
          </div>
        </div>

        <ul className={styles.chips} aria-label="Filter by topic">
          <li>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              All <small>{total}</small>
            </button>
          </li>
          {FAQ_CATEGORIES.map((name) => (
            <li key={name}>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={category === name}
                onClick={() => setCategory(category === name ? null : name)}
              >
                {name} <small>{counts[name] || 0}</small>
              </button>
            </li>
          ))}
        </ul>

        {visible.length ? (
          <ul className={styles.list}>
            {visible.map(({ item, i, id }, position) => {
              const isOpen = open.includes(id)
              const state = isOpen
                ? 'open'
                : closing.includes(id)
                  ? 'closing'
                  : 'closed'
              const buttonId = `${uid}-b-${i}`
              const panelId = `${uid}-p-${i}`
              const excerpt =
                query.trim() && !isOpen ? snippet(item.answer, query) : ''
              const words = !query.trim() ? wordsOf(item.answer) : null
              const row = (inverted: boolean) => (
                <span
                  className={`${styles.row} ${inverted ? styles.rowInv : ''}`.trim()}
                  aria-hidden={inverted ? 'true' : undefined}
                >
                  <span className={styles.trk}>
                    TRK {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.label}>
                    <Marked text={item.question} query={query} />
                    {excerpt ? (
                      <span className={styles.snippet}>
                        <Marked text={excerpt} query={query} />
                      </span>
                    ) : null}
                  </span>
                  <Wave />
                  <Plus />
                </span>
              )
              return (
                <li
                  key={id}
                  id={id}
                  className={styles.item}
                  data-state={state}
                  onPointerMove={scrub}
                >
                  <span className={styles.fill} aria-hidden="true" />
                  <span className={styles.scan} aria-hidden="true" />
                  <h3 className={styles.h}>
                    <button
                      ref={(node) => {
                        buttons.current[i] = node
                      }}
                      id={buttonId}
                      type="button"
                      className={styles.btn}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(id)}
                      onKeyDown={(event) => onKey(event, position)}
                    >
                      {row(false)}
                      {row(true)}
                    </button>
                  </h3>
                  <div
                    className={styles.panel}
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                  >
                    <div className={styles.panelIn}>
                      <div className={styles.answer}>
                        <p className={styles.text}>
                          {words ? (
                            words.map((word, w) => (
                              <Fragment key={w}>
                                <span
                                  className={styles.w}
                                  style={{ '--w': w } as CSSProperties}
                                >
                                  {word}
                                </span>{' '}
                              </Fragment>
                            ))
                          ) : (
                            <Marked text={item.answer} query={query} />
                          )}
                        </p>
                        <div className={styles.tools}>
                          <span className={styles.tag}>{item.category}</span>
                          <button
                            type="button"
                            className={styles.copy}
                            onClick={() => copyLink(id)}
                          >
                            {copied === id ? 'Link copied' : 'Copy link'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className={styles.empty} role="status">
            <p>Nothing here matches “{query.trim() || category}”.</p>
            <button
              type="button"
              className={styles.copy}
              onClick={() => {
                setQuery('')
                setCategory(null)
              }}
            >
              Show every track
            </button>
          </div>
        )}

        <div className={styles.contact}>
          <p>Still have a question?</p>
          <a className={styles.cta} href={`mailto:${email}`}>
            <span>
              Email me <Arrow />
            </span>
            <span aria-hidden="true">
              Email me <Arrow />
            </span>
          </a>
        </div>
        <span className={styles.srOnly} aria-live="polite">
          {copied ? 'Link copied' : ''}
        </span>
      </div>
    </section>
  )
}
