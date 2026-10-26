'use client'

import { useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Bolt, Burst, Daisy, Heart, Smiley, Sparkle, Sun } from './doodles'
import { Reveal } from './reveal'
import { SectionHead } from './section-head'
import { SHOWCASE_STUDIES, type ShowcaseStudy } from './studio-data'
import styles from './studio.module.css'

function SunClubPrint() {
  return (
    <div className={styles.printSun}>
      <div className={styles.printSunRays} aria-hidden />
      <div className={styles.printSunDisc} aria-hidden />
      <div className={styles.printSunTop}>
        <span>Sun Club / est. 2026</span>
        <span>No. 001</span>
      </div>
      <p className={styles.printSunTitle} aria-hidden>
        Sun
        <br />
        Club
      </p>
      <div className={styles.printSunFoot}>
        <span>Members only</span>
        <span className={styles.barcode} aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
    </div>
  )
}

function PeelPrint() {
  const stickers = [
    <Smiley key="smiley" className="w-[78%]" />,
    <Daisy key="daisy" className="w-[80%]" />,
    <Heart key="heart" className="w-[78%]" />,
    <Bolt key="bolt" className="w-[76%]" />,
    <Burst key="wow" text="wow" className="w-[92%]" />,
    <Burst key="hi" text="hi!" className="w-[92%]" />,
    <Sun key="sun" className="w-[86%]" />,
    <Sparkle key="spark" className="w-[52%] text-[var(--tangerine)]" />,
    <Smiley key="smiley2" className="w-[78%]" />,
  ]

  return (
    <div className={styles.printPeel}>
      <div className={styles.printPeelTop}>
        <b>Peel here</b>
        <span>9 die-cuts</span>
      </div>
      <div className={styles.peelGrid} aria-hidden>
        {stickers.map((sticker, index) => (
          <span key={index} className={styles.peelCell}>
            {sticker}
          </span>
        ))}
      </div>
      <p className={styles.peelCaption}>Drawn in code · cut, don&apos;t tear</p>
    </div>
  )
}

function TypePrint() {
  return (
    <div className={styles.printType}>
      <div className={styles.printTypeTop}>
        <span>Type tray / 2025</span>
        <span>3 voices</span>
      </div>
      <p className={styles.typeBig} aria-hidden>
        Aa
      </p>
      <div className={styles.typeRows}>
        <div className={styles.typeRow}>
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
            }}
          >
            Syne · display
          </span>
          <span>700 / 800</span>
        </div>
        <div className={styles.typeRow}>
          <span style={{ fontFamily: 'var(--font-geist), sans-serif' }}>
            Geist · reading
          </span>
          <span>400 / 500</span>
        </div>
        <div className={styles.typeRow}>
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            Geist Mono · labels
          </span>
          <span>500</span>
        </div>
      </div>
    </div>
  )
}

function SpringPrint() {
  return (
    <div className={styles.printSpring}>
      <div className={styles.printSpringTop}>
        <span>Spring study / 2025</span>
        <span>Same distance</span>
      </div>
      <svg className={styles.springSvg} viewBox="0 0 200 130" aria-hidden>
        <g className={styles.grid}>
          <path d="M10 20H190M10 65H190M10 110H190" />
          <path d="M10 14V116M60 14V116M110 14V116M160 14V116" />
        </g>
        <path className={styles.curveSoft} d="M10 110C70 110 130 20 190 20" />
        <path className={styles.curveSnap} d="M10 110C38 110 62 20 190 20" />
        <path className={styles.curveLoose} d="M10 110C105 110 94 -2 190 20" />
        <circle cx="190" cy="20" r="4" fill="var(--cobalt)" />
        <circle cx="190" cy="20" r="4" fill="var(--tangerine)" opacity=".5" />
      </svg>
      <div className={styles.printSpringFoot}>
        <span>soft</span>
        <span>snap</span>
        <span>loose</span>
      </div>
    </div>
  )
}

function StudyPrint({ id }: { id: string }) {
  switch (id) {
    case 'sun-club':
      return <SunClubPrint />
    case 'peel-here':
      return <PeelPrint />
    case 'type-tray':
      return <TypePrint />
    default:
      return <SpringPrint />
  }
}

const SWATCHES = [
  'var(--cobalt)',
  'var(--tangerine)',
  'var(--butter)',
  'var(--pink)',
  'var(--mint)',
]

export function Showcase() {
  const reduced = useReducedMotion() ?? false
  const trackRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const drag = useRef<{
    startX: number
    startLeft: number
    moved: boolean
    id: number
  } | null>(null)
  const moved = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [active, setActive] = useState<ShowcaseStudy | null>(null)
  const [progress, setProgress] = useState(0)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const p = max > 0 ? el.scrollLeft / max : 0
    setProgress(Math.max(0, Math.min(1, p)))
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (active && !dialog.open) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!active && dialog.open) {
      dialog.close()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [active])

  const step = () => {
    const el = trackRef.current
    const card = el?.querySelector<HTMLElement>('[data-study]')
    return (card?.offsetWidth ?? 320) + 22
  }

  const nudge = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * step(),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = trackRef.current
    if (!el) return
    drag.current = {
      startX: event.clientX,
      startLeft: el.scrollLeft,
      moved: false,
      id: event.pointerId,
    }
    // Capture only once the gesture becomes a drag. Capturing on pointerdown
    // takes the click away from the study button underneath it, which is how
    // the whole gallery ended up looking unclickable.
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const el = trackRef.current
    if (!state || !el || state.id !== event.pointerId) return
    const dx = event.clientX - state.startX
    if (!state.moved && Math.abs(dx) < 6) return
    if (!state.moved) {
      state.moved = true
      el.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    el.scrollLeft = state.startLeft - dx
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (state.moved) {
      moved.current = true
      window.setTimeout(() => {
        moved.current = false
      }, 0)
    }
  }

  return (
    <section
      id="showcase"
      className={`${styles.showcase} scroll-mt-24`}
      aria-labelledby="showcase-title"
    >
      <div className={styles.shell}>
        <SectionHead
          number="02"
          label="Show & tell"
          script="look at this"
          title={
            <span id="showcase-title">
              Small studies,
              <br />
              made after hours.
            </span>
          }
          intro="Posters, sticker sheets and motion sketches. Some became products. Most are just proof that an hour in the browser is never wasted."
        />

        <Reveal delay={0.08}>
          <div className={styles.showcaseTop}>
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase">
              {SHOWCASE_STUDIES.length} studies · 2025–26 · drag or scroll
            </p>
            <div className={styles.showcaseControls}>
              <button
                type="button"
                className={styles.showcaseBtn}
                onClick={() => nudge(-1)}
                disabled={edges.start}
                aria-label="Previous study"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.showcaseBtn}
                onClick={() => nudge(1)}
                disabled={edges.end}
                aria-label="Next study"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={trackRef}
        className={cn(
          styles.showcaseTrack,
          dragging && styles.showcaseTrackDragging,
        )}
        role="region"
        aria-label="Design studies. Scroll horizontally to see all four."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {SHOWCASE_STUDIES.map((study) => (
          <article key={study.id} className={styles.studyCard} data-study>
            <div className={styles.studyPrint} aria-hidden>
              <StudyPrint id={study.id} />
            </div>
            <div className={styles.studyMeta}>
              <div>
                <h3 className={styles.studyTitle}>{study.title}</h3>
                <span className={styles.studyTags}>
                  {study.tags.join(' · ')}
                </span>
              </div>
              <span className={styles.studyYear}>{study.year}</span>
            </div>
            <button
              type="button"
              className={styles.studyButton}
              onClick={() => {
                if (moved.current) return
                setActive(study)
              }}
              aria-label={`Open ${study.title}, ${study.year}. ${study.tags.join(', ')}.`}
            />
          </article>
        ))}
      </div>

      <div className={styles.shell}>
        <div className={styles.studyProgress} aria-hidden>
          <div
            className={styles.studyProgressBar}
            style={{ transform: `scaleX(${progress || 0.02})` }}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-6">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase">
            Tap a print for the notes
          </p>
          <p className="hidden font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase sm:block">
            {String(Math.round(progress * 100)).padStart(2, '0')}%
          </p>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="study-title"
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setActive(null)
        }}
      >
        {active ? (
          <div className={styles.dialogPanel}>
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setActive(null)}
              aria-label="Close study"
            >
              <X size={18} />
            </button>
            <div className={styles.dialogGrid}>
              <div className={styles.dialogPrint}>
                <StudyPrint id={active.id} />
              </div>
              <div className={styles.dialogNotes}>
                <p className={styles.dialogKicker}>
                  {active.year} · {active.tags.join(' / ')}
                </p>
                <h3 id="study-title" className={styles.dialogTitle}>
                  {active.title}
                </h3>
                <p className={styles.dialogBody}>{active.blurb}</p>
                <p className={styles.dialogNote}>
                  <b>Made with</b>
                  {active.madeWith}
                </p>
                <p className={styles.dialogNote}>
                  <b>The bit I like</b>
                  {active.favourite}
                </p>
                <div className={styles.dialogSwatches} aria-label="Palette">
                  {SWATCHES.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  )
}
