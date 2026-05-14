'use client'

import { StageLabel, QuestCard } from '@/components/ui'

const QUESTS = [
  {
    title: 'BISADAYA PLATFORM',
    status: 'IN_PROGRESS',
    difficulty: 'HARD',
    description: 'Enterprise HR platform with candidate screening, job posting, and analytics.',
    tech: ['NEXT.JS', 'REACT', 'TAILWIND', 'TANSTACK'],
    link: 'https://bisadaya.id',
  },
  {
    title: 'PORTFOLIO v26',
    status: 'COMPLETED',
    difficulty: 'MEDIUM',
    description: 'Retro console-themed portfolio with R3F mascot and CRT effects.',
    tech: ['NEXT.JS', 'R3F', 'TAILWIND'],
    link: '/',
  },
  {
    title: 'MARKET ALPHA SCOUT',
    status: 'COMPLETED',
    difficulty: 'HARD',
    description: 'IDX stock analysis automation with Google Sheets sync and Telegram alerts.',
    tech: ['PYTHON', 'GSHEETS', 'TELEGRAM'],
    link: null,
  },
]

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative py-32 bg-black-true"
      data-stage-num="04"
      data-stage-name="QUEST"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <StageLabel num="04" name="QUEST LOG" glowing />

        <div className="mt-8">
          <h2 className="t-heading-l mb-6 text-white-bone">QUEST LOG</h2>
          <p className="t-body-m mb-12 max-w-2xl text-white-dim">
            Projects I've shipped. Some are still in progress, others are completed.
          </p>

          <div className="space-y-6">
            {QUESTS.map((quest) => (
              <QuestCard key={quest.title} {...quest} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
