'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

const TransitionContext = createContext<(href: string) => void>(() => {})

export function usePageTransition() {
  return useContext(TransitionContext)
}

const STRIP_COUNT = 8

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const stripsRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis()
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  useEffect(() => {
    const onScrollTo = (e: Event) => {
      lenisRef.current?.scrollTo((e as CustomEvent<{ top: number }>).detail.top)
    }
    window.addEventListener('smooth-scroll-to', onScrollTo)
    return () => window.removeEventListener('smooth-scroll-to', onScrollTo)
  }, [])

  const navigate = useCallback((href: string) => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const container = stripsRef.current
    if (!container) {
      router.push(href)
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
        router.push(href)
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
      },
    })
  }, [router])

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
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
              transform: 'translateX(100%)',
            }}
          />
        ))}
      </div>
    </TransitionContext.Provider>
  )
}
