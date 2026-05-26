'use client'

import { motion } from 'motion/react'
import { ProjectCardV4 } from './project-card-v4'
import { PROJECTS_SHOWCASE } from '../constants'

const projectsV4 = PROJECTS_SHOWCASE.map((p, i) => ({
  number: String(i + 1).padStart(2, '0'),
  title: p.title,
  category: p.genre?.split(' / ')[0] || '',
  year: p.year || '2024',
  url: p.url,
}))

export function ProjectsSectionV4() {
  const featured = projectsV4[0]
  const rest = projectsV4.slice(1)

  return (
    <section
      id="work"
      className="relative py-[168px] px-6 md:px-12 lg:px-24"
      style={{ backgroundColor: 'var(--color-dark-surface)' }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-20">
          <motion.span
            className="block text-[11px] font-ui uppercase tracking-[0.2em] text-[var(--color-accent-grey)] mb-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            SELECTED WORKS
          </motion.span>
          <motion.h2
            className="font-display text-[clamp(48px,8vw,94px)] text-[var(--color-off-white)] leading-[1.0]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Featured Releases
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
          {/* Featured — full width */}
          {featured && (
            <motion.div
              className="col-span-1 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ProjectCardV4
                number={featured.number}
                title={featured.title}
                category={featured.category}
                year={featured.year}
                url={featured.url}
                featured
              />
            </motion.div>
          )}

          {/* Regular cards — 2 per row on desktop, 1 on mobile */}
          {rest.map((project, index) => (
            <motion.div
              key={project.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <ProjectCardV4
                number={project.number}
                title={project.title}
                category={project.category}
                year={project.year}
                url={project.url}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
