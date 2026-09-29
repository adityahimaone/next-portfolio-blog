'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Room } from './room'
import { Dock } from './dock'
import { DockSlotProvider } from './dock-slot'
import { FloatingThemeToggle } from '@/features/layout'
import styles from './booth.module.css'

/**
 * Mounts the hidden SVG displacement filter used by the dock's optional
 * refraction. Kept out of the layout tree and out of the a11y tree.
 */
export function GlassFilters() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: 'absolute' }}
    >
      <defs>
        <filter id="glass-refract" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale="28"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

const ChannelContext = createContext<(hue: string) => void>(() => {})

/** Pages call this to retint the room as the reader's context changes. */
export function useRoomChannel() {
  return useContext(ChannelContext)
}

interface BoothShellProps {
  /** Default channel hue; pages can override it at runtime. */
  hue: string
  children: ReactNode
}

export function BoothShell({ hue, children }: BoothShellProps) {
  const [channel, setChannel] = useState(hue)

  // A page that mounts later must not leave the previous route's hue behind.
  useEffect(() => setChannel(hue), [hue])

  const value = useMemo(() => setChannel, [])

  return (
    <DockSlotProvider>
      <ChannelContext.Provider value={value}>
        <Room hue={channel} />
        <GlassFilters />
        <div className={styles.shell} data-booth>
          {children}
        </div>
        <FloatingThemeToggle />
        <Dock />
      </ChannelContext.Provider>
    </DockSlotProvider>
  )
}
