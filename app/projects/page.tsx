"use client";;
import { type ReactNode, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Home, MoveLeft, X, ZoomIn } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TransitionLink } from "@/components/transition-link";
import { usePageTransition } from "@/components/transition-provider";
import { Button } from "@/components/ui/button";
import { SlideButton } from "@/components/ui/slide-button";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/projects-data";
import { ProjectGallery } from "@/components/project-gallery";

const UNDER_CONSTRUCTION = false;

// ── Under Construction ───────────────────────────────────────────────────────

const TICKER_ITEMS = ["UNDER CONSTRUCTION", "——", "COMING SOON", "——", "STAY TUNED", "——"];
const TICKER_TEXT = Array(6).fill(TICKER_ITEMS).flat().join("  ");

function UnderConstruction() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);
    const metaRef = useRef<HTMLParagraphElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(metaRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
            );
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.35 }
            );
            gsap.fromTo(subRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.7 }
            );
            gsap.to(cursorRef.current, {
                opacity: 0, duration: 0.55, ease: "steps(1)", repeat: -1, yoyo: true,
            });
            gsap.to(titleRef.current, {
                scale: 1.012, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.5,
            });

            const w1 = row1Ref.current?.scrollWidth ?? 0;
            gsap.fromTo(row1Ref.current, { x: 0 }, { x: -w1 / 2, duration: 275, ease: "none", repeat: -1 });

            const w2 = row2Ref.current?.scrollWidth ?? 0;
            gsap.fromTo(row2Ref.current, { x: -w2 / 2 }, { x: 0, duration: 275, ease: "none", repeat: -1 });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
            <div
                className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
            /* Noise */
            /* style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} */
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden pointer-events-none select-none" style={{ zIndex: 1 }}>
                <div className="overflow-hidden">
                    <div ref={row1Ref} className="flex whitespace-nowrap" style={{ opacity: 0.04 }}>
                        <span className="text-white font-bold uppercase tracking-widest" style={{ fontSize: "clamp(12rem, 10vw, 8rem)" }}>
                            {TICKER_TEXT}&nbsp;&nbsp;{TICKER_TEXT}
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden">
                    <div ref={row2Ref} className="flex whitespace-nowrap" style={{ opacity: 0.04 }}>
                        <span className="text-white font-bold uppercase tracking-widest" style={{ fontSize: "clamp(12rem, 10vw, 8rem)" }}>
                            {TICKER_TEXT}&nbsp;&nbsp;{TICKER_TEXT}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-20 flex flex-col items-center gap-6 text-center">
                <p ref={metaRef} className="text-white/20 text-xs uppercase tracking-[0.3em]" style={{ opacity: 0 }}>
                    Projects
                </p>
                <h1
                    ref={titleRef}
                    className="text-white font-light leading-none"
                    style={{ fontSize: "clamp(3.5rem, 12vw, 10rem)", opacity: 0 }}
                >
                    Under Construction<span ref={cursorRef} className="ml-2 inline-block w-[0.08em] h-[0.85em] bg-white/60 align-middle" />
                </h1>
                <p ref={subRef} className="text-white/30 text-sm font-light max-w-sm w-full text-nowrap leading-relaxed" style={{ opacity: 0 }}>
                    Something worth showing is being built here. Check back soon.
                </p>
                <TransitionLink href="/">
                    <SlideButton className="mt-8" icon={false}>
                        <Home size={15} className="inline-block transition-transform group-hover:-translate-x-0.5" />
                        <span className='px-4'>Home</span>
                    </SlideButton>
                </TransitionLink>
            </div>
        </div>
    );
}

// ── Projects ─────────────────────────────────────────────────────────────────

const projectContent: Record<number, ReactNode> = {
    1: (
        <div className="mt-10 space-y-10">
            <ProjectGallery
                images={[
                    { src: "/expense-ai/expense-ai-2.png", alt: "Screens" },
                    { src: "/expense-ai/expense-ai-3.png", alt: "Screen Details" },
                ]}
            />

            <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Highlights</p>
                <ul className="space-y-2 text-white/55 text-sm font-light">
                    <li>— Built an AI chat assistant (Groq) that answers spending questions grounded in the user&apos;s real transaction history</li>
                    <li>— Designed a recurring-transaction engine for subscriptions and repeat income/expenses with end-date support</li>
                    <li>— Implemented passwordless auth via email verification codes with JWT access/refresh token rotation</li>
                    <li>— Shipped a guided onboarding flow that personalizes savings goals, check-in frequency, and dashboard focus metrics</li>
                </ul>
            </div>
            <Button asChild className='px-4 md:px-12 text-white hover:opacity-90' style={{ backgroundColor: "#4CD18F" }}>
                <a href="https://expense.barisonurme.com/" target="_blank" rel="noopener noreferrer">View Live Demo</a>
            </Button>
        </div>
    ),
    2: (
        <div className="mt-10 space-y-10">
            <ProjectGallery
                images={[
                    { src: "/fit-log/fit-log-2.png", alt: "Screens" },
                    { src: "/fit-log/fit-log-3.png", alt: "Screen Details" },
                ]}
            />
            <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Highlights</p>
                <ul className="space-y-2 text-white/55 text-sm font-light">
                    <li>— Built on-device rep detection on watchOS with Core Motion: gravity-vector and rotation features classify the exercise, and a peak/valley detector with prominence thresholds counts reps while rejecting jitter</li>
                    <li>— Designed a pluggable exercise-profile system — adding a new exercise is a single profile entry plus a recorded motion template CSV, no detector code changes</li>
                    <li>— Made classification robust with per-session frame voting, so a brief misclassification flicker can&apos;t outvote the exercise actually being performed</li>
                    <li>— Built a muscle heat map on iPhone that visualizes training coverage from workout history synced via WatchConnectivity</li>
                    <li>— Shipped an AI coach chat backed by Claude through a server-side relay, with cookie-based session auth shared across the app&apos;s services</li>
                </ul>
            </div>
            <Button asChild className='px-4 md:px-12 text-white hover:opacity-90' style={{ backgroundColor: "#007AFF" }}>
                <a href="https://expense.barisonurme.com/" target="_blank" rel="noopener noreferrer">View Landing Page</a>
            </Button>
        </div>
    ),
    3: (
        <div className="mt-10 space-y-10">
            <ProjectGallery
                images={[
                    { src: "/notify/notify-01.png", alt: "Dashboard overview" },
                    { src: "/notify/notify-02.png", alt: "Delivery logs" },
                ]}
            />
            <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Highlights</p>
                <ul className="space-y-2 text-white/55 text-sm font-light">
                    <li>— Built project &amp; provider management: CRUD for projects, per-project Email/SMS/Push provider configuration with quotas and API key generation</li>
                    <li>— Built a visual, drag-and-drop email template builder on Tiptap a real WYSIWYG editing surface, not just CRUD forms</li>
                    <li>— Implemented RBAC/team management with project invites, role assignment, and role-gated routing via middleware</li>
                    <li>— Built filterable, paginated delivery log/audit tooling for message delivery status per project</li>
                    <li>— Shipped full i18n, OIDC-based auth with token refresh interceptors, and an internal wiki/developer docs surface</li>
                </ul>
            </div>
            <Button asChild className='px-4 md:px-12 text-white hover:opacity-90' style={{ backgroundColor: "#FF5B3F" }}>
                <a href="https://notify.ekinoks.io/" target="_blank" rel="noopener noreferrer">View Live Demo</a>
            </Button>
        </div>
    ),
    4: (
        <div className="mt-10 space-y-10">
            <UnderConstruction />
        </div>
    ),
};

const TITLE_FONT = "clamp(4rem, 14vw, 13rem)";

function ProjectsPage() {
    const navigate = usePageTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
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
    const scrollWrapperRef = useRef<HTMLDivElement>(null);
    const heroImgRef = useRef<HTMLDivElement>(null);
    const heroTitleRef = useRef<HTMLDivElement>(null);
    const magnifierCursorRef = useRef<HTMLDivElement>(null);
    const magnifierVisibleRef = useRef(false);

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

    useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

    useEffect(() => {
        if (isExpanded && magnifierCursorRef.current) {
            magnifierVisibleRef.current = false;
            gsap.to(magnifierCursorRef.current, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
        }
    }, [isExpanded]);

    useEffect(() => {
        if (isExpanded) return;
        let idx = projects.findIndex((p) => p.id === autoId);
        const timer = setInterval(() => {
            idx = (idx + 1) % projects.length;
            setAutoId(projects[idx].id);
        }, 2500);
        return () => clearInterval(timer);
    }, [isExpanded, autoId]);

    useEffect(() => {
        const prev = prevDisplayIdRef.current;
        prevDisplayIdRef.current = displayId;

        projects.forEach((p) => {
            const el = imageRefs.current.get(p.id);
            if (!el) return;

            if (p.id === displayId) {
                gsap.fromTo(el,
                    { scale: 1.2, opacity: 0, filter: "blur(12px)" },
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

    function navigateTo(newId: number, direction: "prev" | "next") {
        if (isAnimatingNavRef.current) return;
        isAnimatingNavRef.current = true;
        const xOut = direction === "next" ? -80 : 80;
        gsap.to(titleRef.current, { x: xOut, y: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
        gsap.to(expandedImgRef.current, { x: xOut * 0.3, y: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(detailRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(navRef.current, { opacity: 0, duration: 0.2 });
        gsap.delayedCall(0.32, () => {
            if (scrollWrapperRef.current) scrollWrapperRef.current.scrollTop = 0;
            pendingNavRef.current = { direction };
            setActiveId(newId);
            router.replace(`${pathname}?open=${newId}`, { scroll: false });
        });
    }

    function close() {
        const id = activeIdRef.current;
        if (!id) return;

        router.replace(pathname, { scroll: false });

        const listTitleEl = listTitleRefs.current.get(id);
        const h1El = titleRef.current;
        const hero = heroTitleRef.current;

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
        if (scrollWrapperRef.current) scrollWrapperRef.current.scrollTop = 0;
        isAnimatingNavRef.current = false;
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.5 });
        gsap.to(listRef.current, { opacity: 1, y: 0, duration: 0.4, delay: 0.6, ease: "power2.out" });

        setAutoId(id);
        setIsExpanded(false);
        setTimeout(() => {
            setActiveId(null);
            gsap.set(h1El, { opacity: 1 });
        }, 750);
    }

    // Driven off every mousemove (not mouseenter) so the cursor still appears
    // after a client-side page transition lands with the pointer already over
    // the page — mouseenter only fires on a boundary crossing, which never
    // happens in that case.
    const handleMagnifierMouseMove = useCallback((e: React.MouseEvent) => {
        const cursor = magnifierCursorRef.current;
        if (!cursor) return;
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        const overInteractive = (e.target as HTMLElement).closest('a, button, [role="button"]');
        const shouldShow = !isExpanded && !overInteractive;
        if (shouldShow === magnifierVisibleRef.current) return;
        magnifierVisibleRef.current = shouldShow;
        gsap.to(cursor, shouldShow
            ? { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }
            : { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
    }, [isExpanded]);

    const handleMagnifierMouseLeave = useCallback(() => {
        magnifierVisibleRef.current = false;
        const cursor = magnifierCursorRef.current;
        if (cursor) gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
    }, []);

    function open(id: number) {
        if (scrollWrapperRef.current) scrollWrapperRef.current.scrollTop = 0;
        gsap.set(titleRef.current, { y: 0 });
        gsap.set(expandedImgRef.current, { y: 0 });
        gsap.set(detailRef.current, { y: 0 });
        setActiveId(id);
        setIsExpanded(true);
        gsap.to(listRef.current, { opacity: 0, y: 8, duration: 0.2 });
        router.replace(`${pathname}?open=${id}`, { scroll: false });
    }

    useEffect(() => {
        const openId = Number(searchParams.get("open"));
        if (openId === activeIdRef.current) return;
        if (!projects.some((p) => p.id === openId)) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        open(openId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        if (!isExpanded) return;
        const wrapper = scrollWrapperRef.current;
        const title = titleRef.current;
        const img = expandedImgRef.current;
        const detail = detailRef.current;
        if (!wrapper) return;
        const setTitleY = gsap.quickSetter(title, "y", "px");
        const setImgY = gsap.quickSetter(img, "y", "px");
        const setDetailY = gsap.quickSetter(detail, "y", "px");
        const onScroll = () => {
            const s = wrapper.scrollTop;
            setTitleY(s * 0.8);
            setImgY(s * 0.1);
            setDetailY(-s * 0.2);
            const blur = Math.min(s * 0.04, 12);
            gsap.set(img, { filter: `blur(${blur}px)` });
        };
        wrapper.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            wrapper.removeEventListener("scroll", onScroll);
            gsap.set(title, { y: 0 });
            gsap.set(img, { y: 0, filter: "blur(0px)" });
            gsap.set(detail, { y: 0 });
        };
    }, [isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;
        const wrapper = scrollWrapperRef.current;
        if (!wrapper) return;

        let target = wrapper.scrollTop;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            target = Math.max(0, Math.min(target + e.deltaY, wrapper.scrollHeight - wrapper.clientHeight));
            gsap.to(wrapper, { scrollTop: target, duration: 0.75, ease: "power3.out", overwrite: true });
        };
        wrapper.addEventListener("wheel", onWheel, { passive: false });
        return () => wrapper.removeEventListener("wheel", onWheel);
    }, [isExpanded]);

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

    useEffect(() => {
        if (!isExpanded || !activeProject) return;

        gsap.set(overlayRef.current, { opacity: 1 });

        const listTitleEl = listTitleRefs.current.get(activeProject.id);
        const h1El = titleRef.current;
        const hero = heroTitleRef.current;

        if (listTitleEl && h1El && hero) {
            const listRect = listTitleEl.getBoundingClientRect();
            const h1Rect = h1El.getBoundingClientRect();
            const h1FontSize = window.getComputedStyle(h1El).fontSize;

            gsap.set(h1El, { opacity: 0 });
            gsap.set(hero, {
                display: "block",
                left: h1Rect.left,
                top: h1Rect.top,
                fontSize: h1FontSize,
                opacity: 1,
                color: "#ffffff",
                transformOrigin: "top left",
            });

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
            className={cn("relative w-full h-screen overflow-hidden bg-zinc-950", !isExpanded && "cursor-none")}
            onClick={() => { if (!isExpanded && displayId != null) open(displayId); }}
            onMouseMove={handleMagnifierMouseMove}
            onMouseLeave={handleMagnifierMouseLeave}
        >
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
            <div
                className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
            />
            <TransitionLink
                href="/"
                className="absolute top-5 right-5 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm tracking-widest uppercase transition-colors duration-200 cursor-pointer"
            >
                <MoveLeft />
                BACKSPACE
            </TransitionLink>
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
            <div
                ref={heroTitleRef}
                className="fixed pointer-events-none font-light leading-none whitespace-nowrap"
                style={{ zIndex: 50, display: "none", top: 0, left: 0 }}
            >
                {activeProject?.title}
            </div>
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
            <div
                ref={overlayRef}
                className="absolute inset-0 z-30 opacity-0"
                style={{ pointerEvents: isExpanded ? "auto" : "none" }}
            >
                <div className="absolute inset-0 bg-zinc-950" />
                <Button
                    variant="ghost"
                    onClick={close}
                    size="icon-sm"
                    className="text-white/60 hover:text-white duration-200 z-9999 absolute right-2 top-2"
                >
                    <X />
                    <span className="sr-only">Close</span>
                </Button>
                <div ref={navRef} className="absolute bottom-10 right-0 w-full justify-center  md:justify-end md:right-10 z-20 flex items-center gap-6 opacity-0">
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
                <div
                    ref={scrollWrapperRef}
                    className="relative z-10 h-full overflow-y-auto px-4 md:px-10 sm:px-16 pt-14 pb-32"
                >
                    <h1
                        ref={titleRef}
                        className="relative z-10 text-white font-light mb-6 leading-none"
                        style={{ fontSize: TITLE_FONT }}
                    >
                        {activeProject?.title}
                    </h1>
                    <div
                        ref={expandedImgRef}
                        className="relative z-0 w-full overflow-hidden rounded-xl"
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
                    <div ref={detailRef} className="relative z-20 mt-7 opacity-0 bg-zinc-950 rounded-t-2xl px-8 pt-8 pb-16">
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
                        {activeProject && projectContent[activeProject.id]}
                    </div>
                </div>
            </div>

            {/* Magnifier cursor: hints that the current project can be clicked open */}
            <div
                ref={magnifierCursorRef}
                className="fixed pointer-events-none z-300 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white opacity-0"
                style={{ top: -100, left: -100 }}
            >
                <ZoomIn className="text-zinc-950" size={20} strokeWidth={1.5} />
            </div>
        </div >
    );
}

// ── Page entry ────────────────────────────────────────────────────────────────

export default function Projects() {
    return UNDER_CONSTRUCTION ? <UnderConstruction /> : (
        <Suspense fallback={null}>
            <ProjectsPage />
        </Suspense>
    );
}
