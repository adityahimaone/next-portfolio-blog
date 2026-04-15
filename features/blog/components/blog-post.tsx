import type { BlogMeta } from '../blog'
import { BlogHeader } from './blog-header'

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
      <div
        className="prose prose-zinc mt-8 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary dark:prose-a:text-primary-light"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
      />
    </article>
  )
}

function markdownToHtml(md: string): string {
  return (
    md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>'
      )
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gim, (match) => {
        if (match.startsWith('<')) return match
        return match
      })
      // Wrap in paragraph
      .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      // Wrap consecutive li elements in ul
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  )
}
