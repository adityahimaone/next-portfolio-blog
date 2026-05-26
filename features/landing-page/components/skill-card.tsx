'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Minus } from 'lucide-react'

interface SkillItem {
  name: string
  proficiency: number
}

interface SkillCardProps {
  category: string
  illustrationStyle: string
  skills: SkillItem[]
}

function ProficiencyDots({ proficiency }: { proficiency: number }) {
  const dots = 5
  const filled = Math.round((proficiency / 5) * dots)

  return (
    <div className="flex gap-1">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
            i < filled
              ? 'bg-[var(--color-off-white)]'
              : 'bg-[var(--color-off-white)]/30'
          }`}
        />
      ))}
    </div>
  )
}

export function SkillCard({
  category,
  illustrationStyle,
  skills,
}: SkillCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getIllustrationGradient = () => {
    switch (illustrationStyle) {
      case 'botanical':
        return 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
      case 'architectural':
        return 'linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%)'
      case 'cartographic':
        return 'linear-gradient(135deg, #252525 0%, #151515 100%)'
      default:
        return 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
    }
  }

  return (
    <motion.div
      className="flex flex-col h-full bg-[var(--color-dark-card)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-off-white)]/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ borderColor: 'var(--color-off-white)/20' }}
    >
      {/* Illustration placeholder */}
      <div
        className="h-[280px] w-full flex items-center justify-center text-[var(--color-off-white)]/40 font-display text-sm"
        style={{ background: getIllustrationGradient() }}
      >
        {illustrationStyle.charAt(0).toUpperCase() + illustrationStyle.slice(1)}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-8">
        {/* Category label */}
        <div className="text-[var(--text-xs)] font-ui uppercase tracking-[0.15em] text-[var(--color-accent-grey)] mb-4">
          {category}
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-off-white)]/10 mb-6" />

        {/* Skills list */}
        <div className="space-y-4 flex-1">
          {skills.map((skill) => (
            <div key={skill.name} className="flex items-center justify-between">
              <span className="text-[var(--text-sm)] font-ui text-[var(--color-off-white)]">
                {skill.name}
              </span>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProficiencyDots proficiency={skill.proficiency} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Expand/collapse button */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-off-white)] text-[var(--color-off-white)] rounded-[var(--radius-button)] hover:bg-[var(--color-off-white)]/5 transition-colors duration-200 text-[var(--text-xs)] font-ui uppercase tracking-[0.1em]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {expanded ? (
            <>
              <Minus size={14} />
              Hide
            </>
          ) : (
            <>
              <Plus size={14} />
              Show
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
