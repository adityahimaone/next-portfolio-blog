'use client'

import { m as motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface HeroNameProps {
  name: string
  subtitle?: string
  role?: string
  baseDelay?: number
}

export function HeroName({
  name,
  subtitle,
  role,
  baseDelay = 0,
}: HeroNameProps) {
  const characters = name.split('')

  return (
    <div className="relative z-20 flex flex-col items-center px-4 text-center select-none">
      {/* Massive Geometric Syne Headline */}
      <motion.h1
        className="flex justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.04,
              delayChildren: baseDelay + 0.1,
            },
          },
        }}
      >
        {characters.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className={cn(
              'inline-block font-[family-name:var(--font-syne)] leading-[0.85] font-extrabold tracking-tighter uppercase',
              'text-[clamp(3.5rem,14vw,8.5rem)] lg:text-[clamp(5.5rem,11vw,12.5rem)]',
              'text-foreground',
            )}
            variants={{
              hidden: { opacity: 0, y: 60, filter: 'blur(8px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: baseDelay + 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            'mt-3 font-[family-name:var(--font-syne)] text-[clamp(0.75rem,2.2vw,1.6rem)] font-bold tracking-[0.3em] uppercase',
            'text-primary',
          )}
        >
          {subtitle}
        </motion.p>
      )}

      {role && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: baseDelay + 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            'mt-5 font-[family-name:var(--font-whyte-inktrap-mono)] text-[clamp(0.6rem,1vw,0.8rem)] font-medium tracking-[0.15em] uppercase',
            'text-slate dark:text-ash/60',
          )}
        >
          {role}
        </motion.p>
      )}
    </div>
  )
}
