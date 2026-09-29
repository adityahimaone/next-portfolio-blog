import { Github } from 'lucide-react'
import type { FeaturedProject } from '../constants'
import type { GitHubRepo } from '../lib/github'
import { ProjectCard } from '../components/project-card'
import { SessionLog } from '../components/session-log'
import { SignalArchiveHeader, TopBar, Footer } from '@/features/layout'
import styles from '../projects.module.css'

interface ProjectsPageProps {
  repos: GitHubRepo[]
  featuredProjects: FeaturedProject[]
  /** Distinguishes an empty GitHub feed from a failed one. */
  feedFailed?: boolean
}

export function ProjectsPage({
  repos,
  featuredProjects,
  feedFailed = false,
}: ProjectsPageProps) {
  const featured = featuredProjects.map((project) => ({
    project,
    repo: repos.find((r) => r.name === project.githubSlug),
  }))

  const recent = repos
    .filter((r) => !featuredProjects.some((fp) => fp.githubSlug === r.name))
    .slice(0, 8)

  return (
    <>
      <TopBar />
      <main id="main-content" className={styles.main}>
        <SignalArchiveHeader
          activeSection="projects"
          meterCount={featuredProjects.length}
          label="Output 01 / Released work"
          title="Shipped work"
          description="Production frontend systems, interfaces, and experiments built from architecture through interaction."
        />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>A-side</h2>
            <span className={`${styles.sectionCount} silkscreen`}>
              {featured.length} releases
            </span>
          </div>
          <div className={styles.shelf}>
            {featured.map(({ project, repo }, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                repo={repo}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Session log</h2>
            <span className={`${styles.sectionCount} silkscreen`}>
              recent pushes
            </span>
            <div className={styles.sectionAside}>
              <a
                href="https://github.com/adityahimaone"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.githubLink} glass-1`}
              >
                <Github size={15} aria-hidden="true" />
                All repositories
              </a>
            </div>
          </div>
          <SessionLog repos={recent} fetchFailed={feedFailed} />
        </section>
      </main>
      <Footer />
    </>
  )
}
