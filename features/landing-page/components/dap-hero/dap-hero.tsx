'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { ArrowDownRight, Pause, SkipBack, SkipForward } from 'lucide-react'

import { TopBar } from '@/features/layout/components/top-bar'
import { RESUME_URL } from '../../rack-01/shared'
import {
  DAP_SCROLL_SVH,
  DAP_TRACK_SECONDS,
  formatTime,
} from './dap-choreography'
import {
  COVER,
  KEYS,
  LAYER_TAGS,
  SCREEN,
  TRACK,
  type LayerId,
} from './dap-content'
import { useDapHero } from './use-dap-hero'
import styles from './dap-hero.module.css'

/**
 * The hero: a digital audio player, taken apart by scrolling.
 *
 * It is built from DOM planes in CSS 3D rather than WebGL — the same approach
 * as the radio flip — so the first paint is the composed, assembled player
 * (it is the LCP, server-rendered, with no JS or canvas in the way), nothing
 * heavy ships, and the OLED is real, selectable, styleable markup.
 *
 * Six planes sit on one Z axis. At rest they are coplanar (a hair apart so the
 * browser sorts them) and read as one solid device; the scroll bridge writes
 * `--dap-explode` and the stylesheet slides each plane out by its own `--z`.
 * The OLED is the screen the page then falls into: it flips to the About
 * surface and a clip window opens from its rect to the whole stage, so the
 * next section arrives from inside the player.
 *
 * Everything is a pure function of scroll (see `dap-choreography.ts`), the
 * device and its tags are `aria-hidden` and decorative — the page's headline
 * and links are the `h1`, the cover copy and the keys, all real DOM.
 */

type Vars = Record<`--${string}`, string | number>
const vars = (v: Vars) => v as CSSProperties

const layerTag = (id: LayerId) => LAYER_TAGS.findIndex((t) => t.id === id)

function Tag({ id, side, y }: { id: LayerId; side: 'l' | 'r'; y: number }) {
  const index = layerTag(id)
  const tag = LAYER_TAGS[index]
  return (
    <span
      className={`${styles.tag} ${side === 'l' ? styles.tagL : styles.tagR}`}
      style={vars({ '--i': index, '--ty': y })}
    >
      <i />
      <span className={styles.tagText}>
        <small>
          {tag.n} / {tag.title}
        </small>
        <b>{tag.note}</b>
      </span>
    </span>
  )
}

export function DapHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const elapsedRef = useRef<HTMLSpanElement>(null)

  useDapHero({ sectionRef, stageRef, slotRef, elapsedRef })

  return (
    <section
      id="home"
      ref={sectionRef}
      className={styles.hero}
      data-rack-section
      data-dap-hero
      style={vars({ '--dap-scroll': DAP_SCROLL_SVH })}
    >
      <div
        ref={stageRef}
        className={styles.stage}
        data-portal="off"
        data-keys="on"
        style={vars({
          '--scr-x': SCREEN.x,
          '--scr-y': SCREEN.y,
          '--scr-w': SCREEN.w,
          '--scr-h': SCREEN.h,
          '--scr-r': SCREEN.r,
        })}
      >
        <TopBar />
        <div className={styles.room} aria-hidden="true" />
        <h1 className={styles.srOnly}>Aditya Himawan, Frontend Engineer</h1>

        <div className={styles.copy}>
          <p className={styles.kicker}>
            <i aria-hidden="true" />
            <span>{COVER.kicker}</span>
            <em>{COVER.place}</em>
          </p>
          <strong className={styles.line}>{COVER.line}</strong>
          <p className={styles.sub}>{COVER.sub}</p>
        </div>

        <div ref={slotRef} className={styles.slot}>
          <div className={styles.float}>
            <div className={styles.device} aria-hidden="true">
              {/* 05 — back plate: the inside of the case */}
              <div className={`${styles.layer} ${styles.back}`}>
                <div className={styles.face}>
                  <span className={styles.engrave}>AH-01</span>
                  <span className={styles.engraveSmall}>
                    Digital audio player · Rev 4
                    <br />
                    Assembled in Jakarta
                  </span>
                  <i className={`${styles.screw} ${styles.s1}`} />
                  <i className={`${styles.screw} ${styles.s2}`} />
                  <i className={`${styles.screw} ${styles.s3}`} />
                  <i className={`${styles.screw} ${styles.s4}`} />
                </div>
                <Tag id="back" side="r" y={0.86} />
              </div>

              {/* 04 — battery */}
              <div className={`${styles.layer} ${styles.battery}`}>
                <div className={styles.face}>
                  <span className={styles.cells} />
                  <span className={styles.batteryLabel}>
                    Li-Po 3.7V
                    <br />
                    <b>4000 mAh</b>
                  </span>
                </div>
                <Tag id="battery" side="l" y={0.7} />
              </div>

              {/* 03 — PCB: the signal path */}
              <div className={`${styles.layer} ${styles.pcb}`}>
                <div className={styles.face}>
                  <svg
                    className={styles.traces}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    focusable="false"
                  >
                    <path
                      className={styles.traceDim}
                      d="M6 14 H20 V30 H30 M42 36 H52 V54 H62 M74 54 H84 V74 H94 M10 90 H40 V80 M70 12 H88 V30 M12 60 H26 V70 H40"
                    />
                    <path
                      className={styles.traceLive}
                      pathLength={1}
                      d="M6 14 H20 V30 H30 M42 36 H52 V54 H62 M74 54 H84 V74 H94"
                    />
                  </svg>
                  <span className={`${styles.chip} ${styles.chipDac}`}>
                    DAC
                  </span>
                  <span className={`${styles.chip} ${styles.chipAmp}`}>
                    AMP
                  </span>
                  <span className={`${styles.chip} ${styles.chipSoc}`}>
                    SoC
                  </span>
                  <i className={`${styles.hole} ${styles.h1}`} />
                  <i className={`${styles.hole} ${styles.h2}`} />
                  <i className={`${styles.hole} ${styles.h3}`} />
                  <i className={`${styles.hole} ${styles.h4}`} />
                </div>
                <Tag id="pcb" side="r" y={0.5} />
              </div>

              {/* front plate: the opaque body around the screen */}
              <div className={`${styles.layer} ${styles.plate}`}>
                <div className={styles.face}>
                  <span className={styles.wheel}>
                    <i />
                  </span>
                  <span className={styles.plateMark}>AH-01</span>
                </div>
              </div>

              {/* 02 — OLED */}
              <div className={`${styles.layer} ${styles.oled}`}>
                <div className={`${styles.face} ${styles.oledFace}`}>
                  <div className={styles.oledUi}>
                    <div className={styles.status}>
                      <span>
                        <i /> DAP-01
                      </span>
                      <span>BT · 87%</span>
                    </div>
                    <div className={styles.art}>
                      <span className={styles.monogram}>AH</span>
                      <span className={styles.eq}>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                    <div className={styles.meta}>
                      <b>{TRACK.title}</b>
                      <span>{TRACK.artist}</span>
                    </div>
                    <div className={styles.progress}>
                      <span className={styles.bar}>
                        <i />
                      </span>
                      <span className={styles.times}>
                        <span ref={elapsedRef}>{formatTime(0)}</span>
                        <span>{formatTime(DAP_TRACK_SECONDS)}</span>
                      </span>
                    </div>
                    <div className={styles.transport}>
                      <SkipBack size="1em" strokeWidth={1.75} />
                      <span className={styles.playBtn}>
                        <Pause size="1em" strokeWidth={2} />
                      </span>
                      <SkipForward size="1em" strokeWidth={1.75} />
                    </div>
                    <div className={styles.next}>
                      <span>Up next</span>
                      <b>{TRACK.next}</b>
                    </div>
                  </div>
                </div>
                <Tag id="oled" side="l" y={0.3} />
              </div>

              {/* 01 — glass */}
              <div className={`${styles.layer} ${styles.glass}`}>
                <div className={styles.face} />
                <Tag id="glass" side="r" y={0.12} />
              </div>
            </div>
          </div>
          <span className={styles.floor} aria-hidden="true" />
        </div>

        <nav className={styles.keys} aria-label="Primary">
          {KEYS.map((key) => {
            const inner = (
              <>
                <i aria-hidden="true" />
                <span>{key.label}</span>
              </>
            )
            if (key.external) {
              return (
                <a
                  key={key.label}
                  href={RESUME_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.key}
                >
                  {inner}
                </a>
              )
            }
            return key.href.startsWith('#') ? (
              <a key={key.label} href={key.href} className={styles.key}>
                {inner}
              </a>
            ) : (
              <Link key={key.label} href={key.href} className={styles.key}>
                {inner}
              </Link>
            )
          })}
        </nav>

        <div className={styles.rail}>
          <span aria-hidden="true">Scroll to disassemble</span>
          <a href="#about">
            About Aditya <ArrowDownRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className={styles.portal} aria-hidden="true">
          <div className={styles.portalInner}>
            <span className={styles.portalLabel}>
              <small>Track 02</small>
              <b>Profile</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
