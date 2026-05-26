'use client'

/**
 * SubpageHeader — DEPRECATED in v2.0 (Concept Album).
 *
 * Header is now rendered globally from app/layout.tsx and detects
 * pathname to decide between Mixing Console (homepage) and minimal
 * subpage bar. Returning null here so existing usages in
 * blog/projects/music views don't render a second header.
 */
export function SubpageHeader() {
  return null
}
