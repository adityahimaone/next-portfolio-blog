import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/features/booth/page-header'
import {
  INSTALLED_COUNT,
  SKILL_COUNT,
  SKILL_GROUPS,
  SKILLS_SOURCE,
  installCommand,
  skillUrl,
} from '../constants/catalogue'
import styles from '../skills.module.css'

/**
 * /skills — the skills worth installing, grouped by what they are for.
 *
 * A server component: nothing here is interactive, the rows are plain anchors,
 * so the page ships no client JavaScript of its own. `PageHeader` is the one
 * client import, and it is the same heading every booth route opens with.
 */
export function SkillsPage() {
  return (
    <main className={styles.page} id="main-content">
      <PageHeader
        index="04"
        eyebrow="Skills"
        title="Skills worth installing."
        description="Agent skills I have actually run, plus the ones from the directory that are worth the install. Grouped by what they are for."
        hint={
          <>
            <ArrowUpRight size={14} aria-hidden="true" />
            {SKILL_COUNT} listed · {INSTALLED_COUNT} in use
          </>
        }
      />

      <div className={styles.body}>
        <p className={styles.source}>
          <span>Sourced from the agent skills directory.</span>
          <a
            href={SKILLS_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            skills.sh
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </p>

        {SKILL_GROUPS.map((group) => (
          <section
            key={group.title}
            className={styles.group}
            style={{ ['--led' as string]: group.hue }}
          >
            <div className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <span className={styles.groupCount}>
                {group.skills.length} skills
              </span>
            </div>

            <ul className={styles.rowList}>
              {group.skills.map((skill, index) => (
                <li key={`${skill.repo}/${skill.name}`}>
                  <a
                    href={skillUrl(skill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={installCommand(skill)}
                    className={styles.row}
                  >
                    <span className={styles.num}>{index + 1}</span>

                    <span className={styles.name}>
                      <span className={styles.nameText}>
                        <span className={styles.nameLabel}>{skill.name}</span>
                        {skill.installed && (
                          <span className={styles.installed}>In use</span>
                        )}
                      </span>
                      <span className={styles.repo}>{skill.repo}</span>
                      <span className={styles.desc}>{skill.description}</span>
                    </span>

                    <span className={styles.meta}>
                      <span className={styles.installs}>
                        {skill.installs} installs
                      </span>
                    </span>

                    <ArrowUpRight
                      size={14}
                      className={styles.arrow}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.footNote}>
          Install any of them with{' '}
          <code className={styles.footCode}>
            npx skills add https://github.com/&lt;owner&gt;/&lt;repo&gt; --skill
            &lt;name&gt;
          </code>
          . Hover a row for the exact command.
        </p>
      </div>
    </main>
  )
}
