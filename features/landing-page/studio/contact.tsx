'use client'

import { useEffect, useState } from 'react'

import { ArrowUpRight, Sun } from './doodles'
import { Reveal } from './reveal'
import { ScriptWord } from './script-word'
import { SectionHead } from './section-head'
import { CONTACT, SOCIALS, WORK_NOTES } from './studio-data'
import styles from './studio.module.css'

export function Contact() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email)
      setCopied(true)
    } catch {
      window.location.href = CONTACT.href
    }
  }

  return (
    <section
      id="contact"
      className={`${styles.contact} scroll-mt-24`}
      aria-labelledby="contact-title"
    >
      <div className={styles.shell}>
        <SectionHead
          number="05"
          label="Contact"
          script="say hi"
          title={
            <span id="contact-title">
              Bring me
              <br />
              the <span className="text-[var(--cobalt)]">hard part.</span>
            </span>
          }
          intro="A design that won't survive data. A flow that feels slow. A front end that needs a second pair of hands. Start with the messy bit."
        />

        <div className={styles.contactGrid}>
          <div>
            <Reveal>
              <p className={styles.contactLead}>
                The interesting work is never the easy screen.
              </p>
              <p className={styles.contactBody}>
                I&apos;m open to product work, design-system builds and short
                rescues. Tell me what is stuck and what you have already tried.
                I read everything and usually reply within a day or two.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={styles.contactActions}>
                <a className={styles.contactEmail} href={CONTACT.href}>
                  Email me
                  <ArrowUpRight className="size-4" />
                </a>
                <button
                  type="button"
                  className={styles.copyButton}
                  data-copied={copied}
                  onClick={copy}
                >
                  {copied ? 'Copied, talk soon' : 'Copy the address'}
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {copied ? 'Email address copied to the clipboard' : ''}
                </span>
              </div>
              <p className={styles.contactNote}>
                {CONTACT.email} · no forms, no funnels
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <ul className={styles.contactList}>
                {WORK_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <div className={styles.socialRow}>
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    className={styles.socialLink}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.label}
                    <ArrowUpRight className="size-3" />
                  </a>
                ))}
                <a
                  className={styles.socialLink}
                  href={CONTACT.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Résumé (PDF)
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={34}>
            <div className={styles.postcardWrap}>
              <div className={styles.postcard}>
                <div className={styles.postcardInner}>
                  <div className={styles.postcardTop}>
                    <span>
                      Airmail · par avion
                      <br />
                      <b>Side A / 2026</b>
                    </span>
                    <span className="grid size-[4.6rem] place-items-center border border-dashed border-[var(--paper)]/50 p-2">
                      <Sun className="w-full" title="Sun stamp" />
                    </span>
                  </div>

                  <ScriptWord
                    text="say hi"
                    className={styles.postcardScript}
                    label="Say hi"
                  />

                  <p className={styles.postcardTo}>To</p>
                  <p className={styles.postcardName}>
                    A team with
                    <br />a stubborn problem
                  </p>
                  <div className={styles.postcardLines} aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className={styles.postcardFoot}>
                    <span>From: Aditya · Jakarta · GMT+7</span>
                    <span>{CONTACT.email}</span>
                  </div>

                  <span className={styles.postmark} aria-hidden>
                    Jakarta
                    <br />
                    26 · X
                    <br />
                    design engineer
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
