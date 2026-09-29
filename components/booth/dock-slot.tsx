'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface DockSlotValue {
  slot: ReactNode
  setSlot: (node: ReactNode) => void
}

const SlotContext = createContext<DockSlotValue>({
  slot: null,
  setSlot: () => {},
})

/**
 * The node is held in a wrapper so a ReactNode can never be mistaken for a
 * state updater by React, which would invoke it as a function.
 */
interface SlotBox {
  node: ReactNode
}

export function DockSlotProvider({ children }: { children: ReactNode }) {
  const [box, setBox] = useState<SlotBox>({ node: null })
  const value = useMemo<DockSlotValue>(
    () => ({
      slot: box.node,
      setSlot: (node: ReactNode) => setBox({ node }),
    }),
    [box.node],
  )
  return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>
}

export function useDockSlotValue(): ReactNode {
  return useContext(SlotContext).slot
}

/**
 * Pages call this to put their transport into the dock.
 *
 * `useState` stores a render function and invokes it lazily, so a node is
 * never treated as an updater. The slot clears on unmount so navigating
 * away never leaves a stale transport in the dock.
 */
export function useDockSlot(node: ReactNode, deps: unknown[]) {
  const { setSlot } = useContext(SlotContext)
  const ref = useRef(node)
  ref.current = node

  const set = useCallback((next: ReactNode) => setSlot(next), [setSlot])

  useEffect(() => {
    set(ref.current)
    return () => set(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
