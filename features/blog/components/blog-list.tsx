import { getAllPosts } from '../blog'
import { BlogCard } from './blog-card'

export function BlogList() {
  const posts = getAllPosts()

  return (
    <main className="mx-auto max-w-4xl px-4 py-20">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Blog
      </h1>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        Thoughts on frontend development, design, and code.
      </p>

      <div className="mt-12 space-y-6">
        {posts.length > 0 ? (
          posts.map(post => <BlogCard key={post.slug} post={post} />)
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">No posts yet.</p>
        )}
      </div>
    </main>
  )
}
