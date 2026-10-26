import type { Note, PortfolioSource, Project, Track } from '../types'
import { PROJECTS } from '../data/projects'
import { NOTES } from '../data/notes'
import { TRACKS } from '../data/tracks'

/**
 * The content adapter.
 *
 * Everything above this file talks to `PortfolioSource`. Today the
 * implementation is the local mock below; pointing the site at Sanity or
 * Contentful means writing a second object with the same five methods and
 * changing `cms` — no component or route changes.
 *
 * A real source keeps the same signature and shape:
 *
 *   const sanity: PortfolioSource = {
 *     async getProjects() {
 *       return client.fetch(projectQuery)
 *     },
 *     ...
 *   }
 *
 * Returning copies (rather than the module singletons) keeps callers from
 * mutating the mock's arrays, which matters the moment one of them sorts in
 * place.
 */

const clone = <T>(value: T): T => structuredClone(value)

export const mockSource: PortfolioSource = {
  async getProjects() {
    return clone(PROJECTS).sort((a, b) => a.order - b.order)
  },
  async getProject(slug) {
    const found = PROJECTS.find((project) => project.slug === slug)
    return found ? clone(found) : null
  },
  async getNotes() {
    return clone(NOTES).sort((a, b) => a.order - b.order)
  },
  async getNote(slug) {
    const found = NOTES.find((note) => note.slug === slug)
    return found ? clone(found) : null
  },
  async getTracks() {
    return clone(TRACKS)
  },
}

export const cms: PortfolioSource = mockSource

/**
 * Small fetch helper for the day the source becomes remote. It is used by the
 * client hooks in `lib/use-content.ts`, and it is deliberately boring: JSON in,
 * typed JSON out, one retry on network failure.
 */
export async function fetchContent<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const run = async () => {
    const response = await fetch(endpoint, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    })

    if (!response.ok) {
      throw new Error(`${endpoint} responded ${response.status}`)
    }

    return (await response.json()) as T
  }

  try {
    return await run()
  } catch (error) {
    // One retry, then surface. A content endpoint that is down should degrade to
    // the server-rendered payload rather than to an empty page — the hooks
    // using this keep their `initialData` when the call throws.
    await new Promise((resolve) => setTimeout(resolve, 400))
    try {
      return await run()
    } catch {
      throw error
    }
  }
}

export type { Note, Project, Track }
