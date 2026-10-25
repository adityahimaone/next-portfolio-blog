'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Download, Mail, Plus, Minus } from 'lucide-react'

import type { ArchiveRepo } from '@/features/projects/lib/github'
import { ABOUT_TRACKS } from '../rack-01/about-copy'
import {
  CONTACT_EMAIL,
  FACTS,
  FOOTER_NOTE,
  PRACTICE,
  RECORD,
  RELEASES,
  SOCIAL_LINKS,
} from './studio-data'
import styles from './studio.module.css'

const TICK_COUNT = 16

function SectionHead({
  index,
  label,
  title,
  lede,
}: {
  index: string
  label: string
  title: string
  lede?: string
}) {
  return (
    <header className={styles.sectionHead} data-reveal>
      <p className={styles.sectionLabel}>
        <span>{index}</span>
        <span>{label}</span>
        <i aria-hidden="true" data-section-hair />
      </p>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {lede ? <p className={styles.sectionLede}>{lede}</p> : null}
    </header>
  )
}

function Meter({ level, name }: { level: number; name: string }) {
  const lit = Math.round((level / 100) * TICK_COUNT)
  return (
    <span
      className={styles.meter}
      role="img"
      aria-label={`${name}: ${level} percent`}
    >
      {Array.from({ length: TICK_COUNT }, (_, index) => (
        <i key={index} data-on={index < lit} />
      ))}
    </span>
  )
}

export function About() {
  const [track, setTrack] = useState(0)
  const active = ABOUT_TRACKS[track]

  return (
    <section id="index" className={styles.section} data-section>
      <SectionHead
        index="01"
        label="Index"
        title="Start with the moment someone uses it."
      />

      <div className={styles.aboutGrid}>
        <figure className={styles.portrait} data-reveal>
          <div className={styles.portraitFrame}>
            <Image
              src="/memoji-1.png"
              alt="Aditya Himawan, illustrated portrait"
              width={520}
              height={520}
              sizes="(max-width: 760px) 42vw, 280px"
            />
          </div>
          <figcaption>
            <span>Aditya Himawan</span>
            <span>Jakarta / GMT+7</span>
          </figcaption>
        </figure>

        <div className={styles.aboutCopy} data-reveal>
          <p className={styles.aboutLede}>{active.story}</p>
          <p>{ABOUT_TRACKS[1].story}</p>

          <div className={styles.aboutTracks} aria-label="About">
            {ABOUT_TRACKS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-pressed={index === track}
                className={styles.aboutTrack}
                onClick={() => setTrack(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </button>
            ))}
          </div>

          <dl className={styles.facts}>
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className={styles.aboutAside}>
        {ABOUT_TRACKS[2].aside}
        <a
          href={ABOUT_TRACKS[2].resumeLink ?? '/resume.pdf'}
          className={styles.textLink}
        >
          Read the full CV
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </p>
    </section>
  )
}

export function Practice() {
  const [active, setActive] = useState(0)
  const group = PRACTICE[active]
  const average =
    group.channels.reduce((total, channel) => total + channel.level, 0) /
    group.channels.length

  return (
    <section id="practice" className={styles.section} data-section>
      <SectionHead
        index="02"
        label="Practice"
        title="Three channels. One signal."
        lede="The stack is the instrument. Every level below is a channel on it, not a badge."
      />

      <div className={styles.console}>
        <div className={styles.consoleReadout} aria-live="polite">
          <span>Input {String(active + 1).padStart(2, '0')}</span>
          <strong>{group.label}</strong>
          <span>{group.channels.length} channels</span>
          <span>{average.toFixed(0)} avg</span>
        </div>

        <div className={styles.consoleStrips}>
          {PRACTICE.map((item, index) => {
            const total = item.channels.reduce(
              (sum, channel) => sum + channel.level,
              0,
            )
            const avg = total / item.channels.length
            return (
              <article
                key={item.id}
                className={styles.channelStrip}
                data-active={index === active}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <button
                  type="button"
                  className={styles.channelHead}
                  onClick={() => setActive(index)}
                  aria-pressed={index === active}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <small>{item.type}</small>
                  <b>{avg.toFixed(0)}</b>
                </button>

                <ul className={styles.channelList}>
                  {item.channels.map((channel) => (
                    <li key={channel.name}>
                      <span>{channel.name}</span>
                      <Meter level={channel.level} name={channel.name} />
                      <b>{channel.level}</b>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Record() {
  const [open, setOpen] = useState<string>(RECORD[0]?.id ?? '')

  return (
    <section id="record" className={styles.section} data-section>
      <SectionHead
        index="03"
        label="Record"
        title="What shipped, and where."
        lede="Four entries. The notes are the work, not a job description."
      />

      <ol className={styles.recordList}>
        {RECORD.map((entry, index) => {
          const expanded = open === entry.id
          return (
            <li
              key={entry.id}
              className={styles.recordRow}
              data-open={expanded}
              data-reveal
            >
              <button
                type="button"
                className={styles.recordButton}
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? '' : entry.id)}
              >
                <span className={styles.recordIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.recordPeriod}>{entry.period}</span>
                <span className={styles.recordRole}>
                  <strong>{entry.role}</strong>
                  <small>
                    {entry.company} / {entry.location}
                  </small>
                </span>
                <span className={styles.recordToggle} aria-hidden="true">
                  {expanded ? (
                    <Minus size={16} strokeWidth={1.5} />
                  ) : (
                    <Plus size={16} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              <div className={styles.recordNotes} hidden={!expanded}>
                <ul>
                  {entry.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>

      <a
        href={SOCIAL_LINKS.find((link) => link.label === 'Resume')?.href}
        className={styles.cvButton}
      >
        <Download size={15} strokeWidth={1.5} aria-hidden="true" />
        Download the CV
      </a>
    </section>
  )
}

export function Work({
  archiveRepos,
}: {
  archiveRepos: readonly ArchiveRepo[]
}) {
  const [active, setActive] = useState(0)
  const release = RELEASES[active] ?? RELEASES[0]

  return (
    <section id="work" className={styles.section} data-section>
      <SectionHead
        index="04"
        label="Selected work"
        title="Six releases, one practice."
        lede="Hover a record to open its sleeve. Every link leaves for the real thing."
      />

      <div className={styles.workGrid}>
        <ol className={styles.releaseList}>
          {RELEASES.map((item, index) => (
            <li key={item.slug} data-reveal>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.releaseRow}
                data-active={index === active}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span className={styles.releaseIndex}>
                  {String(item.index).padStart(2, '0')}
                </span>
                <span className={styles.releaseTitle}>{item.title}</span>
                <span className={styles.releaseMeta}>
                  {item.genre}
                  <i aria-hidden="true" />
                  {item.year}
                </span>
                <ArrowUpRight
                  size={17}
                  strokeWidth={1.4}
                  aria-hidden="true"
                  className={styles.releaseArrow}
                />
              </a>
            </li>
          ))}
        </ol>

        <aside className={styles.releasePreview} aria-live="polite">
          <div
            className={styles.sleeve}
            style={
              {
                '--sleeve-accent': release.accent,
                '--sleeve-wash': release.wash,
              } as React.CSSProperties
            }
          >
            {release.cover ? (
              <Image
                src={release.cover}
                alt=""
                width={640}
                height={640}
                sizes="(max-width: 1080px) 90vw, 360px"
                className={styles.sleeveImage}
              />
            ) : (
              <div className={styles.sleeveGenerated} aria-hidden="true">
                <span>{String(release.index).padStart(2, '0')}</span>
                <i />
              </div>
            )}
            <div className={styles.sleeveLabel}>
              <span>AH / {String(release.index).padStart(2, '0')}</span>
              <span>{release.year}</span>
            </div>
          </div>

          <div className={styles.releaseCopy}>
            <p className={styles.releaseGenre}>
              {release.genre} / {release.role}
            </p>
            <h3>{release.title}</h3>
            <p>{release.description}</p>
            <ul className={styles.stackList}>
              {release.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className={styles.workFoot}>
        <Link href="/projects" className={styles.textLink}>
          The full catalogue
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <span>{archiveRepos.length} repositories in the live archive</span>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className={styles.section} data-section>
      <SectionHead
        index="05"
        label="Contact"
        title="Have a signal to send?"
        lede="Frontend, design engineering, and hard interface work. I read everything."
      />

      <div className={styles.contactGrid}>
        <a className={styles.contactMail} href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={22} strokeWidth={1.3} aria-hidden="true" />
          <span>{CONTACT_EMAIL}</span>
          <ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" />
        </a>

        <ul className={styles.contactLinks}>
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
                <span>{link.label}</span>
                <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.footer}>
        <span>Aditya Himawan / Frontend engineer / Jakarta</span>
        <span>{FOOTER_NOTE}</span>
        <span>2026</span>
      </footer>
    </section>
  )
}
