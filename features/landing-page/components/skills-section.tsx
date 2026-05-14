'use client'

import { StageLabel, InventoryGrid } from '@/components/ui'

const INVENTORY_ITEMS = [
  { name: 'REACT', level: 'MASTER', icon: '⚛️' },
  { name: 'NEXT.JS', level: 'MASTER', icon: '▲' },
  { name: 'TYPESCRIPT', level: 'EXPERT', icon: 'TS' },
  { name: 'TAILWIND', level: 'MASTER', icon: '🎨' },
  { name: 'TANSTACK', level: 'EXPERT', icon: '📊' },
  { name: 'R3F', level: 'APPRENTICE', icon: '🕶️' },
  { name: 'PHP', level: 'INTERMEDIATE', icon: '🐘' },
  { name: 'JQUERY', level: 'VETERAN', icon: '💾' },
  { name: 'GIT', level: 'MASTER', icon: '🌿' },
  { name: 'FIGMA', level: 'EXPERT', icon: '✏️' },
  { name: 'VITE', level: 'EXPERT', icon: '⚡' },
  { name: 'DOCKER', level: 'INTERMEDIATE', icon: '🐳' },
]

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative py-32 bg-gray-deep"
      data-stage-num="03"
      data-stage-name="INVENTORY"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <StageLabel num="03" name="INVENTORY" glowing />

        <div className="mt-8">
          <h2 className="t-heading-l mb-6 text-white-bone">INVENTORY</h2>
          <p className="t-body-m mb-12 max-w-2xl text-white-dim">
            Tools and technologies I use to build digital experiences.
            Each item has a level and rarity.
          </p>

          <InventoryGrid items={INVENTORY_ITEMS} />
        </div>
      </div>
    </section>
  )
}
