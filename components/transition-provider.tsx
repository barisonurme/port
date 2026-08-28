'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { cn } from '@/lib/utils'
import { ScrollProgress } from '@/components/scroll-progress'

const TransitionContext = createContext<(href: string) => void>(() => { })

export function usePageTransition() {
  return useContext(TransitionContext)
}

// True until the initial loading screen has finished wiping away. Lets
// content (e.g. the hero) hold its intro animation until it's actually
// visible instead of playing it behind the cover.
const InitialLoadingContext = createContext(true)

export function useInitialLoading() {
  return useContext(InitialLoadingContext)
}

const STRIP_COUNT = 8

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const stripsRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const lenisRef = useRef<Lenis | null>(null)
  const [isNavPending, startNavTransition] = useTransition()
  const awaitingRevealRef = useRef(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [indeterminate, setIndeterminate] = useState(false)
  const fillRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Skip Lenis on phones / touch devices: its rAF loop plus a synchronous
    // ScrollTrigger.update on every native scroll event is the main mobile
    // scroll-jank source with the pinned parallax section. Native scrolling
    // + ScrollTrigger's own scroll listener is smoother there.
    const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    if (isMobile) return

    const lenis = new Lenis()
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onScrollTo = (e: Event) => {
      const { top } = (e as CustomEvent<{ top: number }>).detail
      if (lenisRef.current) lenisRef.current.scrollTo(top)
      else window.scrollTo({ top, behavior: 'smooth' })
    }
    window.addEventListener('smooth-scroll-to', onScrollTo)
    return () => window.removeEventListener('smooth-scroll-to', onScrollTo)
  }, [])

  // Reads the live value of the `--fill-gap` custom property that the CSS
  // fill animation (see globals.css) drives, so the percentage number is
  // always exactly what's on screen instead of a second, driftable timer.
  useEffect(() => {
    if (!initialLoading) return
    let rafId: number

    const poll = () => {
      const el = fillRef.current
      // Written straight to the DOM (not React state) so this doesn't
      // re-render the whole app tree ~60x/sec — that was the cause of the
      // word fill and the percentage drifting out of sync: the CSS
      // animation keeps ticking on the compositor regardless, but a
      // setState-per-frame here gets throttled behind whatever else is on
      // the main thread (e.g. the homepage's WebGL scene).
      if (el && percentRef.current) {
        const gap = parseFloat(getComputedStyle(el).getPropertyValue('--fill-gap'))
        if (!Number.isNaN(gap)) {
          const percent = Math.round(100 - gap)
          percentRef.current.textContent = `${percent}%`
          percentRef.current.style.visibility = percent === 0 ? 'hidden' : 'visible'
        }
      }
      rafId = requestAnimationFrame(poll)
    }
    rafId = requestAnimationFrame(poll)

    return () => cancelAnimationFrame(rafId)
  }, [initialLoading])

  // Initial loading screen: the strips render covering the viewport (see
  // the `initialLoading` style below) so slow connections see a cover
  // instead of an unstyled flash, then wipe away once the page has
  // actually finished loading.
  useEffect(() => {
    let cancelled = false

    // The climb (`animate-fill-climb`, see globals.css) and the later
    // breathing loop (`animate-fill-breathe`) are plain CSS `@keyframes` —
    // not gsap — specifically so the fill starts moving the instant the
    // browser paints the server-rendered HTML, before the JS bundle has
    // even finished downloading. A gsap/JS-driven animation can't show
    // anything until React hydrates, which is exactly the slow-connection
    // window this screen exists for.
    const indeterminateTimer = setTimeout(() => setIndeterminate(true), 8000)

    const revealInitial = () => {
      if (cancelled) return
      clearTimeout(indeterminateTimer)
      setIndeterminate(false)

      if (fillRef.current) {
        // Cancel whichever CSS animation is running and snap the fill shut.
        fillRef.current.style.transition = 'clip-path 0.2s ease-out'
        fillRef.current.style.animation = 'none'
        fillRef.current.style.clipPath = 'inset(0 0% 0 0)'
      }
      if (percentRef.current) {
        percentRef.current.textContent = '100%'
        percentRef.current.style.visibility = 'visible'
      }

      const container = stripsRef.current
      if (!container) {
        setInitialLoading(false)
        return
      }
      const strips = Array.from(container.children) as HTMLElement[]
      gsap.to(strips, {
        x: '-100%',
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.inOut',
        delay: 0.2,
        onComplete: () => setInitialLoading(false),
      })
    }

    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
      } else {
        window.addEventListener('load', () => resolve(), { once: true })
      }
    })
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 500))

    // No artificial cutoff here — this screen exists specifically to wait
    // out slow connections, so it waits for the real `load` event no matter
    // how long that takes.
    Promise.all([pageLoaded, minDelay]).then(revealInitial)

    return () => {
      cancelled = true
      clearTimeout(indeterminateTimer)
    }
  }, [])

  // Only reveal the covering strips once the target route has actually
  // landed (isNavPending flips back to false), so slow navigations keep
  // the cover up instead of dropping it onto a half-loaded page.
  useEffect(() => {
    if (!awaitingRevealRef.current || isNavPending) return
    awaitingRevealRef.current = false

    const container = stripsRef.current
    if (!container) {
      isAnimatingRef.current = false
      return
    }
    const strips = Array.from(container.children) as HTMLElement[]
    gsap.to(strips, {
      x: '-100%',
      duration: 0.42,
      stagger: 0.035,
      ease: 'power3.inOut',
      delay: 0.12,
      onComplete: () => {
        isAnimatingRef.current = false
      },
    })
  }, [isNavPending])

  const navigate = useCallback((href: string) => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const container = stripsRef.current
    if (!container) {
      startNavTransition(() => router.push(href))
      isAnimatingRef.current = false
      return
    }

    const strips = Array.from(container.children) as HTMLElement[]

    gsap.set(strips, { x: '100%' })

    gsap.to(strips, {
      x: '0%',
      duration: 0.42,
      stagger: 0.035,
      ease: 'power3.inOut',
      onComplete: () => {
        awaitingRevealRef.current = true
        startNavTransition(() => router.push(href))
      },
    })
  }, [router, startNavTransition])

  return (
    <TransitionContext.Provider value={navigate}>
      <InitialLoadingContext.Provider value={initialLoading}>
        {children}
      </InitialLoadingContext.Provider>
      {/* Sits below the strips (z 9999) so page transitions and the initial
          loading screen cover it without needing their own hide logic. */}
      <ScrollProgress />
      <div
        ref={stripsRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 9999 }}
        aria-hidden
      >
        {Array.from({ length: STRIP_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full bg-zinc-950"
            style={{
              height: `${100 / STRIP_COUNT}%`,
              top: `${(i / STRIP_COUNT) * 100}%`,
              // Covers the viewport on first paint (initialLoading) so slow
              // connections see this instead of an unstyled flash; every
              // subsequent transition starts off-screen and slides in itself.
              transform: initialLoading ? 'translateX(0%)' : 'translateX(100%)',
            }}
          />
        ))}
        {initialLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative text-xs font-mono tracking-[0.3em] uppercase">
              <span className="text-white/15">{indeterminate ? 'still loading' : 'BARISONURME.COM'}</span>
              <span
                ref={fillRef}
                className={cn(
                  'absolute inset-0 text-white',
                  indeterminate ? 'animate-fill-breathe' : 'animate-fill-climb'
                )}
                style={{ clipPath: 'inset(0 var(--fill-gap) 0 0)' }}
              >
                {indeterminate ? 'still loading' : 'BARISONURME.COM %02'}
              </span>
            </div>

            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/40 animate-heartbeat"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {!indeterminate && (
              <span
                ref={percentRef}
                className="text-white/30 text-xl font-mono tabular-nums"
                style={{ visibility: 'hidden' }}
              >
                0%
              </span>
            )}

          </div>
        )}
      </div>
    </TransitionContext.Provider>
  )
}
