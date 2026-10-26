'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { setInterfaceVisibility } from '@/hooks/use-hide-interface'
import {
  ArrowUpRight,
  Bolt,
  Burst,
  Daisy,
  Heart,
  Smiley,
  Sparkle,
  Squiggle,
  Sun,
} from '@/features/landing-page/studio/doodles'
import { ScriptWord } from '@/features/landing-page/studio/script-word'
import { cn } from '@/lib/utils'

import {
  COLORS,
  CONTRAST_PAIRS,
  MOTION_TOKENS,
  RULES,
  SECTIONS,
  SYSTEM,
  TOKEN_CSS,
  TOKEN_JSON,
  TYPE_SCALE,
  TYPE_VOICES,
  VOICE_NOTES,
  VOICE_PAIRS,
  type ColorToken,
} from './sunnyside-data'
import styles from './sunnyside.module.css'

const SPANS = [
  'span4',
  'span4',
  'span4',
  'span4',
  'span3',
  'span5',
  'span5',
  'span3',
  'span4',
  'span3',
  'span3',
  'span3',
  'span3',
] as const

function useActiveSection() {
  const [active, setActive] = useState<string>('foundation')

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = 'foundation'
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= line) current = section.id
      }
      setActive((previous) => (previous === current ? previous : current))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return active
}

function CopyButton({
  text,
  label = 'Copy tokens',
  className,
  copiedLabel = 'Copied',
}: {
  text: string
  label?: string
  className?: string
  copiedLabel?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard can be unavailable; the value is still visible. */
    }
  }

  return (
    <button
      type="button"
      className={cn(styles.copyButton, className)}
      onClick={copy}
      aria-label={label}
    >
      {copied ? copiedLabel : label}
      <span className={styles.copyDot} aria-hidden />
      <span className={styles.srOnly} role="status">
        {copied ? `${label} copied` : ''}
      </span>
    </button>
  )
}

function DownloadButton({
  text,
  filename,
  label,
}: {
  text: string
  filename: string
  label: string
}) {
  const download = () => {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className={styles.textButton} onClick={download}>
      {label}
      <ArrowUpRight className="size-3.5" />
    </button>
  )
}

function Swatch({
  color,
  className,
}: {
  color: ColorToken
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* no clipboard, no drama */
    }
  }

  return (
    <button
      type="button"
      className={cn(
        styles.swatch,
        className,
        color.tone === 'light' ? styles.swatchLight : styles.swatchDark,
      )}
      style={{ background: color.hex }}
      onClick={copy}
      aria-label={`Copy ${color.name}, ${color.hex}`}
    >
      <span className={styles.swatchTop}>
        <span>{color.role}</span>
        <span className={styles.swatchCopy}>
          {copied ? 'Copied' : 'Copy hex'}
        </span>
      </span>
      <span className={styles.swatchName}>{color.name}</span>
      <span className={styles.swatchHex}>{copied ? color.hex : color.hex}</span>
      <span className={styles.swatchToken}>{color.token}</span>
      <span className={styles.swatchUse}>{color.use}</span>
    </button>
  )
}

function SectionHead({
  number,
  label,
  script,
  title,
  intro,
  onDark,
}: {
  number: string
  label: string
  script: string
  title: ReactNode
  intro: string
  onDark?: boolean
}) {
  return (
    <header className={styles.sectionHead}>
      <div className={cn(styles.headMeta, onDark && styles.onDarkMuted)}>
        <span className={styles.headNumber}>{number}</span>
        <span className={styles.headRule} aria-hidden />
        <span>{label}</span>
      </div>
      <div className={styles.headGrid}>
        <div>
          <ScriptWord
            text={script}
            className={cn(
              styles.headScript,
              onDark ? styles.headScriptDark : styles.headScriptLight,
            )}
          />
          <h2 className={cn(styles.headTitle, onDark && styles.onDarkInk)}>
            {title}
          </h2>
        </div>
        <p className={cn(styles.headIntro, onDark && styles.onDarkBody)}>
          {intro}
        </p>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="system-title">
      <div className={styles.heroHalo} aria-hidden />
      <div className={styles.heroDots} aria-hidden />
      <div className={styles.shell}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroMeta}>
              <span className={styles.pill}>
                <Sparkle className="size-2.5" />
                {SYSTEM.name} · {SYSTEM.version}
              </span>
              <span>Design system / {SYSTEM.year}</span>
            </div>

            <ScriptWord
              text="sunnyside"
              label={SYSTEM.name}
              className={styles.heroScript}
              delay={0.05}
            />

            <h1 id="system-title" className={styles.heroTitle}>
              Paper, cobalt and a little{' '}
              <span className={styles.heroNoise}>noise</span>.
            </h1>
            <p className={styles.heroLede}>
              The system behind <strong>Side A</strong>. One warm paper, one
              cobalt room, three type voices and a drawer of stickers. Built so
              the next page starts with a point of view instead of a blank file.
            </p>

            <div className={styles.heroActions}>
              <a href="#foundation" className={styles.primaryButton}>
                Start with the rules
                <ArrowUpRight className="size-4" />
              </a>
              <Link href="/" className={styles.ghostButton}>
                See it on Side A
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <ul className={styles.heroStats}>
              <li>
                <b>4</b>
                <span>type voices</span>
              </li>
              <li>
                <b>13</b>
                <span>colour tokens</span>
              </li>
              <li>
                <b>1</b>
                <span>marker hand</span>
              </li>
              <li>
                <b>0</b>
                <span>component dependencies</span>
              </li>
            </ul>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.stage}>
              <div className={styles.sheet}>
                <span className={cn(styles.tape, styles.tapeTop)} aria-hidden />
                <span
                  className={cn(styles.tape, styles.tapeBottom)}
                  aria-hidden
                />
                <div className={styles.sheetTop}>
                  <span>System sheet / 001</span>
                  <span>{SYSTEM.author}</span>
                </div>
                <Sun
                  className={styles.sheetSun}
                  title="A smiling sun, the Sunnyside mark"
                />
                <ScriptWord text="hello!" className={styles.sheetScript} />
                <p className={styles.sheetLine}>
                  For pages that feel like paper.
                </p>
                <div className={styles.sheetFoot}>
                  <span>paper · cobalt · a little noise</span>
                  <span className={styles.sheetSwatches} aria-hidden>
                    <i style={{ background: 'var(--cobalt)' }} />
                    <i style={{ background: 'var(--tangerine)' }} />
                    <i style={{ background: 'var(--butter)' }} />
                    <i style={{ background: 'var(--pink)' }} />
                  </span>
                </div>
              </div>
              <Smiley className={styles.stickerSmiley} title="Smiley sticker" />
              <Daisy className={styles.stickerDaisy} title="Daisy sticker" />
              <Burst
                text="hi!"
                className={styles.stickerBurst}
                title="Hi sticker"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const words = [
    'Sunnyside',
    'Side A',
    'Paper',
    'Cobalt',
    'Stickers',
    'A little noise',
  ]
  return (
    <div className={styles.marquee} aria-hidden>
      <div className={styles.marqueeTrack}>
        {[0, 1].map((group) => (
          <div className={styles.marqueeGroup} key={group}>
            {words.map((word) => (
              <span key={`${group}-${word}`} className={styles.marqueeWord}>
                {word}
                <Sparkle className="size-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Foundation() {
  const proportions = [
    { label: 'Paper', value: 55 },
    { label: 'Cobalt', value: 20 },
    { label: 'Ink', value: 15 },
    { label: 'Sticker', value: 10 },
  ]

  return (
    <section id="foundation" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="01"
          label="Foundation"
          script="the rules"
          title="Start with the point of view."
          intro="The landing page is a studio wall. Sunnyside is the set of decisions that keeps every new wall in the same building."
        />

        <div className={styles.foundationGrid}>
          <div className={styles.foundationLede}>
            <p className={styles.ledeBig}>
              A page is a printed sheet, not a screen with a white background.
            </p>
            <p>
              It has a warm ground, an edge that can be taped, one loud cobalt
              field that earns the interruption, and a few die-cut marks that
              can be moved without breaking the grid. The system is deliberately
              small: fewer choices, made more carefully.
            </p>
            <p>
              It is not a component library. There are no forty button variants
              and no dark mode to maintain. It is a palette, four voices, a
              12-column grid, a sticker drawer and a point of view.
            </p>

            <div className={styles.isGrid}>
              <div>
                <span className={styles.cardLabel}>It is</span>
                <ul className={styles.tickList}>
                  <li>Paper-first, with one loud field per page</li>
                  <li>A grid with deliberate offsets, not equal cards</li>
                  <li>Live, tactile components with real states</li>
                  <li>Motion that explains a change or gives an answer</li>
                </ul>
              </div>
              <div>
                <span className={styles.cardLabel}>It is not</span>
                <ul className={styles.crossList}>
                  <li>A gradient system</li>
                  <li>A dark-mode-first product kit</li>
                  <li>An icon soup</li>
                  <li>A sticker dump</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className={styles.recipeCard}>
            <div className={styles.recipeTop}>
              <span className={styles.cardLabel}>The page recipe</span>
              <span className={styles.recipeCode}>SS / 01</span>
            </div>
            <ol className={styles.recipeList}>
              <li>
                <span>01</span>
                <div>
                  <b>Ground</b>
                  <p>Paper. Let it be most of the page.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <b>Field</b>
                  <p>One cobalt room. Work, footer or boot.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <b>Mark</b>
                  <p>A number, a rule, a script note.</p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <b>Sticker</b>
                  <p>Four to six shapes. Never cover the type.</p>
                </div>
              </li>
            </ol>
            <div
              className={styles.proportion}
              aria-label="Suggested colour proportions"
            >
              {proportions.map((item) => (
                <span
                  key={item.label}
                  style={{ width: `${item.value}%` }}
                  data-label={item.label}
                  title={`${item.label} ${item.value}%`}
                />
              ))}
            </div>
            <p className={styles.recipeNote}>
              Starting proportions, not a law. A poster can lean on butter; a
              work section can lean on cobalt. Keep the page recognisable at
              arm’s length.
            </p>
          </aside>
        </div>

        <div className={styles.rules}>
          {RULES.map((rule) => (
            <div key={rule.number} className={styles.ruleRow}>
              <span className={styles.ruleNumber}>{rule.number}</span>
              <h3>{rule.title}</h3>
              <p>{rule.line}</p>
            </div>
          ))}
        </div>

        <div className={styles.nameNote}>
          <span className={styles.cardLabel}>Why “Sunnyside”</span>
          <p>
            Other names on the table were {SYSTEM.otherNames.join(', ')}.
            Sunnyside won because it holds the sun, the optimism and the idea of
            a side of a record without explaining itself. It sounds like a place
            you would want to work from, which is the whole point of the page.
          </p>
        </div>
      </div>
    </section>
  )
}

function Marks() {
  const stickers = [
    {
      key: 'sun',
      name: 'Sun',
      note: 'Welcome, stamp, chapter mark',
      node: <Sun className="w-full" />,
    },
    {
      key: 'smiley',
      name: 'Smiley',
      note: 'A friendly aside',
      node: <Smiley className="w-full" />,
    },
    {
      key: 'daisy',
      name: 'Daisy',
      note: 'A small celebration',
      node: <Daisy className="w-full" />,
    },
    {
      key: 'burst',
      name: 'Burst',
      note: 'A loud note, never a headline',
      node: <Burst text="hi!" className="w-full" />,
    },
    {
      key: 'heart',
      name: 'Heart',
      note: 'For the things worth keeping',
      node: <Heart className="w-full" />,
    },
    {
      key: 'bolt',
      name: 'Bolt',
      note: 'A little energy, used once',
      node: <Bolt className="w-full" />,
    },
  ]

  return (
    <section id="marks" className={cn(styles.section, styles.marks)}>
      <div className={styles.shell}>
        <SectionHead
          onDark
          number="02"
          label="Marks"
          script="the hand"
          title="A hand, a sun and a drawer of stickers."
          intro="The marks are drawn, not fetched. They share one white cut line and one flat fill, so a heart and a bolt feel like siblings."
        />

        <div className={styles.marksGrid}>
          <div className={styles.wordmarkCard}>
            <div className={styles.cardRail}>
              <span>Wordmark / 01</span>
              <span>drawn, not typeset</span>
            </div>
            <div className={styles.wordmarkStage}>
              <ScriptWord
                text="sunnyside"
                label="Sunnyside"
                className={styles.wordmarkLarge}
              />
              <span className={styles.clearSpace} aria-hidden />
            </div>
            <div className={styles.scaleRow}>
              <div>
                <ScriptWord text="sunnyside" className={styles.wordmarkMd} />
                <span>40</span>
              </div>
              <div>
                <ScriptWord text="sunnyside" className={styles.wordmarkSm} />
                <span>24</span>
              </div>
              <div>
                <ScriptWord text="sunnyside" className={styles.wordmarkXs} />
                <span>16</span>
              </div>
            </div>
            <p className={styles.cardNote}>
              Use the marker for the name, a section aside or a welcome. If it
              needs more than three words, it belongs in Geist.
            </p>
          </div>

          <div className={styles.sunCard}>
            <div className={styles.cardRail}>
              <span>The sun / 02</span>
              <span>always has a face</span>
            </div>
            <Sun className={styles.sunCardMark} title="The Sunnyside sun" />
            <p>
              A welcome, a stamp, a chapter mark. It should look like it was cut
              out and put there by a person, not placed by a layout engine.
            </p>
          </div>
        </div>

        <div className={styles.stickerDrawer}>
          {stickers.map((sticker) => (
            <div key={sticker.key} className={styles.stickerTile}>
              <div className={styles.stickerTileArt}>{sticker.node}</div>
              <div>
                <b>{sticker.name}</b>
                <span>{sticker.note}</span>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.marksNote}>
          One rule: stickers are punctuation. Never structure, never the only
          place a fact lives, never over type. Four to six per composition is
          plenty.
        </p>
      </div>
    </section>
  )
}

function Colour() {
  return (
    <section id="colour" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="03"
          label="Colour"
          script="warm, loud, calm"
          title="One paper, one loud field, four accents."
          intro="Warm neutrals carry the reading. Cobalt interrupts once. Tangerine, butter, pink and mint are marks, not surfaces."
        />

        <div className={styles.colorGrid}>
          {COLORS.map((color, index) => (
            <Swatch
              key={color.token}
              color={color}
              className={styles[SPANS[index]]}
            />
          ))}
        </div>

        <div className={styles.colorNotes}>
          <div className={styles.noteCard}>
            <span className={styles.cardLabel}>The one rule</span>
            <p>
              One cobalt field per view. If the work shelf is cobalt, the footer
              should not be a second cobalt shelf in the same screenful.
            </p>
          </div>
          <div className={styles.noteCard}>
            <span className={styles.cardLabel}>Accents are marks</span>
            <p>
              Tangerine, butter, pink and mint are for annotations, tape,
              stickers and single highlights. They are not body text and not
              large fields.
            </p>
          </div>
          <div className={styles.noteCard}>
            <span className={styles.cardLabel}>No gradients</span>
            <p>
              The sun rays and the print halftones are built from repeating
              shapes. No decorative linear gradients, no glow, no purple.
            </p>
          </div>
        </div>

        <div className={styles.contrastBlock}>
          <div className={styles.contrastHead}>
            <h3>Readable combinations</h3>
            <p>Checked against WCAG AA for normal text at 4.5:1.</p>
          </div>
          <div className={styles.contrastList}>
            {CONTRAST_PAIRS.map((pair) => (
              <div key={pair.text} className={styles.contrastRow}>
                <span
                  className={styles.contrastChip}
                  style={{ background: pair.fg, color: pair.bg }}
                >
                  Aa
                </span>
                <span className={styles.contrastName}>{pair.text}</span>
                <span className={styles.contrastRatio}>{pair.ratio}:1</span>
                <span
                  className={styles.contrastGrade}
                  data-grade={
                    pair.grade.includes('AAA')
                      ? 'pass'
                      : pair.grade.includes('AA')
                        ? 'pass'
                        : 'warn'
                  }
                >
                  {pair.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Type() {
  return (
    <section id="type" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="04"
          label="Type"
          script="say it clearly"
          title="Three voices and a felt-tip."
          intro="Syne gets the one line you want remembered. Geist does the reading. Geist Mono is the ruler. The marker is the human in the margin."
        />

        <div className={styles.voicesGrid}>
          <div className={cn(styles.voiceCard, styles.voiceDisplay)}>
            <div className={styles.cardRail}>
              <span>Display / Syne</span>
              <span>800</span>
            </div>
            <span className={styles.voiceAa} aria-hidden>
              Aa
            </span>
            <p className={styles.voiceSampleDisplay}>{TYPE_VOICES[0].sample}</p>
            <p className={styles.voiceNote}>{TYPE_VOICES[0].note}</p>
            <span className={styles.voiceSpec}>{TYPE_VOICES[0].spec}</span>
          </div>

          <div className={cn(styles.voiceCard, styles.voiceReading)}>
            <div className={styles.cardRail}>
              <span>Reading / Geist</span>
              <span>400 / 500</span>
            </div>
            <p className={styles.voiceSampleReading}>{TYPE_VOICES[1].sample}</p>
            <p className={styles.voiceNote}>{TYPE_VOICES[1].note}</p>
            <span className={styles.voiceSpec}>{TYPE_VOICES[1].spec}</span>
          </div>

          <div className={cn(styles.voiceCard, styles.voiceLabel)}>
            <div className={styles.cardRail}>
              <span>Label / Geist Mono</span>
              <span>500</span>
            </div>
            <p className={styles.voiceSampleLabel}>{TYPE_VOICES[2].sample}</p>
            <p className={styles.voiceNote}>{TYPE_VOICES[2].note}</p>
            <span className={styles.voiceSpec}>{TYPE_VOICES[2].spec}</span>
          </div>

          <div className={cn(styles.voiceCard, styles.voiceHand)}>
            <div className={styles.cardRail}>
              <span>Hand / the marker</span>
              <span>SVG</span>
            </div>
            <ScriptWord text="hello!" className={styles.voiceScript} />
            <p className={styles.voiceNote}>{TYPE_VOICES[3].note}</p>
            <span className={styles.voiceSpec}>{TYPE_VOICES[3].spec}</span>
          </div>
        </div>

        <div className={styles.typeScale}>
          <div className={styles.typeScaleHead}>
            <span className={styles.cardLabel}>Type scale</span>
            <span className={styles.typeScaleMeta}>
              desktop values · fluid in the browser
            </span>
          </div>
          <div
            className={styles.typeTable}
            role="table"
            aria-label="Sunnyside type scale"
          >
            <div className={styles.typeTableHead} role="row">
              <span role="columnheader">Token</span>
              <span role="columnheader">Size</span>
              <span role="columnheader">Line</span>
              <span role="columnheader">Tracking</span>
              <span role="columnheader">Face</span>
              <span role="columnheader">Use</span>
            </div>
            {TYPE_SCALE.map((row) => (
              <div className={styles.typeTableRow} role="row" key={row.token}>
                <span role="cell" className={styles.typeToken}>
                  {row.token}
                </span>
                <span role="cell">{row.size}</span>
                <span role="cell">{row.line}</span>
                <span role="cell">{row.tracking}</span>
                <span role="cell">{row.face}</span>
                <span role="cell" className={styles.typeUse}>
                  {row.use}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ul className={styles.typeRules}>
          <li>
            Sentence case for headings. The full stop is a design element, not a
            mistake.
          </li>
          <li>
            One display face per section. If everything whispers, nothing lands.
          </li>
          <li>
            Body copy stops at 68ch. Mono labels are a ruler, not a headline.
          </li>
        </ul>
      </div>
    </section>
  )
}

function Parts() {
  return (
    <section id="parts" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="05"
          label="Parts"
          script="the parts tray"
          title="Small pieces, loud assembly."
          intro="The components are a small tray of paper, buttons, chips and stickers. They are meant to be arranged, not cloned."
        />

        <div className={styles.partsGrid}>
          <div className={cn(styles.partCard, styles.span5)}>
            <div className={styles.cardRail}>
              <span>P-01 / Buttons</span>
              <span>press · hover · disabled</span>
            </div>
            <div className={styles.buttonLine}>
              <button type="button" className={styles.demoPrimary}>
                See the work <ArrowUpRight className="size-3.5" />
              </button>
              <button type="button" className={styles.demoCta}>
                Say hi
              </button>
            </div>
            <div className={styles.buttonLine}>
              <button type="button" className={styles.demoGhost}>
                Read the notes <ArrowUpRight className="size-3.5" />
              </button>
              <button type="button" className={styles.demoChip}>
                Selected work
              </button>
              <button type="button" className={styles.demoDisabled} disabled>
                Not yet
              </button>
            </div>
            <p className={styles.partNote}>
              Hard shadow, 1.5px border, press down 2px on active.
            </p>
          </div>

          <div className={cn(styles.partCard, styles.span7)}>
            <div className={styles.cardRail}>
              <span>P-02 / Release card</span>
              <span>16:10 · one frame</span>
            </div>
            <div className={styles.miniRelease}>
              <div className={styles.miniReleaseMedia}>
                <Image
                  src="/work/switchyard-cover.webp"
                  alt="Switchyard cover"
                  fill
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className={styles.miniReleaseBody}>
                <span className={styles.monoTiny}>
                  01 · developer tools · 2024
                </span>
                <b>Switchyard</b>
                <p>A control plane for coding agents.</p>
                <span className={styles.miniChips}>
                  <i>Go</i>
                  <i>SQLite</i>
                  <i>React</i>
                </span>
              </div>
            </div>
            <p className={styles.partNote}>
              Every release uses the same 16:10 crop, ready for an app
              screenshot.
            </p>
          </div>

          <div className={cn(styles.partCard, styles.span8)}>
            <div className={styles.cardRail}>
              <span>P-03 / Section marker</span>
              <span>number · label · hand</span>
            </div>
            <div className={styles.miniHead}>
              <span className={styles.miniHeadMeta}>03 / Selected work</span>
              <ScriptWord
                text="the good stuff"
                className={styles.miniHeadScript}
              />
              <h3>Work that shipped.</h3>
            </div>
          </div>

          <div className={cn(styles.partCard, styles.span4)}>
            <div className={styles.cardRail}>
              <span>P-04 / Stickers</span>
              <span>punctuation</span>
            </div>
            <div className={styles.miniStickerRow}>
              <Burst
                text="hi!"
                className={styles.miniSticker}
                title="Hi sticker"
              />
              <Smiley className={styles.miniSticker} title="Smiley sticker" />
              <Daisy className={styles.miniSticker} title="Daisy sticker" />
            </div>
            <p className={styles.partNote}>
              Die-cut white edge. Four to six per composition.
            </p>
          </div>

          <div className={cn(styles.partCard, styles.span5)}>
            <div className={styles.cardRail}>
              <span>P-05 / Postcard</span>
              <span>cobalt · airmail</span>
            </div>
            <div className={styles.miniPostcard}>
              <div className={styles.miniPostcardInner}>
                <span>Airmail / par avion</span>
                <Sun className={styles.miniPostcardSun} />
                <ScriptWord
                  text="say hi"
                  className={styles.miniPostcardScript}
                />
                <span className={styles.miniPostcardAddress}>
                  A team with a stubborn problem
                </span>
              </div>
            </div>
          </div>

          <div className={cn(styles.partCard, styles.span7)}>
            <div className={styles.cardRail}>
              <span>P-06 / Sign-off</span>
              <span>cobalt · shrink the footer</span>
            </div>
            <div className={styles.miniFooter}>
              <span className={styles.miniFooterTop}>
                End of side A · Jakarta
              </span>
              <ScriptWord text="aditya" className={styles.miniFooterWordmark} />
              <div className={styles.miniFooterStickers}>
                <Burst
                  text="hi!"
                  className={styles.miniFooterSticker}
                  title="Hi sticker"
                />
                <Smiley
                  className={styles.miniFooterSticker}
                  title="Smiley sticker"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StickerSlap() {
  const [slaps, setSlaps] = useState(0)

  return (
    <div className={styles.slapCard}>
      <div className={styles.cardRail}>
        <span>Live / sticker slap</span>
        <span>620ms · ease-slap</span>
      </div>
      <div className={styles.slapStage}>
        <span className={styles.slapGuide} aria-hidden />
        <span key={slaps} className={styles.slapSticker} data-run={slaps > 0}>
          <Burst text="hi!" className="w-full" title="Slap the sticker" />
        </span>
        <span
          key={`ring-${slaps}`}
          className={styles.slapRing}
          data-run={slaps > 0}
          aria-hidden
        />
      </div>
      <button
        type="button"
        className={styles.slapButton}
        onClick={() => setSlaps((n) => n + 1)}
      >
        {slaps > 0 ? 'Slap it again' : 'Slap the sticker'}
        <ArrowUpRight className="size-3.5" />
      </button>
      <p className={styles.partNote}>
        Scale .4 → 1.08 → 1, with a small tilt. Never from zero. No motion under
        reduced motion.
      </p>
    </div>
  )
}

function Motion() {
  return (
    <section id="motion" className={cn(styles.section, styles.motionSection)}>
      <div className={styles.shell}>
        <SectionHead
          onDark
          number="06"
          label="Motion"
          script="make it move"
          title="Motion earns its keep."
          intro="Every move explains a change, keeps a place, or answers back. If it does none of those, it is decoration and it can go."
        />

        <div className={styles.motionGrid}>
          <div className={styles.motionRules}>
            <div className={styles.motionRule}>
              <span>01</span>
              <div>
                <b>Start with the thing that changed.</b>
                <p>
                  Reveal on entry, spring on a drag, a quick press on a button.
                  Match the motion to the cause.
                </p>
              </div>
            </div>
            <div className={styles.motionRule}>
              <span>02</span>
              <div>
                <b>Fast where the user is deciding.</b>
                <p>
                  Press feedback 160ms. Hover 220ms. The big display entrance
                  can take 700ms; a button cannot.
                </p>
              </div>
            </div>
            <div className={styles.motionRule}>
              <span>03</span>
              <div>
                <b>Leave a way out.</b>
                <p>
                  Reduced motion gets the finished state with no travel. It is
                  the same page, not a lesser one.
                </p>
              </div>
            </div>

            <div className={styles.motionTable}>
              <div className={styles.motionTableHead}>
                <span>Token</span>
                <span>Value</span>
                <span>Ease</span>
                <span>Use</span>
              </div>
              {MOTION_TOKENS.map((motion) => (
                <div key={motion.token} className={styles.motionTableRow}>
                  <span className={styles.motionToken}>{motion.token}</span>
                  <span>{motion.value}</span>
                  <span>{motion.ease}</span>
                  <span>{motion.use}</span>
                </div>
              ))}
            </div>
          </div>

          <StickerSlap />
        </div>
      </div>
    </section>
  )
}

function Voice() {
  return (
    <section id="voice" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="07"
          label="Voice"
          script="say it plainly"
          title="Warm, specific, never precious."
          intro="Write like a person who has used the thing. The system can be loud; the copy should never make the reader work out what a button does."
        />

        <div className={styles.voiceGrid}>
          <div className={styles.voiceNotes}>
            <p className={styles.ledeBig}>
              A friend who has shipped something.
            </p>
            <ul>
              {VOICE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <div className={styles.voiceQuote}>
              “Funny is a garnish, not the meal.”
              <Squiggle className={styles.voiceSquiggle} />
            </div>
          </div>

          <div className={styles.voiceTable}>
            <div className={styles.voiceTableHead}>
              <span>Instead of</span>
              <span>Write</span>
            </div>
            {VOICE_PAIRS.map((pair) => (
              <div className={styles.voiceRow} key={pair.no}>
                <span className={styles.voiceNo}>{pair.no}</span>
                <span className={styles.voiceYes}>{pair.yes}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.microcopyGrid}>
          <div className={styles.microcopyCard}>
            <span className={styles.cardLabel}>Button</span>
            <b>See the work</b>
            <p>Verb first. No “explore” if there is a real destination.</p>
          </div>
          <div className={styles.microcopyCard}>
            <span className={styles.cardLabel}>Feedback</span>
            <b>Copied, talk soon.</b>
            <p>Confirm the thing that happened, then get out of the way.</p>
          </div>
          <div className={styles.microcopyCard}>
            <span className={styles.cardLabel}>Error</span>
            <b>The save didn’t go through. Try again.</b>
            <p>Plain, specific, and it tells the reader what to do next.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function AppFrame({
  label,
  title,
  note,
  href,
  children,
  className,
  onDark,
}: {
  label: string
  title: string
  note: string
  href: string
  children: ReactNode
  className?: string
  onDark?: boolean
}) {
  return (
    <div
      className={cn(styles.appFrame, className, onDark && styles.appFrameDark)}
    >
      <div className={styles.appChrome}>
        <span className={styles.appDots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <span className={styles.appOpen} aria-hidden>
          ↗
        </span>
      </div>
      <div className={styles.appBody} aria-hidden>
        {children}
      </div>
      <div className={styles.appCaption}>
        <div>
          <b>{title}</b>
          <span>{note}</span>
        </div>
        <a href={href}>
          Open <ArrowUpRight className="size-3" />
        </a>
      </div>
    </div>
  )
}

function Applications() {
  return (
    <section id="applications" className={styles.section}>
      <div className={styles.shell}>
        <SectionHead
          number="08"
          label="Applications"
          script="out in the wild"
          title="The system at work."
          intro="Five compositions from Side A. These are built from the same tokens, not screenshots; swap in a real capture when one is better."
        />

        <div className={styles.appsGrid}>
          <AppFrame
            label="00 / Boot"
            title="The first frame"
            note="A sticker sheet holds while the page arrives, then peels."
            href="/#home"
            className={styles.span4}
            onDark
          >
            <div className={styles.appBoot}>
              <span className={styles.appBootTop}>Side A · sound check</span>
              <Sun className={styles.appBootSun} />
              <ScriptWord text="hello!" className={styles.appBootScript} />
              <span className={styles.appBootProgress} />
            </div>
          </AppFrame>

          <AppFrame
            label="01 / Hero"
            title="The welcome"
            note="One loud statement, one sheet, one sun and a button that says where it goes."
            href="/#home"
            className={styles.span8}
          >
            <div className={styles.appHero}>
              <div className={styles.appNav}>
                <span>AH</span>
                <span>About · Work · Skills</span>
                <span>Say hi ↗</span>
              </div>
              <div className={styles.appHeroBody}>
                <div>
                  <span className={styles.monoTiny}>
                    Design engineer · Jakarta
                  </span>
                  <b>Interfaces with a pulse.</b>
                  <span className={styles.appMiniButton}>See the work ↗</span>
                </div>
                <div className={styles.appHeroSheet}>
                  <Sun className="w-full" />
                  <span>Open for work</span>
                </div>
              </div>
            </div>
          </AppFrame>

          <AppFrame
            label="03 / Work"
            title="The releases"
            note="Six releases, one 16:10 frame, a lead single and five deep cuts."
            href="/#work"
            className={styles.span7}
            onDark
          >
            <div className={styles.appWork}>
              <div className={styles.appWorkHead}>
                <span>03 / Selected work</span>
                <b>Work that shipped.</b>
              </div>
              <div className={styles.appWorkGrid}>
                {[
                  ['/work/switchyard-cover.webp', 'Switchyard'],
                  ['/work/primarindo-asia-cover.webp', 'Primarindo'],
                  ['/work/habit-tracker-cover.webp', 'Habit Tracker'],
                ].map(([src, name]) => (
                  <div className={styles.appWorkCard} key={name}>
                    <div className={styles.appWorkMedia}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </AppFrame>

          <AppFrame
            label="02 / Show & tell"
            title="The side desk"
            note="Four prints, dragged sideways, opened for the notes."
            href="/#showcase"
            className={styles.span5}
          >
            <div className={styles.appShow}>
              <div className={styles.appShowRow}>
                <span className={styles.appPrintSun}>
                  <i>SUN</i>
                  <b>CLUB</b>
                </span>
                <span className={styles.appPrintPeel}>
                  <Smiley className="w-full" />
                </span>
                <span className={styles.appPrintType}>Aa</span>
              </div>
              <span className={styles.appShowLabel}>
                04 studies · tap a print
              </span>
            </div>
          </AppFrame>

          <AppFrame
            label="06 / Sign-off"
            title="The end of side A"
            note="Cobalt panel, marker wordmark, dragged stickers and a copied email."
            href="/#contact"
            className={styles.span12}
            onDark
          >
            <div className={styles.appFooter}>
              <div className={styles.appFooterCols}>
                <span>
                  open to
                  <br />
                  <b>product teams</b>
                </span>
                <span>
                  based in
                  <br />
                  <b>Jakarta · GMT+7</b>
                </span>
                <span>
                  contact
                  <br />
                  <b>hello@aditya</b>
                </span>
              </div>
              <div className={styles.appFooterWord}>
                <ScriptWord text="aditya" className="w-full" />
                <Burst
                  text="hi!"
                  className={styles.appFooterSticker}
                  title="Hi sticker"
                />
              </div>
            </div>
          </AppFrame>
        </div>
      </div>
    </section>
  )
}

function Tokens() {
  return (
    <section id="tokens" className={cn(styles.section, styles.tokensSection)}>
      <div className={styles.shell}>
        <SectionHead
          onDark
          number="09"
          label="Tokens"
          script="the plumbing"
          title="Take the values, not the layout."
          intro="A small CSS block, a JSON file and a set of rules. No install, no provider, no component dependency."
        />

        <div className={styles.tokenLayers}>
          <div>
            <span className={styles.cardLabel}>1 / Primitive</span>
            <code>--cobalt: #3d53d6</code>
            <p>The raw value. Named for what it is.</p>
          </div>
          <span className={styles.tokenArrow} aria-hidden>
            →
          </span>
          <div>
            <span className={styles.cardLabel}>2 / Semantic</span>
            <code>--surface-loud: var(--cobalt)</code>
            <p>The job it does. Named for where it goes.</p>
          </div>
          <span className={styles.tokenArrow} aria-hidden>
            →
          </span>
          <div>
            <span className={styles.cardLabel}>3 / Component</span>
            <code>--button-bg: var(--surface-loud)</code>
            <p>The local decision. Named for what it dresses.</p>
          </div>
        </div>

        <div className={styles.tokensGrid}>
          <div className={styles.codeCard}>
            <div className={styles.codeTop}>
              <span>sunnyside.tokens.css</span>
              <span className={styles.codeDots} aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </div>
            <pre className={styles.codeBlock} aria-label="Sunnyside CSS tokens">
              <code>{TOKEN_CSS}</code>
            </pre>
            <div className={styles.codeActions}>
              <CopyButton
                text={TOKEN_CSS}
                label="Copy CSS"
                copiedLabel="Copied CSS"
                className={styles.codeCopy}
              />
              <DownloadButton
                text={JSON.stringify(TOKEN_JSON, null, 2)}
                filename="sunnyside.tokens.json"
                label="Download JSON"
              />
            </div>
          </div>

          <div className={styles.tokenNotes}>
            <div className={styles.noteCard}>
              <span className={styles.cardLabel}>Shape</span>
              <ul className={styles.shapeList}>
                <li>
                  <i className={styles.shapeXs} /> 4 · small marks
                </li>
                <li>
                  <i className={styles.shapeSm} /> 8 · tape and tags
                </li>
                <li>
                  <i className={styles.shapeMd} /> 14 · chips and media
                </li>
                <li>
                  <i className={styles.shapeLg} /> 20 · cards
                </li>
                <li>
                  <i className={styles.shapeXl} /> 28 · sheets and panels
                </li>
              </ul>
            </div>
            <div className={styles.noteCard}>
              <span className={styles.cardLabel}>Shadows</span>
              <div className={styles.shadowSamples}>
                <span className={styles.shadowPaper}>paper</span>
                <span className={styles.shadowLift}>lift</span>
              </div>
              <p className={styles.partNote}>
                Hard, warm and directional. Never a black blur.
              </p>
            </div>
            <div className={styles.noteCard}>
              <span className={styles.cardLabel}>The rule</span>
              <p>
                Change tokens at the top of the system, not inside a card. If a
                value only exists in one component, it is a detail, not a token.
              </p>
            </div>
            <div className={styles.noteCard}>
              <span className={styles.cardLabel}>Exports</span>
              <p>
                CSS for the browser. JSON for Figma, a design tool or a future
                build.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Endcap() {
  return (
    <footer className={styles.endcap}>
      <div className={styles.shell}>
        <div className={styles.endcapGrid}>
          <div>
            <ScriptWord text="thanks!" className={styles.endcapScript} />
            <h2>Put it to work.</h2>
            <p>
              Start with the paper, pick one loud field, and leave room for a
              sticker. The next page is already in the system.
            </p>
            <div className={styles.endcapActions}>
              <Link href="/" className={styles.primaryButton}>
                Back to Side A
                <ArrowUpRight className="size-4" />
              </Link>
              <a href={`mailto:${SYSTEM.email}`} className={styles.ghostButton}>
                Say hello
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
          <div className={styles.endcapArt} aria-hidden>
            <Sun className="w-full" />
            <Daisy className="w-full" />
            <Burst text="bye!" className="w-full" />
          </div>
        </div>
        <div className={styles.endcapFoot}>
          <span>
            {SYSTEM.name} {SYSTEM.version} · {SYSTEM.year} · {SYSTEM.author}
          </span>
          <span>Made on Side A · paper, cobalt, a little noise.</span>
        </div>
      </div>
    </footer>
  )
}

export function Sunnyside() {
  const active = useActiveSection()
  const contentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInterfaceVisibility('hidden')
    return () => setInterfaceVisibility('visible')
  }, [])

  useEffect(() => {
    const nav = contentsRef.current
    const link = nav?.querySelector<HTMLElement>('[data-active="true"]')
    if (!nav || !link) return
    const left = link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2
    nav.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [active])

  return (
    <div className={styles.page}>
      <a href="#foundation" className={styles.skipLink}>
        Skip to the system
      </a>

      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <a
            href="#top"
            className={styles.brand}
            aria-label={`${SYSTEM.name}, top`}
          >
            <span className={styles.brandSun}>
              <Sun className="size-full" />
            </span>
            <span className={styles.brandWords}>
              <b>{SYSTEM.name}</b>
              <span>design system · {SYSTEM.version}</span>
            </span>
          </a>
          <div className={styles.topActions}>
            <Link href="/" className={styles.backLink}>
              <span className={styles.backLinkLong}>Back to Side A</span>
              <span className={styles.backLinkShort}>Side A</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <CopyButton
              text={TOKEN_CSS}
              label="Copy tokens"
              copiedLabel="Copied"
            />
          </div>
        </div>
      </header>

      <nav className={styles.contents} aria-label="Sunnyside sections">
        <div className={styles.contentsInner} ref={contentsRef}>
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={styles.contentLink}
              data-active={active === section.id}
            >
              <span>{section.number}</span>
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        <Hero />
        <Marquee />
        <Foundation />
        <Marks />
        <Colour />
        <Type />
        <Parts />
        <Motion />
        <Voice />
        <Applications />
        <Tokens />
        <Endcap />
      </main>
    </div>
  )
}
