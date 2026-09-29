'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { NAV_ITEMS } from './nav-items'
import { SOCIAL_LINKS } from './footer-links'
import styles from './footer.module.css'

/**
 * The booth's own footer.
 *
 * Deliberately not the landing page's: that one is a 3u rack panel with a
 * tangle canvas, and it belongs to the home page's hardware language. This is
 * the archive furniture — the same silkscreen labels, hairline rules and glass
 * control layer as the dock, the sidebar and the page headers, so the three
 * archive routes close the way they open.
 *
 * Rendered by BoothShell rather than by each page, so /projects, /blog,
 * /bookmarks and the blog reader all get it without repeating themselves, and
 * the landing page keeps its own.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIndex}>07</span>
            <span>Open channel</span>
          </p>

          <a
            href="mailto:adityahimaone@gmail.com?subject=Hello%20Aditya"
            className={styles.email}
          >
            adityahimaone@gmail.com
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>

          <p className={styles.note}>
            Frontend work, design engineering, and the occasional hard interface
            problem. Replies within a couple of days.
          </p>
        </div>

        <div className={styles.columns}>
          <nav className={styles.col} aria-label="Footer navigation">
            <p className={styles.colTitle}>Browse</p>
            <ul className={styles.list}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Elsewhere">
            <p className={styles.colTitle}>Elsewhere</p>
            <ul className={styles.list}>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={styles.link}
                    target={
                      link.href.startsWith('mailto:') ? undefined : '_blank'
                    }
                    rel={
                      link.href.startsWith('mailto:')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Two rules with the year between them, the way the page headers set
          their index and eyebrow. Keeps the baseline quiet without adding
          another surface. */}
      <div className={styles.base}>
        <span className={styles.hair} aria-hidden="true" />
        <span className={styles.year}>© {year}</span>
        <span className={styles.hair} aria-hidden="true" />
      </div>
    </footer>
  )
}
