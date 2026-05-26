'use client'

import { motion } from 'motion/react'
import { ParallaxLayer } from './parallax-layer'
import { SkillCard } from './skill-card'

const skillsData = [
  {
    category: 'FRONTEND',
    illustrationStyle: 'botanical',
    skills: [
      { name: 'React', proficiency: 5 },
      { name: 'Next.js', proficiency: 5 },
      { name: 'TypeScript', proficiency: 4 },
      { name: 'Tailwind CSS', proficiency: 5 },
      { name: 'Framer Motion', proficiency: 4 },
    ],
  },
  {
    category: 'BACKEND',
    illustrationStyle: 'architectural',
    skills: [
      { name: 'PHP / Yii2', proficiency: 4 },
      { name: 'MariaDB', proficiency: 3 },
      { name: 'REST API', proficiency: 4 },
      { name: 'Python', proficiency: 3 },
      { name: 'Prisma', proficiency: 3 },
    ],
  },
  {
    category: 'SYSTEMS',
    illustrationStyle: 'cartographic',
    skills: [
      { name: 'Linux / VPS', proficiency: 4 },
      { name: 'Nginx / PM2', proficiency: 4 },
      { name: 'Docker', proficiency: 3 },
      { name: 'Git', proficiency: 5 },
      { name: 'CI/CD', proficiency: 3 },
    ],
  },
]

const parallaxSpeeds = [0.12, 0.14, 0.11]

export function SkillsSectionV4() {
  return (
    <section
      id="skills"
      className="relative py-24 px-6 md:px-12 lg:px-20"
      style={{ backgroundColor: 'var(--color-dark-surface)' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            className="block text-[10px] font-ui uppercase tracking-[0.2em] text-[var(--color-accent-grey)] mb-3"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            TECHNICAL ARSENAL
          </motion.span>
          <motion.h2
            className="font-display text-[clamp(40px,7vw,72px)] text-[var(--color-off-white)] leading-[1.0]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Craft
          </motion.h2>
        </div>

        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {skillsData.map((data, index) => (
            <ParallaxLayer
              key={data.category}
              speed={parallaxSpeeds[index]}
              direction="up"
            >
              <SkillCard
                category={data.category}
                illustrationStyle={data.illustrationStyle}
                skills={data.skills}
              />
            </ParallaxLayer>
          ))}
        </div>
      </div>
    </section>
  )
}
