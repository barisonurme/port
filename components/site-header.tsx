'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/header'

/**
 * Renders the global nav Header on every route except:
 *  - `/` — the homepage mounts its own <Header> wired to the animated bg color
 *  - `/projects` — has its own in-page navigation
 */
const EXCLUDED = new Set(['/', '/projects'])

export function SiteHeader() {
    const pathname = usePathname()
    if (EXCLUDED.has(pathname)) return null
    return <Header />
}
