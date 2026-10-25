export interface BulkSkillInput {
  name: string
  repo: string
  description?: string
  tags: string[]
  installed?: boolean
}

const UI_SKILLS_URL =
  /(?:https?:\/\/)?(?:www\.)?ui-skills\.com\/skills\/([^/\s]+)\/([^/\s]+)/i
const SKILLS_SH_URL =
  /(?:https?:\/\/)?(?:www\.)?skills\.sh\/([^/\s]+)\/([^/\s]+)\/([^/\s]+)/i

function parseTags(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

/**
 * Parses raw bulk skill text — a JSON array, a directory URL, or a
 * line-by-line format — into structured BulkSkillInput objects.
 *
 * The line format is `name | repo | tag1,tag2 | description`: with three
 * columns the last one is the description, and tags only appear in the fourth
 * form, so a plain sentence is never mistaken for a tag list.
 */
export function parseBulkSkills(
  rawInput: string,
  fallbackTags: string[] = [],
): BulkSkillInput[] {
  const trimmed = rawInput.trim()
  if (!trimmed) return []

  const withFallback = (tags: string[]) => ({
    tags: tags.length > 0 ? tags : [...fallbackTags],
  })

  // Case 1: JSON array input
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        const results: BulkSkillInput[] = []
        for (const item of parsed) {
          if (!item || typeof item !== 'object') continue
          const name = String(item.name || '').trim()
          const repo = String(item.repo || '').trim()
          if (!name || !repo) continue

          const tags = Array.isArray(item.tags)
            ? item.tags
                .map((tag: unknown) => String(tag).trim())
                .filter(Boolean)
            : parseTags(item.tags)

          results.push({
            name,
            repo,
            description: item.description
              ? String(item.description).trim()
              : '',
            ...withFallback(tags),
            installed: Boolean(item.installed),
          })
        }
        if (results.length > 0) return results
      }
    } catch {
      // Continue to line-by-line fallback
    }
  }

  // Case 2: Line-by-line input
  const lines = trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const results: BulkSkillInput[] = []

  for (const line of lines) {
    const uiSkills = line.match(UI_SKILLS_URL)
    if (uiSkills) {
      const [, owner, skillName] = uiSkills
      results.push({
        name: skillName,
        // The directory knows the owner but not which repo the skill installs
        // from, so point at the owner's own skills repo and let the admin fix it.
        repo: `${owner}/skills`,
        description: `Agent skill ${skillName} from ui-skills.com`,
        ...withFallback([]),
        installed: false,
      })
      continue
    }

    const skillsSh = line.match(SKILLS_SH_URL)
    if (skillsSh) {
      const [, owner, repoName, skillName] = skillsSh
      results.push({
        name: skillName,
        repo: `${owner}/${repoName}`,
        description: `Agent skill ${skillName} curated from skills.sh`,
        ...withFallback([]),
        installed: false,
      })
      continue
    }

    const parts = (line.includes('|') ? line.split('|') : line.split('\t')).map(
      (p) => p.trim(),
    )
    const name = parts[0]
    const repo = parts[1]
    if (!name || !repo) continue

    const hasTags = parts.length >= 4
    results.push({
      name,
      repo,
      description: (hasTags ? parts[3] : parts[2]) || '',
      ...withFallback(hasTags ? parseTags(parts[2]) : []),
      installed: false,
    })
  }

  return results
}
