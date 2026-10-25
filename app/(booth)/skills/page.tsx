import type { Metadata } from 'next'
import { SkillsPage } from '@/features/skills'
import { skillUrl } from '@/features/skills'
import { breadcrumbList, itemList, JsonLd } from '@/lib/structured-data'
import { readSkills } from '@/lib/skills'

export const metadata: Metadata = {
  // The root layout appends " | Aditya Himawan", so the suffix is not repeated
  // here.
  title: 'Recommended Agent Skills',
  description:
    'The ui-skills.com directory in one place — 439 agent skills for design engineering, tagged and filterable by what each one is for.',
  alternates: { canonical: '/skills' },
}

export default async function Page() {
  const catalog = await readSkills()

  // Only the linked rows, in list order. The descriptions are the same ones the
  // page prints, so the markup describes what is actually on it.
  const jsonLd = itemList({
    name: 'Recommended Agent Skills',
    description:
      'Agent skills worth installing, tagged from the ui-skills.com directory.',
    startAt: 1,
    items: catalog.skills.map((skill) => ({
      name: skill.name,
      url: skillUrl(skill),
      description: skill.description,
    })),
  })

  const breadcrumbs = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Bookmarks', path: '/bookmarks' },
    { name: 'Skills', path: '/skills' },
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />
      <SkillsPage initialCatalog={catalog} />
    </>
  )
}
