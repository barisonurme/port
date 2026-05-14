'use client'

import { useEffect } from 'react'
import { usePageTransition } from './transition-provider'

export function EnterKeyNav({ href }: { href: string }) {
  const navigate = usePageTransition()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') navigate(href)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, href])

  return null
}
