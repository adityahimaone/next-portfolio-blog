import type {
  RecommendedSkill,
  SkillsCatalog,
} from '@/features/skills/constants/catalogue'
import { ownerFromRepo } from '@/features/skills/constants/catalogue'
import catalogSnapshot from '@/features/skills/constants/ui-skills.json'

/**
 * The catalogue the page ships with. Bundled rather than read from disk so the
 * list survives a worker environment, where content/skills.json is unreachable.
 */
export const DEFAULT_CATALOG: SkillsCatalog = catalogSnapshot as SkillsCatalog

const STORE_PATH = ['content', 'skills.json']

async function getLocalCatalog(): Promise<SkillsCatalog | null> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), ...STORE_PATH)
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        return parsed as SkillsCatalog
      }
    }
  } catch {
    // Workers or restricted environment
  }
  return null
}

async function saveLocalCatalog(catalog: SkillsCatalog): Promise<boolean> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const filePath = path.join(process.cwd(), ...STORE_PATH)
    fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function readSkills(): Promise<SkillsCatalog> {
  return (await getLocalCatalog()) ?? DEFAULT_CATALOG
}

type SkillInput = RecommendedSkill & { tags?: string[] }

/** Keeps only tags the catalogue knows about, so no chip can render unlabelled. */
function normalise(input: SkillInput, known: Set<string>): RecommendedSkill {
  const repo = input.repo.trim()
  const skill: RecommendedSkill = {
    name: input.name.trim(),
    owner: input.owner?.trim() || ownerFromRepo(repo),
    repo,
    description: input.description?.trim() || '',
    tags: [...new Set(input.tags ?? [])].filter((tag) => known.has(tag)),
  }
  if (input.installed) skill.installed = true
  return skill
}

function sameSkill(
  a: { name: string; repo: string },
  b: { name: string; repo: string },
) {
  return a.name === b.name && a.repo === b.repo
}

export async function insertSkill(skill: SkillInput): Promise<void> {
  const catalog = await readSkills()
  const known = new Set(catalog.tags.map((tag) => tag.slug))
  const next = normalise(skill, known)
  const index = catalog.skills.findIndex((s) => sameSkill(s, next))

  if (index >= 0) catalog.skills[index] = next
  else catalog.skills.unshift(next)

  await saveLocalCatalog(catalog)
}

export async function insertSkills(skills: SkillInput[]): Promise<number> {
  if (skills.length === 0) return 0
  const catalog = await readSkills()
  const known = new Set(catalog.tags.map((tag) => tag.slug))

  for (const raw of skills) {
    const next = normalise(raw, known)
    const index = catalog.skills.findIndex((s) => sameSkill(s, next))
    if (index >= 0) catalog.skills[index] = next
    else catalog.skills.unshift(next)
  }

  await saveLocalCatalog(catalog)
  return skills.length
}

export async function updateSkill(
  oldKey: { name: string; repo: string },
  updated: SkillInput,
): Promise<boolean> {
  const catalog = await readSkills()
  const index = catalog.skills.findIndex((s) => sameSkill(s, oldKey))
  if (index < 0) return false

  const known = new Set(catalog.tags.map((tag) => tag.slug))
  catalog.skills[index] = normalise(updated, known)
  await saveLocalCatalog(catalog)
  return true
}

export async function deleteSkill(target: {
  name: string
  repo: string
}): Promise<boolean> {
  const catalog = await readSkills()
  const before = catalog.skills.length
  catalog.skills = catalog.skills.filter((s) => !sameSkill(s, target))
  if (catalog.skills.length === before) return false

  await saveLocalCatalog(catalog)
  return true
}
