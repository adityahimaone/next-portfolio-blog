'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { CATALOG_V2 } from '../constants'

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export function CatalogSection() {
  return (
    <section
      id="catalog"
      className="px-6 py-20 md:px-12 md:py-28"
      style={{ borderTop: '1px solid var(--v2-border)' }}
      aria-labelledby="v2-catalog-heading"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <motion.header {...fade} className="md:col-span-3">
          <div className="v2-mono mb-3" style={{ color: 'var(--v2-accent)' }}>
            CATALOG
          </div>
          <h2
            id="v2-catalog-heading"
            className="v2-display"
            style={{
              fontSize: 'var(--v2-step-2)',
              lineHeight: 1.1,
              fontWeight: 500,
            }}
          >
            Selected releases.
          </h2>
          <p
            className="mt-4 max-w-[32ch] text-sm leading-relaxed"
            style={{ color: 'var(--v2-foreground-muted)' }}
          >
            A curated set — corporate, web3, and personal projects.
          </p>
        </motion.header>

        <ul className="grid grid-cols-1 gap-8 md:col-span-9 md:grid-cols-2 md:gap-10">
          {CATALOG_V2.map((release, i) => (
            <motion.li
              key={release.id}
              {...fade}
              transition={{
                duration: 0.4,
                delay: 0.05 * i,
                ease: 'easeOut',
              }}
            >
              <a
                href={release.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                aria-label={`${release.title} — visit project`}
              >
                <article className="v2-card v2-grain">
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden"
                    style={{
                      borderBottom: '1px solid var(--v2-border)',
                      backgroundColor: 'var(--v2-muted)',
                    }}
                  >
                    <Image
                      src={release.image}
                      alt={`${release.title} cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      unoptimized={release.image.startsWith('http')}
                    />
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <span
                        className="v2-mono"
                        style={{ color: 'var(--v2-accent)' }}
                      >
                        {release.catalogNumber}
                      </span>
                      <span
                        className="v2-mono"
                        style={{ color: 'var(--v2-foreground-muted)' }}
                      >
                        {release.year}
                      </span>
                    </div>

                    <h3
                      className="v2-display mt-3"
                      style={{
                        fontSize: 'var(--v2-step-1)',
                        lineHeight: 1.15,
                        fontWeight: 500,
                      }}
                    >
                      {release.title}
                    </h3>

                    <div
                      className="v2-mono mt-1"
                      style={{ color: 'var(--v2-foreground-muted)' }}
                    >
                      {release.genre}
                    </div>

                    <p
                      className="mt-3 line-clamp-3 text-sm leading-relaxed"
                      style={{ color: 'var(--v2-foreground)' }}
                    >
                      {release.description}
                    </p>

                    <div
                      className="v2-mono mt-5 inline-flex items-center gap-2 transition-colors"
                      style={{ color: 'var(--v2-foreground)' }}
                    >
                      <span className="border-b border-current pb-0.5">
                        Listen / view
                      </span>
                      <span aria-hidden>→</span>
                    </div>
                  </div>
                </article>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default CatalogSection
