"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Home, MoveLeft } from "lucide-react";
import { TransitionLink } from "@/components/transition-link";
import { Slider } from "radix-ui";
import { SlideButton } from "@/components/ui/slide-button";

const TICKER_ITEMS = ["UNDER CONSTRUCTION", "——", "COMING SOON", "——", "STAY TUNED", "——"];
const TICKER_TEXT = Array(6).fill(TICKER_ITEMS).flat().join("  ");

export default function Projects() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);
    const metaRef = useRef<HTMLParagraphElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // entrance
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

            // cursor blink
            gsap.to(cursorRef.current, {
                opacity: 0,
                duration: 0.55,
                ease: "steps(1)",
                repeat: -1,
                yoyo: true,
            });

            // slow breath on title
            gsap.to(titleRef.current, {
                scale: 1.012,
                duration: 3.5,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: 1.5,
            });

            // marquee row 1 — left
            const w1 = row1Ref.current?.scrollWidth ?? 0;
            gsap.fromTo(row1Ref.current,
                { x: 0 },
                { x: -w1 / 2, duration: 275, ease: "none", repeat: -1 }
            );

            // marquee row 2 — right
            const w2 = row2Ref.current?.scrollWidth ?? 0;
            gsap.fromTo(row2Ref.current,
                { x: -w2 / 2 },
                { x: 0, duration: 275, ease: "none", repeat: -1 }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
            {/* grain */}
            <div
                className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
            />

            {/* marquee rows */}
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
