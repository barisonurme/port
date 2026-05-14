"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, MoveLeft } from "lucide-react";
import { TransitionLink } from "@/components/transition-link";
import { usePageTransition } from "@/components/transition-provider";
import { Button } from "@/components/ui/button";

const projects = [
    {
        id: 1,
        title: "Horizon",
        year: "2024",
        category: "Web App",
        description:
            "A full-stack SaaS dashboard built with Next.js and Postgres. Real-time analytics, team management, and custom reporting pipelines.",
        tech: ["Next.js", "TypeScript", "Postgres", "Tailwind"],
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    },
    {
        id: 2,
        title: "Fauna",
        year: "2024",
        category: "Mobile",
        description:
            "A nature-tracking mobile app with AI species identification. Built with React Native and a custom ML pipeline for image recognition.",
        tech: ["React Native", "Python", "TensorFlow", "AWS"],
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
    },
    {
        id: 3,
        title: "Marble",
        year: "2023",
        category: "Design System",
        description:
            "A minimal component library and design system used across 5 production apps. 60+ components, fully accessible, dark-mode first.",
        tech: ["React", "Storybook", "Radix UI", "SCSS"],
        image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80",
    },
    {
        id: 4,
        title: "Relay",
        year: "2023",
        category: "Infrastructure",
        description:
            "An open-source edge proxy built in Go. Sub-millisecond routing, plugin system, and a web-based control plane.",
        tech: ["Go", "Docker", "Redis", "gRPC"],
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    },
    {
        id: 5,
        title: "Solace",
        year: "2022",
        category: "Product",
        description:
            "A mental wellness app with mood tracking and guided meditations. 10k+ active users within first month of launch.",
        tech: ["Flutter", "Firebase", "Node.js", "OpenAI"],
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    },
];

// Font size used for the h1 in the expanded view
const TITLE_FONT = "clamp(4rem, 14vw, 13rem)";

export default function Projects() {
    const navigate = usePageTransition();
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [autoId, setAutoId] = useState<number>(projects[0].id);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const displayId = isExpanded ? null : (hoveredId ?? autoId);

    const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const listTitleRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
    const overlayRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const expandedImgRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLDivElement>(null);
    // Fixed-position heroes — sit above overlay stacking context so they're always visible
    const heroImgRef = useRef<HTMLDivElement>(null);   // clips from full-screen → slot
    const heroTitleRef = useRef<HTMLDivElement>(null);   // flies from list → h1

    const navRef = useRef<HTMLDivElement>(null);
    const activeIdRef = useRef<number | null>(null);
    const prevDisplayIdRef = useRef<number | null>(null);
    const pendingNavRef = useRef<{ direction: "prev" | "next" } | null>(null);
    const isAnimatingNavRef = useRef(false);
    const scrollCooldownRef = useRef(false);

    const activeProject = projects.find((p) => p.id === activeId) ?? null;
    const currentIndex = activeId != null ? projects.findIndex((p) => p.id === activeId) : -1;
    const prevProject = currentIndex > -1 ? projects[(currentIndex - 1 + projects.length) % projects.length] : null;
    const nextProject = currentIndex > -1 ? projects[(currentIndex + 1) % projects.length] : null;
    const prevIndex = prevProject ? projects.indexOf(prevProject) : -1;
    const nextIndex = nextProject ? projects.indexOf(nextProject) : -1;

    // Keep ref in sync without triggering render
    useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

    // ── autoplay ─────────────────────────────────────────────
    useEffect(() => {
        if (isExpanded) return;
        let idx = projects.findIndex((p) => p.id === autoId);
        const timer = setInterval(() => {
            idx = (idx + 1) % projects.length;
            setAutoId(projects[idx].id);
        }, 2500);
        return () => clearInterval(timer);
    }, [isExpanded, autoId]);

    // ── background cross-fade ────────────────────────────────
    useEffect(() => {
        const prev = prevDisplayIdRef.current;
        prevDisplayIdRef.current = displayId;

        projects.forEach((p) => {
            const el = imageRefs.current.get(p.id);
            if (!el) return;

            if (p.id === displayId) {
                gsap.fromTo(el,
                    { scale: 1.06, opacity: 0, filter: "blur(12px)" },
                    { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.75, ease: "power3.out" }
                );
            } else if (p.id === prev && displayId !== null) {
                gsap.to(el, {
                    opacity: 0, filter: "blur(12px)", duration: 0.55, ease: "power2.in",
                    onComplete: () => gsap.set(el, { filter: "blur(0px)" }),
                });
            } else {
                gsap.to(el, { opacity: 0, duration: 0.4 });
            }
        });
    }, [displayId]);

    // ── navigation animate-in (fires after activeId state update) ────
    useEffect(() => {
        if (!pendingNavRef.current || !isExpanded || !activeId) return;
        const { direction } = pendingNavRef.current;
        pendingNavRef.current = null;
        const xIn = direction === "next" ? 80 : -80;
        gsap.fromTo(titleRef.current, { x: xIn, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
        gsap.fromTo(expandedImgRef.current, { x: xIn * 0.3, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
        gsap.fromTo(detailRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: 0.15 });
        gsap.fromTo(navRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.2, onComplete: () => { isAnimatingNavRef.current = false; } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    // ── navigate ─────────────────────────────────────────────
    function navigateTo(newId: number, direction: "prev" | "next") {
        if (isAnimatingNavRef.current) return;
        isAnimatingNavRef.current = true;
        const xOut = direction === "next" ? -80 : 80;
        gsap.to(titleRef.current, { x: xOut, opacity: 0, duration: 0.25, ease: "power2.in" });
        gsap.to(expandedImgRef.current, { x: xOut * 0.3, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(detailRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(navRef.current, { opacity: 0, duration: 0.2 });
        gsap.delayedCall(0.32, () => {
            pendingNavRef.current = { direction };
            setActiveId(newId);
        });
    }

    // ── close ────────────────────────────────────────────────
    function close() {
        const id = activeIdRef.current;
        if (!id) return;

        const listTitleEl = listTitleRefs.current.get(id);
        const h1El = titleRef.current;
        const hero = heroTitleRef.current;

        // Hero title flies back to list position
        if (h1El && listTitleEl && hero) {
            const h1Rect = h1El.getBoundingClientRect();
            const listRect = listTitleEl.getBoundingClientRect();
            const h1FontSize = window.getComputedStyle(h1El).fontSize;

            gsap.set(hero, {
                display: "block",
                left: h1Rect.left,
                top: h1Rect.top,
                fontSize: h1FontSize,
                opacity: 1,
                color: "#ffffff",
                transformOrigin: "top left",
            });
            gsap.set(h1El, { opacity: 0 });

            const dx = listRect.left - h1Rect.left;
            const dy = listRect.top - h1Rect.top;
            const scaleX = listRect.width / h1Rect.width;
            const scaleY = listRect.height / h1Rect.height;

            gsap.fromTo(hero,
                { x: 0, y: 0, scaleX: 1, scaleY: 1 },
                {
                    x: dx, y: dy, scaleX, scaleY, duration: 0.55, ease: "expo.in",
                    onComplete: () => { gsap.set(hero, { display: "none", clearProps: "transform" }); },
                }
            );
        }

        // Hero image: expand from slot back to full-screen, then fade out
        if (expandedImgRef.current && heroImgRef.current) {
            const r = expandedImgRef.current.getBoundingClientRect();
            gsap.set(expandedImgRef.current, { opacity: 0 });
            gsap.set(heroImgRef.current, {
                display: "block",
                opacity: 1,
                top: r.top,
                left: r.left,
                right: "auto",
                bottom: "auto",
                width: r.width,
                height: r.height,
                borderRadius: 12,
            });
            gsap.to(heroImgRef.current, {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
                borderRadius: 0,
                duration: 0.65,
                ease: "expo.inOut",
                onComplete: () => {
                    gsap.to(heroImgRef.current, {
                        opacity: 0, duration: 0.25,
                        onComplete: () => gsap.set(heroImgRef.current, { display: "none" }),
                    });
                },
            });
        }

        gsap.to(detailRef.current, { opacity: 0, duration: 0.15 });
        gsap.to(navRef.current, { opacity: 0, duration: 0.15 });
        isAnimatingNavRef.current = false;
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.5 });
        gsap.to(listRef.current, { opacity: 1, y: 0, duration: 0.4, delay: 0.6, ease: "power2.out" });

        setIsExpanded(false);
        setTimeout(() => {
            setActiveId(null);
            // Only clear GSAP-set opacity — never clearProps:"all" or it strips
            // React's inline fontSize and React won't re-apply it (fiber thinks it's set)
            gsap.set(h1El, { opacity: 1 });
        }, 750);
    }

    function open(id: number) {
        setActiveId(id);
        setIsExpanded(true);
        gsap.to(listRef.current, { opacity: 0, y: 8, duration: 0.2 });
    }

    // ── scroll to navigate ───────────────────────────────────
    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            if (isExpanded) return;
            if (scrollCooldownRef.current) return;
            scrollCooldownRef.current = true;
            setTimeout(() => { scrollCooldownRef.current = false; }, 600);

            const direction = e.deltaY > 0 ? "next" : "prev";
            setAutoId((cur) => {
                const idx = projects.findIndex((p) => p.id === cur);
                const next = direction === "next"
                    ? (idx + 1) % projects.length
                    : (idx - 1 + projects.length) % projects.length;
                return projects[next].id;
            });
        };
        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
    });

    // ── escape ───────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!isExpanded) return;
            if (e.key === "Escape" || e.key === "Backspace") close();
            if (e.key === "ArrowLeft" && prevProject) navigateTo(prevProject.id, "prev");
            if (e.key === "ArrowRight" && nextProject) navigateTo(nextProject.id, "next");
        };
        const onKeyList = (e: KeyboardEvent) => {
            if (isExpanded) return;
            if (e.key === "Backspace") navigate("/");
            if (e.key === "Enter" && displayId != null) open(displayId);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const dir = e.key === "ArrowDown" ? 1 : -1;
                setAutoId((cur) => {
                    const idx = projects.findIndex((p) => p.id === cur);
                    return projects[(idx + dir + projects.length) % projects.length].id;
                });
            }
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("keydown", onKeyList);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("keydown", onKeyList);
        };
    });

    // ── open animation ───────────────────────────────────────
    useEffect(() => {
        if (!isExpanded || !activeProject) return;

        // Overlay: snap to visible immediately (no opacity transition — avoids stacking-context race)
        gsap.set(overlayRef.current, { opacity: 1 });

        const listTitleEl = listTitleRefs.current.get(activeProject.id);
        const h1El = titleRef.current;
        const hero = heroTitleRef.current;

        if (listTitleEl && h1El && hero) {
            const listRect = listTitleEl.getBoundingClientRect();
            const h1Rect = h1El.getBoundingClientRect();
            const h1FontSize = window.getComputedStyle(h1El).fontSize; // computed px, not clamp string

            gsap.set(h1El, { opacity: 0 });

            // Hero sits at the h1's position with the h1's computed font size.
            // This means when it hands off to the real h1, sizes match exactly — no jump.
            gsap.set(hero, {
                display: "block",
                left: h1Rect.left,
                top: h1Rect.top,
                fontSize: h1FontSize,
                opacity: 1,
                color: "#ffffff",
                transformOrigin: "top left",
            });

            // Animate FROM the list position (translate + scale) TO natural position
            const dx = listRect.left - h1Rect.left;
            const dy = listRect.top - h1Rect.top;
            const scaleX = listRect.width / h1Rect.width;
            const scaleY = listRect.height / h1Rect.height;

            gsap.fromTo(hero,
                { x: dx, y: dy, scaleX, scaleY },
                {
                    x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.72, ease: "expo.out",
                    onComplete: () => {
                        gsap.set(hero, { display: "none", clearProps: "transform" });
                        gsap.set(h1El, { opacity: 1 });
                    },
                }
            );
        } else if (h1El) {
            gsap.fromTo(h1El, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
        }

        // Hero image: shrinks from full-screen to the image slot
        if (expandedImgRef.current && heroImgRef.current) {
            const r = expandedImgRef.current.getBoundingClientRect();
            gsap.set(heroImgRef.current, {
                display: "block",
                opacity: 1,
                top: 0,
                left: 0,
                right: "auto",
                bottom: "auto",
                width: window.innerWidth,
                height: window.innerHeight,
                borderRadius: 0,
            });
            gsap.set(expandedImgRef.current, { opacity: 0 });

            gsap.to(heroImgRef.current, {
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                borderRadius: 12,
                duration: 0.8,
                ease: "expo.inOut",
                onComplete: () => {
                    gsap.set(heroImgRef.current, { display: "none" });
                    gsap.set(expandedImgRef.current, { opacity: 1 });
                },
            });
        }

        // Detail and nav: slide up after animations land
        gsap.fromTo(detailRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", delay: 0.8 }
        );
        gsap.fromTo(navRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out", delay: 0.9 }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-zinc-950"
            onClick={() => { if (!isExpanded && displayId != null) open(displayId); }}
        >
            {/* ── background images ─────────────────────────── */}
            <div className="absolute inset-0 z-0">
                {projects.map((p) => (
                    <div
                        key={p.id}
                        ref={(el) => { if (el) imageRefs.current.set(p.id, el); }}
                        className="absolute inset-0 opacity-0"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/55" />
                    </div>
                ))}
                <div className="absolute inset-0 bg-zinc-950 -z-10" />
            </div>
            {/* ── grain ─────────────────────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
            />
            <TransitionLink
                href="/"
                className="absolute top-5 right-5 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm tracking-widest uppercase transition-colors duration-200"
            >
                <MoveLeft />
                BACKSPACE
            </TransitionLink>
            {/* ── project list — bottom right ───────────────── */}
            <div ref={listRef} className="absolute bottom-10 right-10 z-20 flex flex-col items-end gap-0.5">
                {projects.map((p, i) => (
                    <button
                        key={p.id}
                        onMouseEnter={() => setHoveredId(p.id)}
                        onMouseLeave={() => { setAutoId(p.id); setHoveredId(null); }}
                        onClick={(e) => { e.stopPropagation(); open(p.id); }}
                        className="group flex items-center gap-4 py-1.5 cursor-pointer"
                    >
                        <span className={`text-xs transition-colors duration-500 ${displayId === p.id ? "text-white/50" : "text-white/20"}`}>
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`text-xs uppercase tracking-widest transition-colors duration-500 ${displayId === p.id ? "text-white/70" : "text-white/30"}`}>
                            {p.category}
                        </span>
                        <span
                            ref={(el) => { if (el) listTitleRefs.current.set(p.id, el); }}
                            className={`font-light transition-[letter-spacing,color,opacity] duration-500 ${displayId === p.id ? "text-white tracking-wide" : "text-white/40"}`}
                            style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                        >
                            {p.title}
                        </span>
                    </button>
                ))}
            </div>
            {/* ── Hero: flying title ────────────────────────── */}
            {/* Fixed so it lives above all stacking contexts — always visible during transition */}
            <div
                ref={heroTitleRef}
                className="fixed pointer-events-none font-light leading-none whitespace-nowrap"
                style={{ zIndex: 50, display: "none", top: 0, left: 0 }}
            >
                {activeProject?.title}
            </div>
            {/* ── Hero: clip-path image ─────────────────────── */}
            <div
                ref={heroImgRef}
                className="fixed pointer-events-none overflow-hidden"
                style={{ zIndex: 40, display: "none" }}
            >
                {activeProject && (
                    // eslint-disable-next-line @next/next/no-img-element
                    (<img src={activeProject.image} alt="" className="w-full h-full object-cover" />)
                )}
            </div>
            {/* ── EXPANDED VIEW ─────────────────────────────── */}
            <div
                ref={overlayRef}
                className="absolute inset-0 z-30 opacity-0"
                style={{ pointerEvents: isExpanded ? "auto" : "none" }}
            >
                <div className="absolute inset-0 bg-zinc-950" />

                <Button
                    onClick={close}
                    className="absolute top-5 right-5 z-20 text-white/40 hover:text-white text-sm tracking-widest uppercase transition-colors duration-200"
                >
                    <MoveLeft />
                    BACKSPACE
                </Button>

                {/* ── prev / next nav — bottom right ─────────── */}
                <div ref={navRef} className="absolute bottom-10 right-10 z-20 flex items-center gap-6 opacity-0">
                    {prevProject && (
                        <button
                            onClick={() => navigateTo(prevProject.id, "prev")}
                            className="group flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors duration-200"
                        >
                            <ChevronLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                            <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors duration-200">
                                {String(prevIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="text-xs uppercase tracking-widest">{prevProject.title}</span>
                        </button>
                    )}
                    {nextProject && (
                        <button
                            onClick={() => navigateTo(nextProject.id, "next")}
                            className="group flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors duration-200"
                        >
                            <span className="text-xs uppercase tracking-widest">{nextProject.title}</span>
                            <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors duration-200">
                                {String(nextIndex + 1).padStart(2, "0")}
                            </span>
                            <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                    )}
                </div>

                {/* No overflow on this wrapper — avoids clipping GSAP-transformed children */}
                <div className="relative z-10 flex flex-col h-full px-10 sm:px-16 pt-14 pb-6">

                    <h1
                        ref={titleRef}
                        className="text-white font-light mb-6 leading-none shrink-0"
                        style={{ fontSize: TITLE_FONT }}
                    >
                        {activeProject?.title}
                    </h1>

                    {/* Full-width image — object-cover fills the slot */}
                    <div
                        ref={expandedImgRef}
                        className="w-full shrink-0 overflow-hidden rounded-xl"
                        style={{ height: "48vh" }}
                    >
                        {activeProject && (
                            // eslint-disable-next-line @next/next/no-img-element
                            (<img
                                src={activeProject.image}
                                alt={activeProject.title}
                                className="w-full h-full object-cover"
                            />)
                        )}
                    </div>

                    {/* Detail: only this section scrolls */}
                    <div ref={detailRef} className="mt-7 flex-1 overflow-y-auto opacity-0 pr-1">
                        <div className="flex gap-8 mb-4 text-white/35 text-sm">
                            <span>{activeProject?.category}</span>
                            <span>{activeProject?.year}</span>
                        </div>
                        <p className="text-white/65 text-lg font-light leading-relaxed mb-7 max-w-3xl">
                            {activeProject?.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {activeProject?.tech.map((t) => (
                                <span key={t} className="text-xs text-white/45 border border-white/10 rounded-full px-3 py-1">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
