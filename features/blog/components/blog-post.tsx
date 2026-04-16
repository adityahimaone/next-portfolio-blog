'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import type { BlogMeta } from '../lib/blog'
import { BlogHeader } from './blog-header'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Check, Copy, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inline && match) {
    return (
      <div className="relative group my-6 overflow-hidden rounded-lg bg-zinc-950 shadow-xl border border-white/20 dark:border-white/10">
        <div className="flex px-4 py-2 items-center justify-between border-b border-white/10 bg-zinc-900/50">
          <span className="text-xs font-mono font-medium text-zinc-400 capitalize">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-zinc-400 transition-all hover:bg-primary/20 hover:text-primary active:scale-95"
            aria-label="Copy code"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
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
    <code className={cn("bg-zinc-100 dark:bg-zinc-800 rounded mx-1 px-1.5 py-0.5 text-sm font-medium text-primary", className)} {...props}>
      {children}
    </code>
  )
}

export function BlogPost({
  meta,
  content,
}: {
  meta: BlogMeta
  content: string
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
    restDelta: 0.001
  })

  return (
    <>
      {/* Floating Reader Mode Toggle inside a compact pod */}
      <div className="fixed bottom-8 left-4 md:left-8 z-40 flex items-center gap-3 rounded-full border border-zinc-200 bg-white/50 px-4 py-2.5 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50">
        <BookOpen size={16} className="text-zinc-600 dark:text-zinc-400" />
        <span className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 uppercase mr-1">Kindle</span>
        <button
          onClick={() => setIsReaderMode(!isReaderMode)}
          className={cn(
            "relative inline-flex h-[22px] w-[42px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isReaderMode ? "bg-zinc-800 dark:bg-zinc-200" : "bg-zinc-300 dark:bg-zinc-700"
          )}
          aria-label="Toggle Reader Mode"
        >
          <span className="sr-only">Use reader mode</span>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out",
              isReaderMode ? "translate-x-5" : "translate-x-[2px]"
            )}
          />
        </button>
      </div>

      {/* Reading Progress Bar */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 right-0 h-[3px] origin-left z-50 transition-colors duration-700 delay-100",
          isReaderMode ? "bg-zinc-500 shadow-none dark:bg-zinc-400" : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"
        )}
        style={{ scaleX }}
      />
      
      <article className="mx-auto max-w-[65ch] px-4 py-16 sm:py-24">
        <BlogHeader meta={meta} />
        
        <div className="prose prose-zinc prose-lg mt-12 max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary dark:prose-a:text-primary-light prose-pre:p-0 prose-pre:bg-transparent prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock,
            p: ({ node, children }) => <p className="leading-relaxed mb-6">{children}</p>,
            h1: ({ node, children }) => <h1 className="text-3xl font-bold mt-10 mb-6">{children}</h1>,
            h2: ({ node, children }) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
            h3: ({ node, children }) => <h3 className="text-xl font-bold mt-8 mb-4">{children}</h3>,
            ul: ({ node, children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
            ol: ({ node, children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
            li: ({ node, children }) => <li className="text-zinc-700 dark:text-zinc-300">{children}</li>,
            a: ({ node, href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline underline-offset-4 decoration-primary/30 transition-colors hover:decoration-primary">
                {children}
              </a>
            ),
            blockquote: ({ node, children }) => (
              <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg italic text-zinc-700 dark:text-zinc-300 my-8 shadow-sm">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
    </>
  )
}
