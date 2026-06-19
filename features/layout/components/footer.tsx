'use client'

import { motion, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowUpRight,
  Disc3,
  Activity
} from 'lucide-react'
import { SOCIAL_LINKS, FOOTER_NAVIGATION, TECH_STACK } from '../constants'
import { cn } from '@/lib/utils'

const AudioJackConnect = ({ name, href }: { name: string; href: string }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-4 bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 p-3 px-5 rounded-xl relative overflow-hidden group select-none shadow-sm transition-all"
    >
      {/* Audio Socket / Jack Circle */}
      <div className="relative w-8 h-8 rounded-full bg-zinc-300 dark:bg-black border border-zinc-400 dark:border-zinc-850 flex items-center justify-center shadow-inner">
        <div className="w-4 h-4 rounded-full bg-zinc-400 dark:bg-[#111] border border-zinc-450 dark:border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,1)] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-550 dark:bg-zinc-950" />
        </div>
        {/* LED next to socket */}
        <div className={cn(
          "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full transition-all duration-300",
          isHovered ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" : "bg-zinc-400 dark:bg-zinc-800"
        )} />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold text-zinc-800 dark:text-white uppercase tracking-wider">{name}</span>
        <span className="text-[8px] font-mono text-zinc-500 dark:text-zinc-555 uppercase">Input Socket</span>
      </div>

      {/* Audio TRS Cable Plug sliding in on hover */}
      <motion.div
        className="absolute left-[-50px] pointer-events-none z-20"
        animate={{ x: isHovered ? 52 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <svg className="w-10 h-6 overflow-visible" viewBox="0 0 40 24">
          <rect x="0" y="10" width="16" height="4" fill="url(#metalGrad)" rx="0.5" />
          <line x1="5" y1="10" x2="5" y2="14" stroke="#18181b" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="14" stroke="#18181b" strokeWidth="1" />
          <rect x="16" y="7" width="18" height="10" fill="#27272a" rx="1.5" stroke="#3f3f46" strokeWidth="0.5" />
          <rect x="34" y="9" width="6" height="6" fill="#18181b" rx="0.5" />
          <defs>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </a>
  )
}

const ScrollMasterFader = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight <= 0) return
      const progress = (window.scrollY / totalHeight) * 100
      setScrollPercentage(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 relative select-none">
      <span className="font-mono text-[7px] font-black text-zinc-500 dark:text-zinc-555 uppercase tracking-widest">Master Out</span>
      
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="relative flex h-36 w-10 justify-center rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950 py-3 shadow-inner cursor-pointer group"
      >
        {/* Fader slot */}
        <div className="absolute top-3 bottom-3 w-0.5 bg-zinc-300 dark:bg-zinc-850" />
        
        {/* Mechanical Fader Cap */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-6 h-9 rounded border border-zinc-450 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 shadow-lg flex flex-col justify-between py-1 active:scale-95 transition-transform"
          style={{ bottom: `calc(${scrollPercentage}% - 18px)` }}
        >
          <div className="w-full h-0.5 bg-red-500" />
          <div className="w-full h-[1px] bg-zinc-300 dark:bg-zinc-800" />
          <div className="w-full h-[1px] bg-zinc-300 dark:bg-zinc-800" />
          <div className="w-full h-0.5 bg-red-500" />
        </motion.div>
      </div>
    </div>
  )
}

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.1 })

  return (
    <footer
      ref={containerRef}
      className="relative z-10 border-t border-zinc-300 bg-zinc-200/40 py-16 dark:border-zinc-900 dark:bg-zinc-950/80 transition-colors duration-300"
    >
      {/* Console lines background */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-30 [background-size:16px_16px] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Block: Logo, Info & TRS Headphone Plugs (Col Span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-6 lg:col-span-5"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-300 dark:bg-zinc-900 shadow-inner">
                <Disc3 className="h-5 w-5 animate-spin-slow text-amber-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">Aditya Himaone</span>
                <span className="text-[8px] font-mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Console Output Strip</span>
              </div>
            </div>

            <p className="max-w-xs text-left text-xs leading-relaxed text-zinc-700 dark:text-zinc-400">
              Precise frontend systems engineered with care. Designed with modular hardware aesthetics.
            </p>

            {/* Social Patch Jacks */}
            <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
              <span className="font-mono text-[7px] text-zinc-550 dark:text-zinc-500 font-extrabold uppercase tracking-widest text-left">External Patch Out</span>
              <AudioJackConnect 
                name="Github" 
                href={SOCIAL_LINKS.find(s => s.name === 'GitHub')?.href || 'https://github.com'} 
              />
              <AudioJackConnect 
                name="LinkedIn" 
                href={SOCIAL_LINKS.find(s => s.name === 'LinkedIn')?.href || 'https://linkedin.com'} 
              />
            </div>
          </motion.div>

          {/* Center Block: Sub-Menus & Tech Matrix (Col Span 5) */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5 lg:gap-12">
            
            {/* DAW Navigation Map */}
            <div className="flex flex-col items-start gap-4">
              <span className="font-mono text-[8px] text-zinc-550 dark:text-zinc-500 font-black uppercase tracking-wider">Console Mapping</span>
              <div className="flex flex-col items-start gap-3">
                {FOOTER_NAVIGATION.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Signal Processing Matrix (Tech List) */}
            <div className="flex flex-col items-start gap-4">
              <span className="font-mono text-[8px] text-zinc-550 dark:text-zinc-500 font-black uppercase tracking-wider">Logic Modules</span>
              <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-zinc-350/50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/80 px-2 py-0.5 text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-400 uppercase shadow-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: mechanical Scroll Master Fader (Col Span 2) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center lg:col-span-2"
          >
            <ScrollMasterFader />
          </motion.div>
        </div>

        {/* Lower console footer copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-300 dark:border-zinc-900 pt-8 sm:flex-row text-xs text-zinc-650 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} ADITYAHIMAONE</span>
            <span>•</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              System Console OK
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="#"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
