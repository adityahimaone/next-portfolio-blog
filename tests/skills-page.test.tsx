import { render, screen } from '@testing-library/react'
import {
  SkillsPage,
  SKILL_GROUPS,
  SKILL_COUNT,
  INSTALLED_COUNT,
  SKILLS_SOURCE,
} from '@/features/skills'
import { NAV_ITEMS } from '@/features/booth/nav-items'

/**
 * The page's contract with the catalogue, and the one routing rule that is not
 * visible in the markup: /skills is reached from /bookmarks, so it must never
 * appear in the dock.
 *
 * Assertions are plain — the project's tsconfig carries no jest-dom types, so
 * `toBeInTheDocument` would be a type error in a file nothing else compiles.
 */
describe('/skills', () => {
  const skillRows = () =>
    screen.getAllByRole('link').filter((link) => {
      const href = link.getAttribute('href')
      return Boolean(href?.startsWith(SKILLS_SOURCE)) && href !== SKILLS_SOURCE
    })

  it('renders every skill in the catalogue, grouped', () => {
    render(<SkillsPage />)

    expect(skillRows()).toHaveLength(SKILL_COUNT)

    for (const group of SKILL_GROUPS) {
      expect(screen.getByText(group.title)).toBeTruthy()
    }
  })

  it('marks exactly the skills this workspace runs', () => {
    render(<SkillsPage />)
    expect(screen.getAllByText('In use')).toHaveLength(INSTALLED_COUNT)
  })

  it('links each row to its skills.sh page and carries the install command', () => {
    render(<SkillsPage />)

    const row = screen.getByRole('link', { name: /emil-design-eng/ })

    expect(row.getAttribute('href')).toBe(
      'https://www.skills.sh/emilkowalski/skills/emil-design-eng',
    )
    expect(row.getAttribute('title')).toBe(
      'npx skills add https://github.com/emilkowalski/skills --skill emil-design-eng',
    )
  })

  it('is not in the dock', () => {
    expect(NAV_ITEMS.map((item) => item.href)).not.toContain('/skills')
  })
})
