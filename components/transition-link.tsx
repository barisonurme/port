'use client'

import { usePageTransition } from './transition-provider'

type Props = {
  href: string
  className?: string
  children: React.ReactNode
}

export function TransitionLink({ href, className, children }: Props) {
  const navigate = usePageTransition()

  return (
    <div onClick={() => navigate(href)} className={className} role="button" style={{ cursor: 'pointer' }}>
      {children}
    </div>
  )
}
