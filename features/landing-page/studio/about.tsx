'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import { Squiggle } from './doodles'
import { Reveal } from './reveal'
import { SectionHead, SectionNext } from './section-head'
import { ABOUT_FACTS, PRINCIPLES } from './studio-data'
import styles from './studio.module.css'

export function About() {
  return (
    <section
      id="about"
      className={`${styles.about} scroll-mt-24`}
      aria-labelledby="about-title"
    >
      <div className={styles.shell}>
        <SectionHead
          number="01"
          label="About"
          script="hello!"
          title={
            <span id="about-title">
              I make the interface
              <br />
              <span className="text-[var(--cobalt)]">
                and the thing behind it.
              </span>
            </span>
          }
          intro="Four years of product work, one habit: decide in the browser, then leave enough structure that the next person can disagree with me."
        />

        <div className={styles.aboutGrid}>
          <div>
            <Reveal>
              <p className={styles.aboutBody}>
                I&apos;m Aditya Himawan, a design engineer based in Jakarta. For
                four years I&apos;ve built product interfaces for teams in
                manufacturing, developer tools and finance, usually the part
                where a design has to survive{' '}
                <strong>real data, real browsers and a real deadline.</strong>
              </p>
              <p className={styles.aboutBody}>
                I sit between design and engineering. I prototype in the
                browser, build the system, and keep the motion honest. The
                handoff is a pull request, not a promise.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <dl className={styles.aboutFacts}>
                {ABOUT_FACTS.map((fact) => (
                  <div key={fact.key} className={styles.aboutFact}>
                    <dt>{fact.key}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-[46ch] font-[family-name:var(--font-syne)] text-[clamp(1.05rem,1.8vw,1.35rem)] leading-[1.3] font-semibold tracking-[-0.025em]">
                The detail is the interface.
                <Squiggle className="mt-1 h-2.5 w-40 text-[var(--tangerine)]" />
              </p>
            </Reveal>
          </div>

          <div className={styles.aboutSide}>
            <Reveal delay={0.06} y={32}>
              <div className={styles.photoCard}>
                <span
                  className={cn(
                    styles.tape,
                    'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3',
                  )}
                  aria-hidden
                />
                <div className={styles.photoFrame}>
                  <Image
                    src="/memoji-1.png"
                    alt="Aditya's memoji, half hidden behind a laptop"
                    width={420}
                    height={420}
                    sizes="(min-width: 1024px) 22rem, 80vw"
                    priority={false}
                  />
                </div>
                <div className={styles.photoCaption}>
                  <span>
                    <b>that&apos;s me</b>
                    <br />
                    probably debugging
                  </span>
                  <span>JKT / 2026</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.14} y={32}>
              <div className={styles.nowCard}>
                <b>Now</b>
                Latest release: <strong>Habit Tracker</strong>, a streak that
                survives a missed day.
                <br />
                Next: more small tools, fewer dashboards.
              </div>
            </Reveal>
          </div>
        </div>

        <div className={styles.principles}>
          {PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.number} delay={index * 0.06} y={18}>
              <div className={styles.principle}>
                <span className={styles.principleNumber}>
                  {principle.number}
                </span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleLine}>{principle.line}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <SectionNext href="showcase" label="Show & tell" note="the wall" />
      </div>
    </section>
  )
}
