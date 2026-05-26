'use client'

import { motion } from 'motion/react'
import { ParallaxLayer } from './parallax-layer'
import { StatsCard } from './stats-card'

const stats = [
  { number: '3+', label: 'Years', sublabel: 'Experience' },
  { number: '10+', label: 'Projects', sublabel: 'Delivered' },
  { number: 'IDX', label: 'Trader', sublabel: 'Stock Market' },
  { number: '∞', label: 'Always', sublabel: 'Building' },
]

export function AboutSectionV4() {
  return (
    <section
      id="about"
      className="relative py-[168px] px-6 md:px-12 lg:px-24"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-[var(--section-gap)] items-center">
          {/* Left column — Illustration */}
          <div className="flex justify-center md:justify-start">
            <ParallaxLayer speed={0.3} direction="up" className="flex justify-center">
              <div
                className="w-[240px] h-[240px] md:w-[480px] md:h-[480px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #595855 0%, #1A1A1A 100%)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
                }}
              >
                <span
                  className="text-[var(--color-off-white)] font-display text-lg md:text-xl tracking-wide opacity-60"
                >
                  PORTRAIT
                </span>
              </div>
            </ParallaxLayer>
          </div>

          {/* Right column — Content */}
          <div className="flex flex-col">
            {/* Label */}
            <motion.span
              className="text-[11px] font-ui uppercase tracking-[0.2em] text-[var(--color-accent-grey)] mb-6"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              ABOUT ME
            </motion.span>

            {/* Heading */}
            <motion.h2
              className="font-display text-[var(--text-xl)] text-[var(--color-ink)] leading-[1.1] mb-8"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Aditya Himawan
            </motion.h2>

            {/* Body text */}
            <motion.div
              className="max-w-[480px] space-y-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-[var(--text-sm)] font-ui text-[var(--color-ink)] leading-[1.6]">
                Saya Aditya Himawan, frontend developer berbasis di Jakarta.
                Tiga tahun lebih membangun antarmuka web yang terasa hidup —
                dari dashboard internal sampai produk consumer-facing.
                Fokus utama: React ecosystem, TypeScript, dan design systems
                yang scalable.
              </p>
              <p className="text-[var(--text-sm)] font-ui text-[var(--color-ink)] leading-[1.6]">
                Pendekatan kerja saya: setiap pixel punya alasan, setiap
                interaction harus terasa intentional. Saya percaya engineering
                dan design bukan dua dunia terpisah — keduanya harus berjalan
                bersama untuk menghasilkan produk yang benar-benar berguna.
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 gap-4 mt-12"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {stats.map((stat) => (
                <StatsCard
                  key={stat.label}
                  number={stat.number}
                  label={stat.label}
                  sublabel={stat.sublabel}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
