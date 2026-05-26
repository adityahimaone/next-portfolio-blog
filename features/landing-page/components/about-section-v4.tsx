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
      className="relative py-24 px-6 md:px-12 lg:px-20"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left column — Illustration */}
          <div className="flex justify-center md:justify-start">
            <ParallaxLayer speed={0.12} direction="up" className="flex justify-center">
              <div
                className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #E8E7E3 0%, #C4C3B6 100%)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
                }}
              >
                <span
                  className="text-[var(--color-ink)] font-display text-base md:text-lg tracking-wide opacity-40"
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
              className="text-[10px] font-ui uppercase tracking-[0.2em] text-[var(--color-accent-grey)] mb-4"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4 }}
            >
              ABOUT ME
            </motion.span>

            {/* Heading */}
            <motion.h2
              className="font-display text-[clamp(36px,5vw,48px)] text-[var(--color-ink)] leading-[1.05] mb-5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Aditya Himawan
            </motion.h2>

            {/* Body text */}
            <motion.div
              className="max-w-[440px] space-y-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-[14px] font-ui text-[var(--color-ink)] leading-[1.6]">
                Saya Aditya Himawan, frontend developer berbasis di Jakarta.
                Tiga tahun lebih membangun antarmuka web yang terasa hidup —
                dari dashboard internal sampai produk consumer-facing.
                Fokus utama: React ecosystem, TypeScript, dan design systems
                yang scalable.
              </p>
              <p className="text-[14px] font-ui text-[var(--color-ink)] leading-[1.6]">
                Pendekatan kerja saya: setiap pixel punya alasan, setiap
                interaction harus terasa intentional. Saya percaya engineering
                dan design bukan dua dunia terpisah — keduanya harus berjalan
                bersama untuk menghasilkan produk yang benar-benar berguna.
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 gap-3 mt-8"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
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
