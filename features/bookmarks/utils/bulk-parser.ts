import type { BulkBookmarkInput } from '../types'

/**
 * Parses user input for bulk bookmark creation.
 * Supports:
 * 1. JSON array of bookmarks: [{ "url": "...", "title": "...", "category": "..." }]
 * 2. Pipe-separated lines: url | title | category | description
 * 3. Tab-separated lines: url \t title \t category \t description
 * 4. Comma-separated lines: url, title, category, description
 * 5. One URL per line: https://example.com
 */
export function parseBulkBookmarks(
  rawInput: string,
  defaultCategory: string = 'Dev Tools',
): BulkBookmarkInput[] {
  const trimmed = rawInput.trim()
  if (!trimmed) return []

  // Attempt JSON parsing first
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item && typeof item === 'object' && item.url)
          .map((item) => {
            let url = String(item.url).trim()
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = `https://${url}`
            }

            let title = item.title ? String(item.title).trim() : ''
            if (!title) {
              try {
                const hostClean = new URL(url).hostname
                  .replace(/^www\./, '')
                  .split('.')[0]
                title = hostClean.charAt(0).toUpperCase() + hostClean.slice(1)
              } catch {
                title = url
              }
            }

            return {
              url,
              title,
              category: item.category ? String(item.category).trim() : defaultCategory,
              description: item.description ? String(item.description).trim() : '',
              tags: item.tags,
              featured: Boolean(item.featured),
              faviconUrl: item.faviconUrl ? String(item.faviconUrl).trim() : undefined,
            }
          })
      }
    } catch {
      // If JSON parse fails, fall through to line-by-line parsing
    }
  }

  const lines = trimmed.split('\n')
  const results: BulkBookmarkInput[] = []

  for (const line of lines) {
    const cleanLine = line.trim()
    if (!cleanLine || cleanLine.startsWith('#') || cleanLine.startsWith('//')) {
      continue
    }

    let urlPart = ''
    let titlePart = ''
    let catPart = defaultCategory
    let descPart = ''

    if (cleanLine.includes('|')) {
      const parts = cleanLine.split('|').map((p) => p.trim())
      urlPart = parts[0] || ''
      titlePart = parts[1] || ''
      catPart = parts[2] || defaultCategory
      descPart = parts[3] || ''
    } else if (cleanLine.includes('\t')) {
      const parts = cleanLine.split('\t').map((p) => p.trim())
      urlPart = parts[0] || ''
      titlePart = parts[1] || ''
      catPart = parts[2] || defaultCategory
      descPart = parts[3] || ''
    } else if (
      cleanLine.includes(',') &&
      (cleanLine.startsWith('http://') || cleanLine.startsWith('https://'))
    ) {
      const parts = cleanLine.split(',').map((p) => p.trim())
      urlPart = parts[0] || ''
      titlePart = parts[1] || ''
      catPart = parts[2] || defaultCategory
      descPart = parts[3] || ''
    } else {
      urlPart = cleanLine
    }

    if (!urlPart) continue

    let validUrl = urlPart
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`
    }

    try {
      const parsed = new URL(validUrl)
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        continue
      }

      if (!titlePart) {
        const hostClean = parsed.hostname.replace(/^www\./, '').split('.')[0]
        titlePart = hostClean.charAt(0).toUpperCase() + hostClean.slice(1)
      }

      results.push({
        url: validUrl,
        title: titlePart,
        category: catPart || defaultCategory,
        description: descPart,
      })
    } catch {
      // Skip invalid URLs
    }
  }

  return results
}
