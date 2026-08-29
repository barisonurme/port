'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { usePageTransition, useInitialLoading } from '@/components/transition-provider'

const Logo = ({ color }: { color: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        className='shrink-0'
        style={{ fill: color }}
    >
        <path d="M0.0788363 20.2332C0.0340193 20.1904 0.000406504 19.1514 0.000406504 17.9303C0.000406504 15.4668 -0.0444106 15.5846 0.807113 15.5846C1.59141 15.5846 1.66984 15.3918 1.68104 13.4424C1.69225 11.9536 1.71466 11.7179 1.94995 11.2038C2.0956 10.8932 2.29728 10.5825 2.39812 10.529C2.611 10.4112 2.63341 9.98272 2.43173 9.77921C2.3533 9.70423 2.16283 9.44717 2.01717 9.21152C1.75947 8.8045 1.73707 8.67597 1.70345 6.90864C1.66984 5.1306 1.65864 5.02349 1.42335 4.85212C1.2889 4.74501 0.975177 4.65932 0.728683 4.65932C0.482189 4.65932 0.213287 4.61647 0.134858 4.57363C0.0340193 4.49865 0.000406503 3.9631 0.022815 2.23861L0.0564278 0L6.835 0.0107111C14.2522 0.0107111 14.8685 0.0535554 16.1345 0.631953C17.2662 1.1568 17.5575 1.37102 18.2073 2.14221C18.8796 2.93483 19.1261 3.52394 19.2829 4.69145C19.451 5.94465 19.2941 7.36922 18.9132 8.17255C18.6555 8.68668 17.9944 9.5757 17.7367 9.72565C17.5127 9.85419 17.5575 10.0684 17.8488 10.2184C18.4314 10.5183 18.5995 10.6361 19.0476 11.086C19.8992 11.9536 20 12.2856 20 14.2029C20 15.2633 19.9552 15.9274 19.8768 16.0238C19.8095 16.1095 19.7199 16.313 19.6751 16.4843C19.4622 17.3305 18.1849 18.7551 17.1989 19.2585C15.3054 20.2225 15.2718 20.2225 7.1039 20.2654C3.28325 20.2868 0.123653 20.2654 0.0788363 20.2332ZM10.7005 17.5876C10.8909 17.4912 11.0926 17.4055 11.1598 17.4055C11.3279 17.4055 11.8097 16.8914 12.1122 16.3879C12.3475 15.9916 12.3811 15.7881 12.4371 14.0101C12.4931 12.1464 12.5044 12.0607 12.7621 11.7929C12.9077 11.6429 13.1206 11.493 13.2438 11.4501C13.4231 11.3966 13.4455 11.268 13.4455 10.1434L13.4343 8.89019L13.0758 8.67597C12.5044 8.3225 12.4371 8.09757 12.4371 6.23384C12.4371 4.74501 12.4035 4.47723 12.2018 4.03807C11.8881 3.37399 11.608 3.0955 10.9246 2.75275C10.398 2.49568 10.2411 2.47426 8.49323 2.43141L6.61092 2.38857V4.16661V5.94465H7.03668C7.73134 5.94465 7.80977 6.11602 7.877 7.73339C7.93302 9.10441 7.95543 9.16868 8.29155 9.63997L8.63889 10.122L8.29155 10.5933C7.95543 11.0431 7.94422 11.0967 7.877 12.4891C7.80977 14.1386 7.73134 14.2993 7.03668 14.2993H6.61092V16.0773V17.8554L8.49323 17.8125C9.94978 17.7697 10.4428 17.7268 10.7005 17.5876Z" />
    </svg>
)

const NAV_LINKS = [
    { href: '/projects', label: 'Projects', match: ['/projects'] },
    { href: '/cv', label: 'About', match: ['/cv', '/about'] },
    { href: '/contact', label: 'Contact', match: ['/contact'] },
]

type NavLink = (typeof NAV_LINKS)[number]

// Desktop nav item: on hover the label rolls up letter by letter while an
// identical copy rolls in from below, staggered per character. The timeline is
// built once, paused, then played / reversed on pointer enter / leave.
const DesktopNavLink = ({
    link,
    active,
    onNavigate,
}: {
    link: NavLink
    active: boolean
    onNavigate: () => void
}) => {
    const rootRef = useRef<HTMLButtonElement>(null)
    const tlRef = useRef<gsap.core.Timeline | null>(null)
    const chars = Array.from(link.label)

    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const top = el.querySelectorAll<HTMLElement>('[data-roll-top] > span')
        const bottom = el.querySelectorAll<HTMLElement>('[data-roll-bottom] > span')
        tlRef.current = gsap
            .timeline({ paused: true })
            .to(top, { yPercent: -100, duration: 0.4, ease: 'power3.out', stagger: 0.03 }, 0)
            .to(bottom, { yPercent: -100, duration: 0.4, ease: 'power3.out', stagger: 0.03 }, 0)
        return () => {
            tlRef.current?.kill()
            tlRef.current = null
        }
    }, [])

    return (
        <button
            ref={rootRef}
            type='button'
            disabled={active}
            aria-current={active ? 'page' : undefined}
            onClick={active ? undefined : onNavigate}
            onMouseEnter={() => tlRef.current?.play()}
            onMouseLeave={() => tlRef.current?.reverse()}
            className={`text-white text-lg font-bold transition-opacity duration-300 ${active ? 'opacity-100 cursor-default' : 'opacity-65 cursor-pointer hover:opacity-100'}`}
        >
            <span className='relative block overflow-hidden leading-[1.15]'>
                <span data-roll-top className='block'>
                    {chars.map((ch, i) => (
                        <span key={i} className='inline-block whitespace-pre'>
                            {ch}
                        </span>
                    ))}
                </span>
                <span data-roll-bottom aria-hidden className='absolute left-0 top-full block'>
                    {chars.map((ch, i) => (
                        <span key={i} className='inline-block whitespace-pre'>
                            {ch}
                        </span>
                    ))}
                </span>
            </span>
        </button>
    )
}

const Header = ({ color = '#ffffff' }: { color?: string }) => {
    const [open, setOpen] = useState(false)
    const navigate = usePageTransition()
    const pathname = usePathname()
    const initialLoading = useInitialLoading()
    const rootRef = useRef<HTMLDivElement>(null)
    const introRef = useRef<gsap.core.Tween | null>(null)
    const isActive = (link: (typeof NAV_LINKS)[number]) =>
        link.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))

    // Blur + fade the header in, mirroring the hero. Created paused so it can
    // wait out the initial loading screen (see the [initialLoading] effect).
    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const intro = gsap.fromTo(
            el,
            { autoAlpha: 0, filter: 'blur(24px)', y: -80 },
            // Second of the staggered intros: text 0s, header slides down from the
            // top +0.5s, project stack rises from the bottom +1s.
            { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 1.2, ease: 'power3.out', delay: 0.5, paused: true }
        )
        introRef.current = intro
        return () => {
            intro.kill()
            introRef.current = null
        }
    }, [])

    // On a client-side nav there's no loader, so initialLoading is already
    // false on mount and the intro plays immediately.
    useEffect(() => {
        if (!initialLoading) introRef.current?.play()
    }, [initialLoading])

    return (
        <div
            ref={rootRef}
            className={`flex justify-center items-center w-full top-0 p-4 sm:p-8 md:p-24 z-5000 absolute ${pathname === '/'
                    ? 'pt-12 sm:pt-16 md:pt-20'
                    : 'pt-6 sm:pt-8 md:pt-10'
                }`}
        >
            <div className='border-l border-t flex flex-col w-full h-full max-w-7xl backdrop-blur-3xl bg-black/30 p-3 px-4 md:p-8 md:px-12 rounded-[24px] shadow-xl border-white/20'>
                <div className='flex justify-between  items-center w-full h-full gap-2'>
                    <button
                        type='button'
                        disabled={pathname === '/'}
                        aria-current={pathname === '/' ? 'page' : undefined}
                        onClick={pathname === '/' ? undefined : () => navigate('/')}
                        className={`flex justify-start items-center text-lg font-bold gap-2 shrink-0 ${pathname === '/' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <Logo color={color} />
                        BARISONURME
                    </button>

                    {/* Desktop nav */}
                    <nav className='hidden md:flex justify-end items-center gap-8'>
                        {NAV_LINKS.map((link) => (
                            <DesktopNavLink
                                key={link.href}
                                link={link}
                                active={isActive(link)}
                                onNavigate={() => navigate(link.href)}
                            />
                        ))}
                    </nav>

                    {/* Hamburger toggle */}
                    <button
                        type='button'
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className='md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 shrink-0 -mr-1'
                    >
                        <span
                            className={`block h-[2px] w-6 bg-white transition-transform duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`}
                        />
                        <span
                            className={`block h-[2px] w-6 bg-white transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <span
                            className={`block h-[2px] w-6 bg-white transition-transform duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
                        />
                    </button>
                </div>

                {/* Mobile menu */}
                <nav
                    className={`md:hidden flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-60 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link)
                        return (
                            <button
                                key={link.href}
                                type='button'
                                disabled={active}
                                aria-current={active ? 'page' : undefined}
                                onClick={
                                    active
                                        ? undefined
                                        : () => {
                                            setOpen(false)
                                            navigate(link.href)
                                        }
                                }
                                className={`text-white text-lg font-bold text-left py-2 border-t border-white/10 first:border-t-0 ${active ? 'opacity-100 cursor-default' : 'cursor-pointer'}`}
                            >
                                {link.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}

export default Header
