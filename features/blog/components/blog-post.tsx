'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { Check, Copy, BookOpen } from 'lucide-react'
import type { BlogMeta } from '../lib/blog'
import { BlogHeader } from './blog-header'
import { TableOfContents } from './table-of-contents'
import { RelatedPosts } from './related-posts'
import {
  formatRuntime,
  minutesFromReadingTime,
  waveformFromReadingTime,
} from '@/components/waveform-data'
import styles from '../blog.module.css'

const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false },
)

type PrismStyle = Record<string, React.CSSProperties>

/** Props react-markdown hands a `code` override; `inline` marks a span. */
type CodeBlockProps = {
  inline?: boolean
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentProps<'code'>, 'children'>

/** Code block as an LCD channel strip: language left, copy control right. */
function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className ?? '')
  const [copied, setCopied] = useState(false)
  const [style, setStyle] = useState<PrismStyle | null>(null)

  useEffect(() => {
    let active = true
    import('react-syntax-highlighter/dist/esm/styles/prism')
      .then((mod) => {
        if (active) setStyle((mod as { vscDarkPlus: PrismStyle }).vscDarkPlus)
      })
      .catch(() => {
        /* Highlighting is optional; the block still renders. */
      })
    return () => {
      active = false
    }
  }, [])

  if (inline || !match) {
    return <code {...props}>{children}</code>
  }

  const source = String(children).replace(/\n$/, '')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard permission denied — nothing to report to the reader. */
    }
  }

  return (
    <div className={styles.codeShell}>
      <div className={styles.codeHeader}>
        <span className={`${styles.codeLang} silkscreen`}>{match[1]}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.codeCopy}
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className={styles.codeBody}>
        {style ? (
          <SyntaxHighlighter
            {...(props as Record<string, unknown>)}
            style={style}
            language={match[1]}
            PreTag="div"
            customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
            codeTagProps={{ style: { fontFamily: 'inherit' } }}
          >
            {source}
          </SyntaxHighlighter>
        ) : (
          <pre style={{ margin: 0 }}>{source}</pre>
        )}
      </div>
    </div>
  )
}

export function BlogPost({
  meta,
  content,
  relatedPosts,
}: {
  meta: BlogMeta
  content: string
  relatedPosts?: BlogMeta[]
}) {
  const [paperMode, setPaperMode] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  const minutes = minutesFromReadingTime(meta.readingTime)
  const trace = waveformFromReadingTime(meta.readingTime)
  const percent = useTransform(progress, (value) => `${value * 100}%`)
  const [elapsedLabel, setElapsedLabel] = useState('0:00')

  useEffect(() => {
    return progress.on('change', (value) => {
      setElapsedLabel(formatRuntime(value * minutes))
    })
  }, [progress, minutes])

  return (
    <>
      {/* Reading progress as a transport scrub bar (design.md §3.2). */}
      <div className={styles.transport} aria-hidden="true">
        <div className={styles.transportTrack}>
          <div className={styles.transportBars}>
            {trace.map((height, index) => (
              <span key={index} style={{ ['--h' as string]: `${height}%` }} />
            ))}
            <motion.div
              className={styles.transportFill}
              style={{ width: percent }}
            >
              {trace.map((height, index) => (
                <span key={index} style={{ ['--h' as string]: `${height}%` }} />
              ))}
            </motion.div>
          </div>
          <motion.span
            className={styles.transportHead}
            style={{ left: percent }}
          />
        </div>
        <span className={styles.transportTime}>
          {elapsedLabel} / {formatRuntime(minutes)}
        </span>
      </div>

      <div className={styles.main}>
        <div className={styles.articleShell}>
          <article
            className={`${styles.article} ${paperMode ? styles.paper : ''}`}
          >
            <BlogHeader meta={meta} />

            <div className={styles.articleBody}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {relatedPosts && relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}
          </article>

          <TableOfContents content={content} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaperMode((prev) => !prev)}
        aria-pressed={paperMode}
        className={`${styles.togglePod} glass-1`}
      >
        <BookOpen size={15} aria-hidden="true" />
        <span className="silkscreen">Paper</span>
        <span
          className={`${styles.switch} ${paperMode ? styles.switchOn : ''}`}
        >
          <span className={styles.knob} />
        </span>
      </button>
    </>
  )
}
