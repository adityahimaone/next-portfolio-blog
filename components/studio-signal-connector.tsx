'use client'

import { useRef } from 'react'
import {
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'

type SignalStage = 'cable' | 'midi' | 'automation' | 'groove' | 'xlr'

interface StudioSignalConnectorProps {
  from: string
  to: string
  story: string
  stage: SignalStage
}

const stageCopy: Record<SignalStage, string> = {
  cable: 'OUTPUT ROUTE',
  midi: 'MIDI ROUTE',
  automation: 'CONTROL VOLTAGE',
  groove: 'MASTER TO DISC',
  xlr: 'FINAL OUTPUT',
}

const drawTransition = (delay = 0) => ({
  duration: 0.58,
  delay,
  ease: [0.22, 1, 0.36, 1] as const,
})

export function StudioSignalConnector({
  from,
  to,
  story,
  stage,
}: StudioSignalConnectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.45 })
  const shouldReduceMotion = useReducedMotion()
  const active = shouldReduceMotion || isInView
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduceMotion ? [0, 0, 0] : [10, 0, -10],
  )
  const signalScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduceMotion ? [1, 1, 1] : [0.18, 1, 0.18],
  )

  return (
    <m.div
      ref={ref}
      style={{ y }}
      className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-5 will-change-transform sm:py-7"
      aria-label={`${from} to ${to}: ${story}`}
    >
      <div className="relative h-24 w-full max-w-3xl overflow-hidden sm:h-28">
        <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-px bg-black/10 dark:bg-white/[0.07]" />
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-0 left-0 h-px origin-left bg-[#e0b75a]/70 shadow-[0_0_7px_rgba(224,183,90,0.45)]"
          style={{ scaleX: signalScale }}
        />
        <StageGraphic active={active} stage={stage} />

        <div className="bg-background pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 pr-2 font-mono text-[7px] font-bold tracking-[0.18em] text-black/45 dark:text-white/40">
          {from}
        </div>
        <div className="bg-background pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 pl-2 text-right font-mono text-[7px] font-bold tracking-[0.18em] text-black/45 dark:text-white/40">
          {to}
        </div>

        <div className="bg-background pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 font-mono text-[7px] font-bold tracking-[0.16em] whitespace-nowrap text-black/45 uppercase dark:text-white/35">
          <span className="h-1 w-1 rounded-full bg-[#c9a447] shadow-[0_0_5px_#c9a447]" />
          {stageCopy[stage]}
          <span className="text-black/25 dark:text-white/20">{'//'}</span>
          {story}
        </div>
      </div>
    </m.div>
  )
}

function StageGraphic({
  active,
  stage,
}: {
  active: boolean
  stage: SignalStage
}) {
  const common = {
    initial: { pathLength: 0, opacity: 0 },
    animate: active
      ? { pathLength: 1, opacity: 1 }
      : { pathLength: 0, opacity: 0 },
  }

  if (stage === 'midi') {
    return (
      <svg
        viewBox="0 0 800 112"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <m.path
          {...common}
          d="M105 56 H270"
          fill="none"
          stroke="#c9a447"
          strokeWidth="2"
          transition={drawTransition()}
        />
        {[25, 45, 67, 87].map((y, index) => (
          <m.path
            key={y}
            {...common}
            d={`M270 56 C355 56 365 ${y}, 500 ${y} H640`}
            fill="none"
            stroke={index % 2 === 0 ? '#7abb5e' : '#c9a447'}
            strokeWidth="1.5"
            transition={drawTransition(0.14 + index * 0.1)}
          />
        ))}
        <m.rect
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
          }
          transition={drawTransition(0.08)}
          x="70"
          y="39"
          width="36"
          height="34"
          rx="3"
          fill="#202725"
          stroke="#8a958e"
        />
        {[25, 45, 67, 87].map((y, index) => (
          <m.rect
            key={y}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            transition={drawTransition(0.32 + index * 0.1)}
            x="640"
            y={y - 7}
            width="22"
            height="14"
            rx="2"
            fill={index % 2 === 0 ? '#294a38' : '#5c4722'}
            stroke={index % 2 === 0 ? '#7abb5e' : '#c9a447'}
          />
        ))}
      </svg>
    )
  }

  if (stage === 'automation') {
    return (
      <svg
        viewBox="0 0 800 112"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <m.path
          {...common}
          d="M90 78 H710"
          fill="none"
          stroke="#59635e"
          strokeWidth="6"
          strokeLinecap="round"
          transition={drawTransition()}
        />
        <m.path
          {...common}
          d="M90 78 H710"
          fill="none"
          stroke="#7abb5e"
          strokeWidth="1.5"
          transition={drawTransition(0.1)}
        />
        {[160, 310, 470, 620].map((x, index) => (
          <m.line
            key={x}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            x1={x}
            y1="42"
            x2={x}
            y2="94"
            stroke="#7e8982"
            strokeWidth="1"
            transition={drawTransition(0.14 + index * 0.08)}
          />
        ))}
        <m.rect
          initial={{ opacity: 0, x: 90 }}
          animate={active ? { opacity: 1, x: 605 } : { opacity: 0, x: 90 }}
          transition={{
            duration: 0.7,
            delay: 0.34,
            ease: [0.22, 1, 0.36, 1],
          }}
          x="0"
          y="61"
          width="34"
          height="34"
          rx="3"
          fill="#d8d6ca"
          stroke="#5e6661"
        />
        <m.circle
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : { opacity: 0 }}
          transition={drawTransition(0.95)}
          cx="710"
          cy="78"
          r="6"
          fill="#7abb5e"
        />
      </svg>
    )
  }

  if (stage === 'groove') {
    return (
      <svg
        viewBox="0 0 800 112"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <m.path
          {...common}
          d="M90 56 C210 56 240 56 340 56"
          fill="none"
          stroke="#c9a447"
          strokeWidth="2"
          transition={drawTransition()}
        />
        {[38, 28, 18].map((radius, index) => (
          <m.circle
            key={radius}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            cx="445"
            cy="56"
            r={radius}
            fill="none"
            stroke={index === 0 ? '#b9c4bb' : '#657069'}
            strokeWidth="1.4"
            transition={drawTransition(0.2 + index * 0.12)}
          />
        ))}
        <m.circle
          initial={{ opacity: 0, scale: 0.7 }}
          animate={
            active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }
          }
          transition={drawTransition(0.58)}
          cx="445"
          cy="56"
          r="9"
          fill="#c9a447"
        />
        <m.path
          {...common}
          d="M483 56 H710"
          fill="none"
          stroke="#c9a447"
          strokeWidth="2"
          transition={drawTransition(0.64)}
        />
      </svg>
    )
  }

  if (stage === 'xlr') {
    return (
      <svg
        viewBox="0 0 800 112"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <m.path
          {...common}
          d="M95 28 C250 28 255 84 565 84"
          fill="none"
          stroke="#c9a447"
          strokeWidth="3"
          strokeLinecap="round"
          transition={drawTransition()}
        />
        <m.path
          {...common}
          d="M95 28 C250 28 255 84 565 84"
          fill="none"
          stroke="#7abb5e"
          strokeWidth="1"
          strokeLinecap="round"
          transition={drawTransition(0.1)}
        />
        <m.rect
          initial={{ opacity: 0, scale: 0.85 }}
          animate={
            active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
          }
          transition={drawTransition(0.52)}
          x="565"
          y="57"
          width="70"
          height="54"
          rx="8"
          fill="#202725"
          stroke="#839088"
        />
        {[583, 600, 617].map((cx, index) => (
          <m.circle
            key={cx}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
            }
            transition={drawTransition(0.66 + index * 0.08)}
            cx={cx}
            cy="84"
            r="5"
            fill={index === 1 ? '#7abb5e' : '#c9a447'}
          />
        ))}
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 800 112"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <m.path
        {...common}
        d="M95 30 C220 30 215 83 390 83 S580 28 705 28"
        fill="none"
        stroke="#59635e"
        strokeWidth="7"
        strokeLinecap="round"
        transition={drawTransition()}
      />
      <m.path
        {...common}
        d="M95 30 C220 30 215 83 390 83 S580 28 705 28"
        fill="none"
        stroke="#c9a447"
        strokeWidth="2"
        strokeLinecap="round"
        transition={drawTransition(0.08)}
      />
      <m.circle
        initial={{ opacity: 0, scale: 0.7 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
        transition={drawTransition(0.46)}
        cx="92"
        cy="30"
        r="12"
        fill="#1d2421"
        stroke="#aeb8b0"
      />
      <m.circle
        initial={{ opacity: 0, scale: 0.7 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
        transition={drawTransition(0.62)}
        cx="708"
        cy="28"
        r="12"
        fill="#1d2421"
        stroke="#aeb8b0"
      />
      <m.circle
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={drawTransition(0.7)}
        cx="708"
        cy="28"
        r="4"
        fill="#7abb5e"
      />
    </svg>
  )
}
