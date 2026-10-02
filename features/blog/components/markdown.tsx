'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { Check, Copy } from 'lucide-react'
import styles from '../releases.module.css'

/* `PrismLight` and the named languages, not the `Prism` barrel.

   `import('react-syntax-highlighter')` resolves to the full build, which carries
   all ~297 Prism grammars — over 1MB of JS split across two of the largest
   chunks on the site, for markdown that uses nine languages.

   The grammar imports live INSIDE the dynamic loader, not at module scope:
   a top-level `void import(...)` would start nine fetches as soon as this
   module is evaluated, which is on every page that renders the shell — the
   grammars should arrive with the highlighter, and only on a page that has a
   code block. These are the complete set found in content/blog; `bash` covers
   `sh`/`shell` and `javascript` covers `js`. */
const SyntaxHighlighter = dynamic(
  async () => {
    const [
      { default: Prism },
      bash,
      powershell,
      yaml,
      promql,
      nginx,
      typescript,
      javascript,
      markup,
      css,
    ] = await Promise.all([
      import('react-syntax-highlighter/dist/esm/prism-light'),
      import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
      import('react-syntax-highlighter/dist/esm/languages/prism/powershell'),
      import('react-syntax-highlighter/dist/esm/languages/prism/yaml'),
      import('react-syntax-highlighter/dist/esm/languages/prism/promql'),
      import('react-syntax-highlighter/dist/esm/languages/prism/nginx'),
      import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
      import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
      import('react-syntax-highlighter/dist/esm/languages/prism/markup'),
      import('react-syntax-highlighter/dist/esm/languages/prism/css'),
    ])
    for (const lang of [
      bash,
      powershell,
      yaml,
      promql,
      nginx,
      typescript,
      javascript,
      markup,
      css,
    ]) {
      Prism.registerLanguage(lang.default.name, lang.default)
    }
    return Prism
  },
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

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
      {content}
    </ReactMarkdown>
  )
}
