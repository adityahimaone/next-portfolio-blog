import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Track Not Found | adityahimaone',
  description: 'This track seems to have been removed from the playlist.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* DAW-style visual element - waveform */}
      <div className="relative mb-8">
        {/* Waveform visualization */}
        <div className="flex items-center gap-[2px] h-20 opacity-60">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = Math.sin((i / 40) * Math.PI * 4) * 40 + 30
            return (
              <div
                key={i}
                className="w-[3px] rounded-full bg-zinc-300 dark:bg-zinc-700 transition-all"
                style={{ height: `${height}px` }}
              />
            )
          })}
        </div>

        {/* Playhead line */}
        <div className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-red-500 opacity-70">
          <div className="absolute -left-[4px] top-0 h-2 w-[10px] rounded-full bg-red-500" />
        </div>
      </div>

      {/* 404 Number with DAW styling */}
      <div className="mb-4 font-mono text-8xl font-bold tracking-tighter text-zinc-200 dark:text-zinc-800">
        404
      </div>

      {/* Message */}
      <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Track Not Found
      </h2>
      <p className="mb-8 max-w-md text-zinc-600 dark:text-zinc-400">
        This track seems to have been removed from the playlist, or maybe the
        URL is offbeat. Let's get you back to the main mix.
      </p>

      {/* Navigation buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </Link>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Read Blog
        </Link>
      </div>

      {/* DAW hint */}
      <p className="mt-12 font-mono text-xs text-zinc-400 dark:text-zinc-600">
        [ SIGNAL LOST · CHECK ROUTING ]
      </p>
    </div>
  )
}
