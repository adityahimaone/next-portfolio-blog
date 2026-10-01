import type { Metadata } from 'next'

/**
 * Layout for routes that must never be indexed.
 *
 * `/spotify-setup` is a `'use client'` OAuth form, so it cannot export a
 * `metadata` object at all — a client component is not allowed to, and the
 * route therefore inherited the homepage's title and description, telling the
 * index it was a portfolio page. Its own `robots.txt` `disallow` is not a
 * substitute: disallow stops crawling but the URL can still be indexed from a
 * link, and it leaves the page described as the homepage.
 *
 * The noindex has to come from a server component, which is why this route
 * lives in a `(noindex)` group rather than carrying the flag inline. Route
 * groups do not affect the URL, so this is still `/spotify-setup`.
 *
 * `/ui` is a component playground that *can* export metadata, so it keeps its
 * own `robots: { index: false }` and does not live here.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function NoIndexLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
