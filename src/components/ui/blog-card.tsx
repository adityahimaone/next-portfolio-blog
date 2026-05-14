import Link from 'next/link'

interface BlogCardProps {
  title: string
  slug: string
  date: string
  excerpt: string
  readTime: number
}

export function BlogCard({ title, slug, date, excerpt, readTime }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block border-2 border-gray bg-black-true p-6 transition-all hover:border-red"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="t-heading-s text-white-bone transition-colors group-hover:text-red">
            {title}
          </h3>
          <p className="t-body-s mt-2 text-white-dim">{excerpt}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="t-hud-xs text-white-dim">{date}</span>
          <span className="t-hud-xs text-red">{readTime} MIN</span>
        </div>
      </div>
    </Link>
  )
}
