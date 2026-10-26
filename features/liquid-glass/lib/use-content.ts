'use client'

import { useEffect, useState } from 'react'
import type { Note, Project } from '../types'
import { fetchContent } from './cms'

/**
 * Client-side reads against a content endpoint, with the server-rendered
 * payload as the first value.
 *
 * The pattern is the one that survives a CMS swap: the route fetches on the
 * server (fast first paint, real HTML), then the hook revalidates against
 * `NEXT_PUBLIC_CONTENT_ENDPOINT` if one is configured. With no endpoint set —
 * which is the default in this repo — the hook is inert and the initial data is
 * the data. No loading spinner over content the visitor can already read.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_CONTENT_ENDPOINT

function useCollection<T>(
  path: string,
  initialData: T[],
): { data: T[]; error: Error | null } {
  const [data, setData] = useState<T[]>(initialData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!ENDPOINT) return

    let cancelled = false
    const controller = new AbortController()

    fetchContent<T[]>(`${ENDPOINT}${path}`, { signal: controller.signal })
      .then((next) => {
        if (!cancelled && Array.isArray(next)) setData(next)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error(String(cause)))
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [path])

  return { data, error }
}

export function useProjects(initialData: Project[]) {
  return useCollection<Project>('/projects', initialData)
}

export function useNotes(initialData: Note[]) {
  return useCollection<Note>('/notes', initialData)
}

/** A single note, refreshed the same way, keyed by slug. */
export function useNote(initialData: Note | null, slug: string) {
  const [data, setData] = useState<Note | null>(initialData)

  useEffect(() => {
    if (!ENDPOINT || !slug) return

    let cancelled = false
    const controller = new AbortController()

    fetchContent<Note>(`${ENDPOINT}/notes/${slug}`, {
      signal: controller.signal,
    })
      .then((next) => {
        if (!cancelled && next) setData(next)
      })
      .catch(() => {
        /* keep the server payload */
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [slug])

  return data
}
