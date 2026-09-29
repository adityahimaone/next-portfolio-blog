'use client'

import { useEffect, useState } from 'react'

/**
 * Hiding the interface on the mixtape has to reach past the page: the magnetic
 * dock lives in the root layout, in a different React tree, so no amount of
 * local ref or querySelector can reach it. The flag is therefore published on
 * the document element, and anyone who cares can subscribe.
 *
 * The dock returns null for most routes already; this lets one page retire it
 * without the dock having to know which page is asking.
 */
const EVENT = 'interface:visibility'

export type InterfaceVisibility = 'visible' | 'hidden'

function read(): InterfaceVisibility {
  if (typeof document === 'undefined') return 'visible'
  return document.documentElement.dataset.interface === 'hidden'
    ? 'hidden'
    : 'visible'
}

export function setInterfaceVisibility(next: InterfaceVisibility) {
  document.documentElement.dataset.interface = next
  window.dispatchEvent(
    new CustomEvent<InterfaceVisibility>(EVENT, { detail: next }),
  )
}

/** Subscribes to interface visibility. Used by the dock. */
export function useInterfaceVisibility(): InterfaceVisibility {
  const [visibility, setVisibility] = useState<InterfaceVisibility>(read)

  useEffect(() => {
    // A client-side route change can leave the flag from the previous page.
    setVisibility(read())

    function onChange(event: Event) {
      setVisibility((event as CustomEvent<InterfaceVisibility>).detail)
    }

    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  return visibility
}
