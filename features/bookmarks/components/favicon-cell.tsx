'use client'

import { Globe } from 'lucide-react'

import { VolLoader } from '@/features/landing-page/vol-loader'
import { cn } from '@/lib/utils'

import { getFaviconUrl } from '../utils/favicon'
import { useFaviconState } from '../hooks/use-favicon-state'

import styles from '../library.module.css'

type FaviconCellProps = {
  url: string
  /** Stored as nullable on the bookmark, so null has to be folded in here. */
  faviconUrl?: string | null
  /** Renders as a link preview, so the image carries the title as alt text. */
  alt?: string
  className?: string
}

/**
 * A bookmark's favicon with its three states in one place: the scan loader
 * while the icon is in flight, a globe if the service has no icon for the
 * domain, and the icon itself once it lands.
 *
 * The `<img>` is kept mounted underneath rather than swapped in, so the tile
 * never reflows when the state changes.
 */
export function FaviconCell({
  url,
  faviconUrl,
  alt = '',
  className,
}: FaviconCellProps) {
  const src = getFaviconUrl(url, faviconUrl ?? undefined)
  const state = useFaviconState(src)

  return (
    <span className={cn(styles.faviconCell, className)}>
      {state === 'loading' && (
        <VolLoader
          className={styles.faviconLoader}
          rate={1.4}
          label="Loading icon"
        />
      )}

      {state === 'error' && (
        <Globe className={styles.faviconFallback} aria-hidden="true" />
      )}

      {/*
        Kept mounted in all three states so the tile never reflows, and
        `loading="lazy"` so off-screen rows cost nothing. Once the state is
        settled the browser serves this from the decoded cache the hook already
        warmed, so it is a paint rather than a second network round trip.
      */}
      <img
        className={styles.faviconImg}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-state={state}
        aria-hidden={alt ? undefined : true}
      />
    </span>
  )
}
