/**
 * Skills catalogue — /skills.
 *
 * The entries are a snapshot of the ui-skills.com directory (439 skills), taken
 * from that site's own pages rather than fetched at render time, so the page
 * needs no network call and cannot be reordered by someone else's bad week.
 * `features/skills/constants/ui-skills.json` holds the data; this module holds
 * the shape and the two derivations the page needs.
 *
 * Tags are the site's own topics, most-used first. `installed` marks the ones
 * actually running in this workspace — the list's own credibility signal.
 */
export interface RecommendedSkill {
  name: string
  /**
   * GitHub owner slug on ui-skills.com — the first path segment of its URL.
   * Optional only so an admin-added skill can leave it out; everything stored
   * in the catalogue carries one, and `skillUrl` falls back to the repo's owner.
   */
  owner?: string
  /** `owner/repo` on GitHub, which is what the install command points at. */
  repo: string
  description: string
  /** Tag slugs, most-used first. */
  tags: string[]
  /** True when this workspace already runs the skill. */
  installed?: boolean
}

export interface SkillTag {
  slug: string
  label: string
  /** Chip and rail colour, the same job a bookmark channel colour does. */
  hue: string
}

export interface SkillsCatalog {
  tags: SkillTag[]
  skills: RecommendedSkill[]
}

export const SKILLS_SOURCE = 'https://www.ui-skills.com/skills/'

/** The owner slug an admin-added skill gets, derived from its GitHub repo. */
export function ownerFromRepo(repo: string): string {
  return repo.split('/')[0].trim().toLowerCase()
}

export function skillUrl(skill: RecommendedSkill): string {
  const owner = skill.owner || ownerFromRepo(skill.repo)
  return `${SKILLS_SOURCE}${owner}/${skill.name}`
}

export function installCommand(skill: RecommendedSkill): string {
  return `npx skills add https://github.com/${skill.repo} --skill ${skill.name}`
}
