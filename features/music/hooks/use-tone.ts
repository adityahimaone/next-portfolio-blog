'use client'

/**
 * Tone.js is ~200 KiB and nothing on the page plays audio until the visitor
 * asks for it, so it is imported on demand and cached at module scope. Every
 * caller awaits this rather than reaching for a static import.
 */
let toneModule: typeof import('tone') | null = null

export async function getTone() {
  if (!toneModule) {
    toneModule = await import('tone')
  }
  return toneModule
}
