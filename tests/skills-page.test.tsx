import { render, screen, fireEvent } from '@testing-library/react'
import {
  SkillsPage,
  SKILLS_SOURCE,
  skillUrl,
  installCommand,
} from '@/features/skills'
import { DEFAULT_CATALOG } from '@/lib/skills'
import { NAV_ITEMS } from '@/features/booth/nav-items'

/**
 * The page's contract with the catalogue, the filtering it promises, and the
 * one routing rule that is not visible in the markup: /skills is reached from
 * /bookmarks, so it must never appear in the dock.
 *
 * Assertions are plain — the project's tsconfig carries no jest-dom types, so
 * `toBeInTheDocument` would be a type error in a file nothing else compiles.
 */
describe('/skills', () => {
  const catalog = DEFAULT_CATALOG

  const skillRows = () =>
    screen.getAllByRole('link').filter((link) => {
      const href = link.getAttribute('href')
      return Boolean(href?.startsWith(SKILLS_SOURCE)) && href !== SKILLS_SOURCE
    })

  const skillsWithTag = (slug: string) =>
    catalog.skills.filter((skill) => skill.tags.includes(slug))

  it('renders every skill in the catalogue', () => {
    render(<SkillsPage initialCatalog={catalog} />)
    expect(skillRows()).toHaveLength(catalog.skills.length)
  })

  it('marks exactly the skills this workspace runs', () => {
    render(<SkillsPage initialCatalog={catalog} />)
    const installed = catalog.skills.filter((skill) => skill.installed).length
    expect(screen.getAllByText('In use')).toHaveLength(installed)
  })

  it('links each row to its ui-skills page and carries the install command', () => {
    render(<SkillsPage initialCatalog={catalog} />)

    const skill = catalog.skills.find((s) => s.name === 'emil-design-eng')
    expect(skill).toBeTruthy()

    const row = screen.getByRole('link', { name: /emil-design-eng/ })
    expect(row.getAttribute('href')).toBe(skillUrl(skill!))
    expect(row.getAttribute('title')).toBe(installCommand(skill!))
  })

  it('narrows the list to the skills carrying a tag', () => {
    render(<SkillsPage initialCatalog={catalog} />)

    const tag = catalog.tags.find((t) => t.slug === 'video')!
    const expected = skillsWithTag(tag.slug)
    expect(expected.length).toBeGreaterThan(0)
    expect(expected.length).toBeLessThan(catalog.skills.length)

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${tag.label}`) }),
    )

    expect(skillRows()).toHaveLength(expected.length)
  })

  it('narrows the list by search text', () => {
    render(<SkillsPage initialCatalog={catalog} />)

    const needle = 'wcag'
    const expected = catalog.skills.filter((skill) =>
      `${skill.name} ${skill.repo} ${skill.description}`
        .toLowerCase()
        .includes(needle),
    )
    expect(expected.length).toBeGreaterThan(0)

    fireEvent.change(screen.getByLabelText('Search skills'), {
      target: { value: needle },
    })

    expect(skillRows()).toHaveLength(expected.length)
  })

  it('is not in the dock', () => {
    expect(NAV_ITEMS.map((item) => item.href)).not.toContain('/skills')
  })
})
