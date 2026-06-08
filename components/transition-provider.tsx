'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  const smoothTarget = useRef(0)
  const smoothCurrent = useRef(0)

  useEffect(() => {
    smoothTarget.current = 0
    smoothCurrent.current = 0
    document.documentElement.scrollTop = 0
  }, [pathname])

  useEffect(() => {
    const onScrollTo = (e: Event) => {
      smoothTarget.current = (e as CustomEvent<{ top: number }>).detail.top;
    };
    window.addEventListener('smooth-scroll-to', onScrollTo);
    return () => window.removeEventListener('smooth-scroll-to', onScrollTo);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return

    const onWheel = (e: WheelEvent) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      e.preventDefault()
      smoothTarget.current = Math.max(0, Math.min(smoothTarget.current + e.deltaY, maxScroll))
    }

    const tick = () => {
      smoothCurrent.current += (smoothTarget.current - smoothCurrent.current) * 0.1
      document.documentElement.scrollTop = smoothCurrent.current
      ScrollTrigger.update()
    }

    gsap.ticker.add(tick)
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('wheel', onWheel)
    }
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
