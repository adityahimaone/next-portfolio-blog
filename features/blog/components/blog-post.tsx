'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import type { BlogMeta } from '../lib/blog'
import { BlogHeader } from './blog-header'
import { TableOfContents } from './table-of-contents'
import { RelatedPosts } from './related-posts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { Check, Copy, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import for react-syntax-highlighter with ssr: false to reduce initial bundle size
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="relative my-6 overflow-hidden rounded-lg border border-white/20 bg-zinc-950 shadow-xl dark:border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 px-4 py-2">
          <span className="font-mono text-xs font-medium text-zinc-400 capitalize">
            Loading...
          </span>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-zinc-400"
            aria-label="Copy code"
            disabled
          >
            <Copy size={14} />
          </button>
        </div>
        <div className="p-5 text-sm text-zinc-400 sm:text-[15px]">
          Loading syntax highlighting...
        </div>
      </div>
    ),
  },
)

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '')
  const [copied, setCopied] = useState(false)
  const [style, setStyle] = useState<any>(null)

  useEffect(() => {
    // Dynamically load the style when component mounts
    import('react-syntax-highlighter/dist/esm/styles/prism')
      .then((mod) => {
        setStyle(mod.vscDarkPlus)
      })
      .catch((err) => {
        console.error('Failed to load syntax highlighter style:', err)
      })
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inline && match) {
    return (
      <div className="group relative my-6 overflow-hidden rounded-lg border border-white/20 bg-zinc-950 shadow-xl dark:border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 px-4 py-2">
          <span className="font-mono text-xs font-medium text-zinc-400 capitalize">
            {match[1]}
          </span>
          <button
            onClick={handleCopy}
            className="hover:bg-primary/20 hover:text-primary flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-zinc-400 transition-all active:scale-95"
            aria-label="Copy code"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={style || {}}
          language={match[1]}
          PreTag="div"
          className="!m-0 !bg-transparent text-sm sm:text-[15px]"
          customStyle={{ padding: '1.25rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    )
  }
  return (
    <code
      className={cn(
        'text-primary mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-medium dark:bg-zinc-800',
        className,
      )}
      {...props}
    >
      {children}
    </code>
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
  const [isReaderMode, setIsReaderMode] = useState(false)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    if (isReaderMode) {
      document.body.classList.add('e-ink-mode')
    } else {
      document.body.classList.remove('e-ink-mode')
    }
    return () => {
      document.body.classList.remove('e-ink-mode')
    }
  }, [isReaderMode])
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <>
      {/* Floating Reader Mode Toggle inside a compact pod */}
      <div className="fixed bottom-8 left-4 z-40 flex items-center gap-3 rounded-full border border-zinc-200 bg-white/50 px-4 py-2.5 shadow-lg backdrop-blur-md md:left-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <BookOpen size={16} className="text-zinc-600 dark:text-zinc-400" />
        <span className="mr-1 text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
          Kindle
        </span>
        <button
          onClick={() => setIsReaderMode(!isReaderMode)}
          className={cn(
            'focus-visible:ring-primary relative inline-flex h-[22px] w-[42px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isReaderMode
              ? 'bg-zinc-800 dark:bg-zinc-200'
              : 'bg-zinc-300 dark:bg-zinc-700',
          )}
          aria-label="Toggle Reader Mode"
        >
          <span className="sr-only">Use reader mode</span>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-zinc-900',
              isReaderMode ? 'translate-x-5' : 'translate-x-[2px]',
            )}
          />
        </button>
      </div>

      {/* Reading Progress Bar */}
      <motion.div
        className={cn(
          'fixed top-0 right-0 left-0 z-50 h-[3px] origin-left transition-colors delay-100 duration-700',
          isReaderMode
            ? 'bg-zinc-500 shadow-none dark:bg-zinc-400'
            : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]',
        )}
        style={{ scaleX }}
      />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-16 sm:py-24">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <div className="mx-auto max-w-[65ch]">
            <BlogHeader meta={meta} />

            <div className="prose prose-zinc prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary dark:prose-a:text-primary-light prose-pre:p-0 prose-pre:bg-transparent prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 mt-12 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  p: ({ node, children }) => (
                    <p className="mb-6 leading-relaxed">{children}</p>
                  ),
                  h1: ({ node, children }) => (
                    <h1 className="mt-10 mb-6 text-3xl font-bold">{children}</h1>
                  ),
                  h2: ({ node, children }) => (
                    <h2 className="mt-10 mb-4 text-2xl font-bold">{children}</h2>
                  ),
                  h3: ({ node, children }) => (
                    <h3 className="mt-8 mb-4 text-xl font-bold">{children}</h3>
                  ),
                  ul: ({ node, children }) => (
                    <ul className="mb-6 list-disc space-y-2 pl-6">{children}</ul>
                  ),
                  ol: ({ node, children }) => (
                    <ol className="mb-6 list-decimal space-y-2 pl-6">{children}</ol>
                  ),
                  li: ({ node, children }) => (
                    <li className="text-zinc-700 dark:text-zinc-300">{children}</li>
                  ),
                  a: ({ node, href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary decoration-primary/30 hover:decoration-primary font-semibold underline-offset-4 transition-colors hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ node, children }) => (
                    <blockquote className="border-primary bg-primary/5 my-8 rounded-r-lg border-l-4 p-4 text-zinc-700 italic shadow-sm dark:text-zinc-300">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}
          </div>
        </article>

        {/* TOC Sidebar */}
        <aside className="hidden xl:block w-64 shrink-0">
          <TableOfContents content={content} />
        </aside>
      </div>
    </>
  )
}
