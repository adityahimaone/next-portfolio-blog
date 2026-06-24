'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

interface Star {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  pulsePhase: number
  color: string
}

export function StudioBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { scrollYProgress } = useScroll()
  // Smooth parallax shifts for meshes and trace layers
  const yMesh = useTransform(scrollYProgress, [0, 1], ['0%', '-3%'])
  const yTraces = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Canvas starfield animation for smooth, GPU-friendly drifting stardust
  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let stars: Star[] = []
    const starCount = 35

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      // Initialize or scale stars
      stars = Array.from({ length: starCount }, () => {
        const starColor = isDark
          ? Math.random() > 0.5
            ? 'rgba(225, 189, 255, '
            : 'rgba(247, 249, 250, '
          : Math.random() > 0.5
            ? 'rgba(175, 80, 255, '
            : 'rgba(127, 86, 217, '

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.6 + Math.random() * 1.2,
          speedX: (Math.random() - 0.5) * 0.05,
          speedY: (Math.random() - 0.5) * 0.05,
          alpha: Math.random(),
          targetAlpha: 0.3 + Math.random() * 0.7,
          pulseSpeed: 0.005 + Math.random() * 0.012,
          pulsePhase: Math.random() * Math.PI * 2,
          color: starColor,
        }
      })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1)
      const height = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, width, height)

      stars.forEach((star) => {
        // Drifting motion
        star.x += star.speedX
        star.y += star.speedY

        // Wrap around boundaries
        if (star.x < 0) star.x = width
        if (star.x > width) star.x = 0
        if (star.y < 0) star.y = height
        if (star.y > height) star.y = 0

        // Pulsing / Blinking logic
        star.pulsePhase += star.pulseSpeed
        const opacityOsc = Math.sin(star.pulsePhase)
        star.alpha = star.targetAlpha * (0.35 + 0.65 * (opacityOsc + 1) * 0.5)

        // Draw glowing aura for larger stars (only in dark mode for premium look)
        if (isDark && star.size > 1.2) {
          ctx.save()
          ctx.shadowBlur = 6
          ctx.shadowColor = 'rgba(175, 80, 255, 0.4)'
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size + 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(175, 80, 255, ${star.alpha * 0.15})`
          ctx.fill()
          ctx.restore()
        }

        // Draw star core
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `${star.color}${star.alpha})`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted, isDark])

  if (!mounted) {
    return (
      <div className="bg-bone-white dark:bg-void pointer-events-none fixed inset-0 z-0" />
    )
  }

  return (
    <div className="bg-background pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-500">
      {/* 1. Smooth Floating Cosmic Aurora Lights (Atmospheric Gradient Glow Nodes) */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
        style={{ y: yMesh, willChange: 'transform' }}
      >
        {/* Glow Node 1: Top Left (Iris Violet Blur) */}
        <div
          className="animate-cosmic-drift-1 absolute -top-[15%] -left-[10%] h-[80vw] w-[80vw] rounded-full opacity-65 mix-blend-screen blur-[120px]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(175, 80, 255, 0.12) 0%, rgba(175, 80, 255, 0) 70%)'
              : 'radial-gradient(circle, rgba(127, 86, 217, 0.035) 0%, rgba(127, 86, 217, 0) 70%)',
            willChange: 'transform',
          }}
        />

        {/* Glow Node 2: Bottom Right (Cosmic Plum / Pink Blur) */}
        <div
          className="animate-cosmic-drift-2 absolute -right-[10%] -bottom-[15%] h-[70vw] w-[70vw] rounded-full opacity-55 mix-blend-screen blur-[100px]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(225, 189, 255, 0.08) 0%, rgba(225, 189, 255, 0) 70%)'
              : 'radial-gradient(circle, rgba(175, 80, 255, 0.02) 0%, rgba(175, 80, 255, 0) 70%)',
            willChange: 'transform',
          }}
        />

        {/* Glow Node 3: Center Left (Deep Aubergine for depth) */}
        <div
          className="animate-cosmic-drift-3 absolute top-[25%] -left-[20%] h-[60vw] w-[60vw] rounded-full opacity-50 mix-blend-screen blur-[110px]"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(39, 22, 53, 0.3) 0%, rgba(39, 22, 53, 0) 75%)'
              : 'radial-gradient(circle, rgba(225, 189, 255, 0.02) 0%, rgba(225, 189, 255, 0) 75%)',
            willChange: 'transform',
          }}
        />
      </motion.div>

      {/* 2. Brushed Metal Texture Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(128,128,128,0.012) 1px, rgba(128,128,128,0.012) 2px)',
        }}
      />

      {/* 3. Film/Static Noise Overlay */}
      <div
        className="absolute inset-0 z-20 mix-blend-overlay"
        style={{
          backgroundImage: "url('/noise.png')",
          opacity: isDark ? 0.035 : 0.015,
        }}
      />

      {/* 4. Canvas-based Stardust Field (Liquid Drifting and Soft Blinking) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-30 opacity-70 dark:opacity-95"
      />

      {/* 5. PCB trace pattern with parallax translation */}
      <motion.div
        className="absolute inset-0 z-40"
        style={{
          y: yTraces,
          opacity: isDark ? 0.035 : 0.02,
          color: isDark ? 'var(--color-iris)' : 'var(--color-plum)',
          willChange: 'transform',
        }}
      >
        <svg
          className="h-[120%] w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="pcb-traces"
              x="0"
              y="0"
              width="240"
              height="240"
              patternUnits="userSpaceOnUse"
            >
              {/* Horizontal traces */}
              <line
                x1="0"
                y1="40"
                x2="80"
                y2="40"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="40"
                x2="80"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="80"
                y1="100"
                x2="160"
                y2="100"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Vertical traces */}
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="60"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="60"
                x2="120"
                y2="60"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="120"
                y1="60"
                x2="120"
                y2="160"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Additional trace path */}
              <line
                x1="160"
                y1="100"
                x2="160"
                y2="180"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="160"
                y1="180"
                x2="240"
                y2="180"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Junction dots */}
              <circle cx="80" cy="40" r="2.5" fill="currentColor" />
              <circle cx="80" cy="100" r="2.5" fill="currentColor" />
              <circle cx="40" cy="60" r="2.5" fill="currentColor" />
              <circle cx="120" cy="60" r="2.5" fill="currentColor" />
              <circle cx="120" cy="160" r="2" fill="currentColor" />
              <circle cx="160" cy="100" r="2.5" fill="currentColor" />
              <circle cx="160" cy="180" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcb-traces)" />
        </svg>
      </motion.div>

      {/* Vignette border framing */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 40%, rgba(9,9,9,0.3) 100%)'
            : 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.02) 100%)',
        }}
      />

      <style jsx global>{`
        /* Smooth Cosmic Gradient Drift animations (Hardware Accelerated via translate3d) */
        @keyframes cosmic-drift-1 {
          0%,
          100% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          33% {
            transform: translate3d(50px, -70px, 0) scale(1.08);
          }
          66% {
            transform: translate3d(-40px, 30px, 0) scale(0.92);
          }
        }
        @keyframes cosmic-drift-2 {
          0%,
          100% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          50% {
            transform: translate3d(-60px, 60px, 0) scale(1.1);
          }
        }
        @keyframes cosmic-drift-3 {
          0%,
          100% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          50% {
            transform: translate3d(40px, 30px, 0) scale(1.05);
          }
        }
        .animate-cosmic-drift-1 {
          animation: cosmic-drift-1 35s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-cosmic-drift-2 {
          animation: cosmic-drift-2 45s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-cosmic-drift-3 {
          animation: cosmic-drift-3 40s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}
