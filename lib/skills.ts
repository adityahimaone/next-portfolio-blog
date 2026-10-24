import type { RecommendedSkill, SkillGroup } from '@/features/skills/constants/catalogue'
import { SKILL_GROUPS as DEFAULT_SKILL_GROUPS } from '@/features/skills/constants/catalogue'

const DEFAULT_CATEGORY_HUES: Record<string, string> = {
  'Design & motion': '#e879f9',
  'Engineering workflow': '#a5b4fc',
  'Agents & tooling': '#f97316',
  'Video & motion graphics': '#f87171',
  Mobile: '#60a5fa',
}

async function getLocalSkills(): Promise<SkillGroup[]> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), 'content', 'skills.json')
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Workers or restricted environment
  }
  return DEFAULT_SKILL_GROUPS
}

async function saveLocalSkills(groups: SkillGroup[]): Promise<boolean> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), 'content', 'skills.json')
    fs.writeFileSync(filePath, JSON.stringify(groups, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function readSkills(): Promise<SkillGroup[]> {
  return getLocalSkills()
}

export async function insertSkill(
  skill: RecommendedSkill & { category?: string },
): Promise<void> {
  const groups = await readSkills()
  const targetCategory = skill.category || 'Engineering workflow'
  let group = groups.find((g) => g.title === targetCategory)

  if (!group) {
    const hue = DEFAULT_CATEGORY_HUES[targetCategory] || '#2dd4bf'
    group = {
      title: targetCategory,
      hue,
      skills: [],
    }
    groups.push(group)
  }

  // Prepend to group skills
  group.skills.unshift({
    name: skill.name,
    repo: skill.repo,
    description: skill.description || '',
    installs: skill.installs || '1.0K',
    installed: Boolean(skill.installed),
  })

  await saveLocalSkills(groups)
}

export async function insertSkills(
  newSkills: (RecommendedSkill & { category?: string })[],
): Promise<number> {
  if (newSkills.length === 0) return 0
  const groups = await readSkills()

  for (const skill of newSkills) {
    const targetCategory = skill.category || 'Engineering workflow'
    let group = groups.find((g) => g.title === targetCategory)

    if (!group) {
      const hue = DEFAULT_CATEGORY_HUES[targetCategory] || '#2dd4bf'
      group = {
        title: targetCategory,
        hue,
        skills: [],
      }
      groups.push(group)
    }

    // Check duplicate
    const existingIdx = group.skills.findIndex(
      (s) => s.name === skill.name && s.repo === skill.repo,
    )
    if (existingIdx >= 0) {
      group.skills[existingIdx] = {
        name: skill.name,
        repo: skill.repo,
        description: skill.description || group.skills[existingIdx].description,
        installs: skill.installs || group.skills[existingIdx].installs,
        installed:
          skill.installed !== undefined
            ? Boolean(skill.installed)
            : group.skills[existingIdx].installed,
      }
    } else {
      group.skills.unshift({
        name: skill.name,
        repo: skill.repo,
        description: skill.description || '',
        installs: skill.installs || '1.0K',
        installed: Boolean(skill.installed),
      })
    }
  }

  await saveLocalSkills(groups)
  return newSkills.length
}

export async function updateSkill(
  oldKey: { name: string; repo: string },
  updated: RecommendedSkill & { category?: string },
): Promise<boolean> {
  const groups = await readSkills()
  let found = false
  const targetCategory = updated.category

  // Find where it currently lives
  for (const group of groups) {
    const idx = group.skills.findIndex(
      (s) => s.name === oldKey.name && s.repo === oldKey.repo,
    )
    if (idx >= 0) {
      found = true
      // If category changed, move to the new group
      if (targetCategory && targetCategory !== group.title) {
        group.skills.splice(idx, 1)
        let targetGroup = groups.find((g) => g.title === targetCategory)
        if (!targetGroup) {
          targetGroup = {
            title: targetCategory,
            hue: DEFAULT_CATEGORY_HUES[targetCategory] || '#2dd4bf',
            skills: [],
          }
          groups.push(targetGroup)
        }
        targetGroup.skills.unshift({
          name: updated.name,
          repo: updated.repo,
          description: updated.description,
          installs: updated.installs || '1.0K',
          installed: Boolean(updated.installed),
        })
      } else {
        group.skills[idx] = {
          name: updated.name,
          repo: updated.repo,
          description: updated.description,
          installs: updated.installs || group.skills[idx].installs,
          installed: Boolean(updated.installed),
        }
      }
      break
    }
  }

  if (found) {
    await saveLocalSkills(groups)
  }
  return found
}

export async function deleteSkill(target: {
  name: string
  repo: string
}): Promise<boolean> {
  const groups = await readSkills()
  let deleted = false

  for (const group of groups) {
    const initialLen = group.skills.length
    group.skills = group.skills.filter(
      (s) => !(s.name === target.name && s.repo === target.repo),
    )
    if (group.skills.length < initialLen) {
      deleted = true
      break
    }
  }

  if (deleted) {
    await saveLocalSkills(groups)
  }
  return deleted
}
