'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * A thrown error in any route below this one used to produce Next's default
 * overlay with no site chrome, no way back, and no `<title>` of its own — a
 * crash page that a crawler encountering once has nowhere to follow.
 *
 * `error.tsx` catches errors in the segment it sits in, including server
 * component failures, and must be a client component because it is handed the
 * `error` and `reset` pair.
 *
 * Note what this deliberately does *not* do: emit a `noindex` meta tag. Unlike
 * `not-found.tsx`, an error page cannot export `metadata` — it is a client
 * component — and adding a raw `<meta name="robots">` into the body would be
 * relying on head hoisting that a crashed render has already proven unreliable.
 * A 5xx is not indexed anyway.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces in the browser console, which is where a server-rendered crash
    // otherwise leaves no trace at all.
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
        Signal lost
      </p>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Something broke on this page.
      </h1>
      <p className="text-muted-foreground mb-8">
        The error has been logged. You can try again, or head back to somewhere
        that works.
      </p>

      {error.digest ? (
        <p className="text-muted-foreground mb-8 font-mono text-xs">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border-border rounded-full border px-5 py-2 text-sm font-medium"
        >
          Try again
        </button>
        <Link href="/" className="text-primary underline underline-offset-4">
          Back to home
        </Link>
        <Link
          href="/contact"
          className="text-primary underline underline-offset-4"
        >
          Report it
        </Link>
      </div>
    </main>
  )
}
