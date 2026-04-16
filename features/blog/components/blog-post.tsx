'use client'

import React, { useState } from 'react'
import type { BlogMeta } from '../lib/blog'
import { BlogHeader } from './blog-header'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Check, Copy } from 'lucide-react'
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
  return (
    <article className="mx-auto max-w-3xl px-4 py-20">
      <BlogHeader meta={meta} />
      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary dark:prose-a:text-primary-light prose-pre:p-0 prose-pre:bg-transparent">
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
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline underline-offset-4">
                {children}
              </a>
            ),
            blockquote: ({ node, children }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic text-zinc-600 dark:text-zinc-400 my-6">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
