import { memo } from 'react'
import Image from 'next/image'
import { ExternalLink, Github, Star } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import { releaseLabel } from '../constants'
import { formatRelative } from '@/lib/date'
import type { GitHubRepo } from '../lib/github'
import styles from '../projects.module.css'

interface ProjectCardProps {
  project: FeaturedProject
  repo?: GitHubRepo
  index?: number
}

/**
 * A release on the shelf: catalogue spine, credits, and a record that slides
 * out of the sleeve on hover (design.md §1).
 */
export const ProjectCard = memo(function ProjectCard({
  project,
  repo,
  index = 0,
}: ProjectCardProps) {
  const label = releaseLabel(index)
  const catalog = `AH-${String(index + 1).padStart(3, '0')}`
  const codeUrl = `https://github.com/adityahimaone/${project.githubSlug}`

  return (
    <article
      className={styles.sleeve}
      style={{ ['--record-label' as string]: label }}
    >
      <div className={styles.spine}>
        <span className={`${styles.catalog} silkscreen`}>{catalog}</span>
        <span className={styles.spineMark} aria-hidden="true" />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{project.name}</h3>
        <p className={styles.description}>{project.description}</p>
        <p className={styles.credits}>{project.tech.join(', ')}</p>

        {repo && (
          <div className={styles.stats}>
            {repo.stargazers_count > 0 && (
              <span className={styles.stat}>
                <Star size={13} aria-hidden="true" />
                {repo.stargazers_count}
              </span>
            )}
            {repo.language && (
              <span className={styles.stat}>
                <span className={styles.langDot} aria-hidden="true" />
                {repo.language}
              </span>
            )}
            {repo.pushed_at && (
              <span className={styles.stat}>
                pushed {formatRelative(repo.pushed_at)}
              </span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.action} glass-1`}
          >
            <Github size={15} aria-hidden="true" />
            View code
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.action} glass-1`}
            >
              <ExternalLink size={15} aria-hidden="true" />
              Live demo
            </a>
          )}
        </div>
      </div>

      <div className={styles.plate} aria-hidden="true">
        <div className={styles.tonearm} />
        <div className={styles.disc}>
          {project.image && (
            <div className={styles.discArt}>
              <Image
                src={project.image}
                alt=""
                width={160}
                height={160}
                unoptimized
              />
            </div>
          )}
          <span className={styles.discSpindle} />
        </div>
      </div>
    </article>
  )
})
