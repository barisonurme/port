'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * The replacement affordance for the hidden scrollbars (see globals.css):
 * a hairline at the top of the viewport that fills as the page scrolls.
 *
 * Driven by ScrollTrigger rather than a scroll listener so it inherits the
 * Lenis-synced update loop already wired up in transition-provider.tsx —
 * the bar advances on the same frame as the smoothed scroll position
 * instead of racing ahead of it on the raw, unsmoothed one.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    gsap.registerPlugin(ScrollTrigger)

    // Rebuilt per route: each page has its own height, and pinned sections
    // (sticky-project-parallax) change the max scroll after mount.
    const ctx = gsap.context(() => {
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })

      gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          invalidateOnRefresh: true,
          // A little scrub lag keeps the bar from jittering on trackpads
          // and matches the easing of the smooth scroll underneath it.
          scrub: 0.3,
          // Nothing to report on a page that doesn't scroll — a permanently
          // empty bar reads as broken, so fade it out entirely.
          onRefresh: (self) => {
            gsap.to(bar, {
              autoAlpha: self.end > self.start ? 1 : 0,
              duration: 0.2,
              overwrite: 'auto',
            })
          },
        },
      })
    })

    return () => ctx.revert()
  }, [pathname])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-px pointer-events-none"
      style={{ zIndex: 9998 }}
      aria-hidden
    >
      <div
        ref={barRef}
        className="h-full w-full bg-white/70"
        style={{ boxShadow: '0 0 8px rgba(255,255,255,0.35)' }}
      />
    </div>
  )
}
