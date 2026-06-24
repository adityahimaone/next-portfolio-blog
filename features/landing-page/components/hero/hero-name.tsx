'use client'

import { m as motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface HeroNameProps {
  name: string
  subtitle?: string
  role?: string
  baseDelay?: number
}

export function HeroName({ name, subtitle, role, baseDelay = 0 }: HeroNameProps) {
  const characters = name.split('')

  return (
    <div className="relative z-20 flex flex-col items-center lg:items-start select-none px-4">
      <motion.h1
        className="flex overflow-hidden justify-center lg:justify-start"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.04,
              delayChildren: baseDelay,
            },
          },
        }}
      >
        {characters.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className={cn(
              'inline-block font-[family-name:var(--font-syne)] font-[800] tracking-[-0.04em] leading-[0.85] uppercase',
              'text-[clamp(3rem,12vw,6.5rem)] lg:text-[clamp(4.2rem,7.5vw,7.8rem)] xl:text-[clamp(5rem,8vw,10rem)]',
              'text-zinc-900 dark:text-zinc-50',
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
          transition={{ duration: 0.7, delay: baseDelay + 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'mt-2 font-[family-name:var(--font-jetbrains-mono)] text-[clamp(0.75rem,2vw,1.5rem)] font-medium tracking-[0.35em] uppercase',
            'text-amber-600 dark:text-amber-400',
          )}
        >
          {subtitle}
        </motion.p>
      )}

      {role && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: baseDelay + 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'mt-4 font-[family-name:var(--font-jetbrains-mono)] text-[clamp(0.6rem,1vw,0.85rem)] tracking-[0.2em] uppercase',
            'text-zinc-500 dark:text-zinc-500',
          )}
        >
          {role}
        </motion.p>
      )}
    </div>
  )
}
