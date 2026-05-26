'use client'

import { motion } from 'motion/react'
import { ParallaxLayer } from './parallax-layer'
import { ExperienceCard } from './experience-card'
import { EXPERIENCES } from '../constants'

export function ExperienceSectionV4() {
  return (
    <section
      id="experience"
      className="relative py-24 px-6 md:px-12 lg:px-20"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.h2
          className="font-display text-[clamp(40px,7vw,72px)] text-[var(--color-ink)] text-center mb-16 leading-[1.0]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          Career
        </motion.h2>

        {/* Timeline container */}
        <div className="relative">
          {/* Central vertical line — desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--color-slate)] transform -translate-x-1/2" />

          {/* Parallax background layer */}
          <ParallaxLayer speed={0.06} direction="up" className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(185, 28, 28, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
              }}
            />
          </ParallaxLayer>

          {/* Timeline entries */}
          <div className="relative space-y-8 md:space-y-12">
            {EXPERIENCES.map((exp, index) => (
              <ExperienceCard
                key={exp.id}
                role={exp.role}
                company={exp.company}
                period={exp.period}
                location={exp.location}
                description={
                  exp.isGroup
                    ? exp.items?.map((item) => `${item.role} at ${item.company}`)
                    : exp.description
                }
                side={index % 2 === 0 ? 'left' : 'right'}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
