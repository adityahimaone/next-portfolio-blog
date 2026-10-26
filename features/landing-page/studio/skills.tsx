'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { Atom } from './doodles'
import { Reveal } from './reveal'
import { SectionHead, SectionNext } from './section-head'
import { SKILL_GROUPS } from './studio-data'
import styles from './studio.module.css'

const CURVES = [
  {
    label: 'soft',
    curve: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
    dur: '700ms',
    color: 'var(--ink)',
  },
  {
    label: 'snap',
    curve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    dur: '260ms',
    color: 'var(--cobalt)',
  },
  {
    label: 'loose',
    curve: 'cubic-bezier(0.3, 2.1, 0.5, 1)',
    dur: '1100ms',
    color: 'var(--tangerine)',
  },
] as const

export function Skills() {
  const [run, setRun] = useState(0)
  const build = SKILL_GROUPS.find((group) => group.id === 'build')!
  const motionGroup = SKILL_GROUPS.find((group) => group.id === 'motion')!
  const systems = SKILL_GROUPS.find((group) => group.id === 'systems')!
  const also = SKILL_GROUPS.find((group) => group.id === 'also')!

  return (
    <section
      id="skills"
      className={`${styles.skills} scroll-mt-24`}
      aria-labelledby="skills-title"
    >
      <div className={styles.skillsGlow} aria-hidden />
      <div className={styles.shell}>
        <SectionHead
          number="04"
          label="Skills"
          script="in the bag"
          title={
            <span id="skills-title">
              What I
              <br />
              reach for.
            </span>
          }
          intro="A toolbox, not a scoreboard. The split below is honest about what pays the rent, what I sweat, and what keeps either from falling over."
        />

        <div className={styles.skillsGrid}>
          <Reveal className={styles.cellBuild} y={24}>
            <div className={cn(styles.skillCard, styles.skillBuild)}>
              <div className={styles.skillTop}>
                <span>{build.eyebrow}</span>
                <span>01 / 04</span>
              </div>
              <h3 className={styles.skillTitle}>{build.title}</h3>
              <p className={styles.skillLine}>{build.line}</p>
              <ul className={styles.skillChips}>
                {build.skills.map((skill) => (
                  <li key={skill} className={styles.chip}>
                    {skill}
                  </li>
                ))}
              </ul>
              <Atom className={styles.skillAtom} />
            </div>
          </Reveal>

          <Reveal className={styles.cellMotion} delay={0.06} y={24}>
            <div className={cn(styles.skillCard, styles.skillMotion)}>
              <div className={styles.skillTop}>
                <span>{motionGroup.eyebrow}</span>
                <span>02 / 04</span>
              </div>
              <h3 className={styles.skillTitle}>{motionGroup.title}</h3>
              <p className={styles.skillLine}>{motionGroup.line}</p>

              <div className={cn(styles.springDemo, run > 0 && styles.run)}>
                {CURVES.map((curve) => (
                  <div key={curve.label} className={styles.springRow}>
                    <span className={styles.springLabel}>{curve.label}</span>
                    <span className={styles.springTrack}>
                      <span
                        key={`${curve.label}-${run}`}
                        className={styles.springBall}
                        style={
                          {
                            '--curve': curve.curve,
                            '--dur': curve.dur,
                            '--card-color': curve.color,
                          } as React.CSSProperties
                        }
                      />
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.springReplay}
                  onClick={() => setRun((value) => value + 1)}
                  aria-label="Replay the three easing curves"
                >
                  {run > 0 ? 'Play again' : 'Play the curves'}{' '}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal className={styles.cellSystems} delay={0.08} y={24}>
            <div className={cn(styles.skillCard, styles.skillSystems)}>
              <div className={styles.skillTop}>
                <span>{systems.eyebrow}</span>
                <span>03 / 04</span>
              </div>
              <h3 className={styles.skillTitle}>{systems.title}</h3>
              <p className={styles.skillLine}>{systems.line}</p>
              <div className={styles.systemDemo}>
                <button type="button" className={styles.stateButton}>
                  Hover me
                </button>
                <button type="button" className={styles.stateButton}>
                  Press me
                </button>
                <span className={styles.stateCode}>
                  hover · focus · active · disabled
                </span>
              </div>
              <ul className={styles.skillChips}>
                {systems.skills.map((skill) => (
                  <li key={skill} className={styles.chip}>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className={styles.cellAlso} delay={0.1} y={24}>
            <div className={cn(styles.skillCard, styles.skillAlso)}>
              <div className={styles.skillTop}>
                <span>{also.eyebrow}</span>
                <span>04 / 04</span>
              </div>
              <h3 className={styles.skillTitle}>{also.title}</h3>
              <p className={styles.skillLine}>{also.line}</p>
              <div className={styles.alsoCloud}>
                {also.skills.map((skill) => (
                  <span key={skill} className={styles.alsoChip}>
                    {skill}
                  </span>
                ))}
              </div>
              <ul className={styles.skillChips}>
                <li className={styles.chip}>
                  currently poking: view transitions
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        <div className={styles.skillNote}>
          <span>No percentages. Just what I reach for.</span>
          <span>Last audited · October 2026</span>
        </div>

        <SectionNext href="contact" label="Contact" note="the last page" />
      </div>
    </section>
  )
}
