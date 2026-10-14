import type { Metadata } from 'next'
import { SkillsPage } from '@/features/skills'
import { SKILL_GROUPS, skillUrl } from '@/features/skills'
import { breadcrumbList, itemList, JsonLd } from '@/lib/structured-data'

export const metadata: Metadata = {
  // The root layout appends " | Aditya Himawan", so the suffix is not repeated
  // here.
  title: 'Recommended Agent Skills',
  description:
    'Agent skills worth installing — design and motion, engineering workflow, tooling, video and mobile — curated from the skills.sh directory.',
  alternates: { canonical: '/skills' },
}

export default function Page() {
  // Only the linked rows, in list order. The descriptions are the same ones the
  // page prints, so the markup describes what is actually on it.
  const jsonLd = itemList({
    name: 'Recommended Agent Skills',
    description:
      'Agent skills worth installing, curated from the skills.sh directory.',
    startAt: 1,
    items: SKILL_GROUPS.flatMap((group) =>
      group.skills.map((skill) => ({
        name: skill.name,
        url: skillUrl(skill),
        description: skill.description,
      })),
    ),
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
      <SkillsPage />
    </>
  )
}
