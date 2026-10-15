'use client'

import { useEffect, type RefObject } from 'react'

const QUERY =
  '(min-width: 769px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

export function useMatterReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    const media = window.matchMedia(QUERY)
    let revealObserver: IntersectionObserver | null = null
    let motionObserver: MutationObserver | null = null

    const stop = () => {
      revealObserver?.disconnect()
      revealObserver = null
      motionObserver?.disconnect()
      motionObserver = null
      element.removeAttribute('data-reveal-ready')
      element
        .querySelectorAll('[data-in]')
        .forEach((node) => node.removeAttribute('data-in'))
      element
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((target) => target.style.removeProperty('--i'))
    }

    const attach = () => {
      stop()
      if (
        !media.matches ||
        element.dataset.motion !== 'ready' ||
        !('IntersectionObserver' in window)
      ) {
        if (media.matches && element.dataset.motion !== 'ready') {
          motionObserver = new MutationObserver(() => {
            if (element.dataset.motion === 'ready') attach()
          })
          motionObserver.observe(element, {
            attributes: true,
            attributeFilter: ['data-motion'],
          })
        }
        return
      }

      const targets = Array.from(
        element.querySelectorAll<HTMLElement>('[data-reveal]'),
      )
      if (targets.length === 0) return
      targets.forEach((target, index) =>
        target.style.setProperty('--i', String(index % 6)),
      )

      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement
            if (entry.isIntersecting) target.setAttribute('data-in', '')
            else if (entry.boundingClientRect.top > 0)
              target.removeAttribute('data-in')
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
      )
      targets.forEach((target) => revealObserver?.observe(target))
      element.setAttribute('data-reveal-ready', '')
      motionObserver = new MutationObserver(() => {
        if (element.dataset.motion !== 'ready') stop()
      })
      motionObserver.observe(element, {
        attributes: true,
        attributeFilter: ['data-motion'],
      })
    }

    attach()
    media.addEventListener('change', attach)
    return () => {
      media.removeEventListener('change', attach)
      stop()
      element
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((target) => target.style.removeProperty('--i'))
    }
  }, [root])
}
