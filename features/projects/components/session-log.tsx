import { Star } from 'lucide-react'
import { formatRelative } from '@/lib/date'
import type { GitHubRepo } from '../lib/github'
import styles from '../projects.module.css'

interface SessionLogProps {
  repos: GitHubRepo[]
  /** Distinguishes "nothing pushed yet" from "the fetch failed". */
  fetchFailed?: boolean
}

/**
 * Recent pushes as a data table. It carries more per row than the previous
 * mini-card grid and reads differently from the releases above it (design.md §1).
 */
export function SessionLog({ repos, fetchFailed = false }: SessionLogProps) {
  if (repos.length === 0) {
    return (
      <div className={styles.logWrap}>
        <p className={styles.logEmpty}>
          {fetchFailed
            ? 'Session log unavailable — the last fetch from GitHub failed. The releases above are cached.'
            : 'No recent pushes to report.'}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.logWrap}>
      <table className={styles.log}>
        <caption className="sr-only">
          Recent repositories pushed to github.com/adityahimaone
        </caption>
        <thead className={styles.logHead}>
          <tr>
            <th scope="col">Name</th>
            <th scope="col" className={styles.colLang}>
              Language
            </th>
            <th scope="col" className={`${styles.colStars} ${styles.logNum}`}>
              Stars
            </th>
            <th scope="col" className={styles.logNum}>
              Pushed
            </th>
          </tr>
        </thead>
        <tbody className={styles.logBody}>
          {repos.map((repo) => (
            <tr key={repo.name}>
              <td className={styles.logCellName}>
                {repo.language && (
                  <span className={styles.logDot} aria-hidden="true" />
                )}
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.logName}
                >
                  {repo.name}
                </a>
              </td>
              <td className={`${styles.cellLang} ${styles.logText}`}>
                {repo.language ?? '—'}
              </td>
              <td className={`${styles.cellStars} ${styles.logNum}`}>
                {repo.stargazers_count > 0 ? (
                  <span className={styles.stat}>
                    <Star size={12} aria-hidden="true" />
                    {repo.stargazers_count}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className={styles.logNum}>
                {formatRelative(repo.pushed_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
