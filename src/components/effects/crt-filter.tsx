'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CRTFilterProps {
  enabled?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export function CRTFilter({ enabled = true, intensity = 'medium' }: CRTFilterProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !enabled) return null

  const intensityMap = {
    low: {
      scanlineOpacity: 0.03,
      scanlineHeight: 2,
      glitchAmount: 0.5,
    },
    medium: {
      scanlineOpacity: 0.08,
      scanlineHeight: 1,
      glitchAmount: 1,
    },
    high: {
      scanlineOpacity: 0.15,
      scanlineHeight: 1,
      glitchAmount: 2,
    },
  }

  const config = intensityMap[intensity]

  return (
    <>
      <style>{`
        @keyframes scanlines {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 ${config.scanlineHeight * 2}px;
          }
        }

        @keyframes chromatic-shift {
          0%, 100% {
            text-shadow: 
              -${config.glitchAmount}px 0 #E10600,
              ${config.glitchAmount}px 0 #00FFFF;
          }
          50% {
            text-shadow: 
              ${config.glitchAmount}px 0 #E10600,
              -${config.glitchAmount}px 0 #00FFFF;
          }
        }

        @keyframes crt-flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.97;
          }
        }

        .crt-filter {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: var(--z-crt, 9999);
          mix-blend-mode: overlay;
        }

        .crt-scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, ${config.scanlineOpacity}),
            rgba(0, 0, 0, ${config.scanlineOpacity}) ${config.scanlineHeight}px,
            transparent ${config.scanlineHeight}px,
            transparent ${config.scanlineHeight * 2}px
          );
          animation: scanlines 0.15s linear infinite;
          pointer-events: none;
        }

        .crt-vignette {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
        }

        .crt-flicker {
          animation: crt-flicker 0.15s infinite;
        }

        /* Optional: chromatic aberration on text */
        .crt-chromatic {
          animation: chromatic-shift 0.1s infinite;
        }
      `}</style>

      <div className="crt-filter crt-flicker">
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
      </div>
    </>
  )
}
