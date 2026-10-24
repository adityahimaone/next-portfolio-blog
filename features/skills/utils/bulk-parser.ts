export interface BulkSkillInput {
  name: string
  repo: string
  category: string
  description?: string
  installs?: string
  installed?: boolean
}

/**
 * Parses raw bulk skill text (JSON array or line-by-line formatted string)
 * into structured BulkSkillInput objects.
 */
export function parseBulkSkills(
  rawInput: string,
  fallbackCategory = 'Engineering workflow',
): BulkSkillInput[] {
  const trimmed = rawInput.trim()
  if (!trimmed) return []

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

          results.push({
            name,
            repo,
            category: String(item.category || fallbackCategory).trim(),
            description: item.description ? String(item.description).trim() : '',
            installs: item.installs ? String(item.installs).trim() : '1.0K',
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
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean)
  const results: BulkSkillInput[] = []

  for (const line of lines) {
    // Check if line is a skills.sh URL: e.g. https://www.skills.sh/owner/repo/skill-name
    const skillsShMatch = line.match(
      /(?:https?:\/\/)?(?:www\.)?skills\.sh\/([^/\s]+)\/([^/\s]+)\/([^/\s]+)/i,
    )
    if (skillsShMatch) {
      const [, owner, repoName, skillName] = skillsShMatch
      results.push({
        name: skillName,
        repo: `${owner}/${repoName}`,
        category: fallbackCategory,
        description: `Agent skill ${skillName} curated from skills.sh`,
        installs: '1.0K',
        installed: false,
      })
      continue
    }

    // Check if line contains pipe delimiters: "name | repo | category | description | installs"
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim())
      if (parts.length >= 2) {
        const name = parts[0]
        const repo = parts[1]
        if (!name || !repo) continue

        let category = fallbackCategory
        let description = ''
        let installs = '1.0K'

        if (parts.length === 3) {
          // name | repo | description
          description = parts[2]
        } else if (parts.length === 4) {
          // name | repo | category | description
          category = parts[2] || fallbackCategory
          description = parts[3]
        } else if (parts.length >= 5) {
          // name | repo | category | description | installs
          category = parts[2] || fallbackCategory
          description = parts[3]
          installs = parts[4] || '1.0K'
        }

        results.push({
          name,
          repo,
          category,
          description,
          installs,
          installed: false,
        })
        continue
      }
    }

    // Check if line contains tabs
    if (line.includes('\t')) {
      const parts = line.split('\t').map((p) => p.trim())
      if (parts.length >= 2) {
        const name = parts[0]
        const repo = parts[1]
        if (!name || !repo) continue
        results.push({
          name,
          repo,
          category: parts[2] || fallbackCategory,
          description: parts[3] || '',
          installs: parts[4] || '1.0K',
          installed: false,
        })
        continue
      }
    }
  }

  return results
}
