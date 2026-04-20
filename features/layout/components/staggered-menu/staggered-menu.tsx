'use client'

import React, { useCallback, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import './staggered-menu.css'

interface StaggeredMenuItem {
  label: string
  ariaLabel?: string
  link: string
}

interface StaggeredMenuSocialItem {
  label: string
  link: string
}

interface StaggeredMenuProps {
  isOpen: boolean
  onClose: () => void
  items: StaggeredMenuItem[]
  displayItemNumbering?: boolean
  colors?: string[]
  accentColor?: string
  className?: string
}

export const StaggeredMenu = ({
  isOpen = false,
  onClose,
  items = [],
  displayItemNumbering = true,
  colors = ['#f59e0b', '#3a4699', '#1e2866'],
  accentColor = '#f59e0b',
  className = '',
}: StaggeredMenuProps) => {
  const panelRef = useRef<HTMLElement>(null)
  const preLayersRef = useRef<HTMLDivElement>(null)
  const preLayerElsRef = useRef<HTMLDivElement[]>([])
  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const busyRef = useRef(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      if (!panel) return

      let preLayers: HTMLDivElement[] = []
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'))
      }
      preLayerElsRef.current = preLayers

      const offscreen = 100
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 })
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 })
      }
    })
    return () => ctx.revert()
  }, [])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    if (closeTweenRef.current) {
      closeTweenRef.current.kill()
      closeTweenRef.current = null
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'))
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'),
    )
    const socialTitle = panel.querySelector('.sm-socials-title')
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'))

    const offscreen = 100
    const layerStates = layers.map((el) => ({ el, start: offscreen }))

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 5 })
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 })
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 })
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 })
    }

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.4, ease: 'power3.out' },
        i * 0.05,
      )
    })

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.05 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.05 : 0)
    const panelDuration = 0.5

    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime,
    )

    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.1
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.8,
          ease: 'power4.out',
          stagger: 0.08,
        },
        itemsStart,
      )
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            '--sm-num-opacity': 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
          },
          itemsStart + 0.1,
        )
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + 0.3
      if (socialTitle) {
        tl.to(socialTitle, { opacity: 1, duration: 0.4 }, socialsStart)
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 },
          socialsStart + 0.05,
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false
      })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all = [...layers, panel]
    closeTweenRef.current?.kill()
    const offscreen = 100
    
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.3,
      ease: 'power2.in',
      stagger: 0.02,
      onComplete: () => {
        busyRef.current = false
      },
    })
  }, [])

  const firstItemRef = useRef<HTMLAnchorElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      playOpen()
      // Small delay to allow animation to start before focusing
      setTimeout(() => {
        firstItemRef.current?.focus()
      }, 300)
    } else {
      playClose()
    }
  }, [isOpen, playOpen, playClose])

  return (
    <div
      className={`staggered-menu-wrapper ${className}`}
      style={
        accentColor
          ? ({ '--sm-accent': accentColor } as React.CSSProperties)
          : undefined
      }
      data-open={isOpen || undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <aside
        id="staggered-menu-panel"
        ref={panelRef as any}
        className="staggered-menu-panel"
        aria-hidden={!isOpen}
      >
        <div className="sm-panel-inner">
          <nav className="sm-panel-nav">
            <ul
              className="sm-panel-list"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <Link
                    ref={idx === 0 ? firstItemRef : null}
                    className="sm-panel-item"
                    href={it.link}
                    aria-label={it.ariaLabel}
                    onClick={() => onClose()}
                  >
                    <span className="sm-module-type">
                      {idx % 2 === 0 ? 'SIGNAL PATH' : 'DSP MODULE'}
                    </span>
                    <span className="sm-panel-itemLabel">{it.label}</span>
                    <div className="sm-meter" aria-hidden="true">
                      <div className="sm-meter-bar" />
                      <div className="sm-meter-bar" />
                      <div className="sm-meter-bar" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export default StaggeredMenu
