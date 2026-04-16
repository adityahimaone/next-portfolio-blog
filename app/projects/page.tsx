import { getRepos } from '@/features/projects/lib/github'
import { FEATURED_PROJECTS } from '@/features/projects/constants'
import { ProjectsPage } from '@/features/projects'

export default async function Page() {
  const repos = await getRepos()

  return (
    <ProjectsPage repos={repos} featuredProjects={FEATURED_PROJECTS} />
  )
}
