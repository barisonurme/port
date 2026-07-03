"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { usePageTransition } from "@/components/transition-provider";
import { SlideButton } from "@/components/ui/slide-button";

function GlassSphere() {
  return (
    <mesh>
      <sphereGeometry args={[0.75, 64, 64]} />
      <MeshTransmissionMaterial
        ior={1.5}
        thickness={0.5}
        anisotropy={0.05}
        chromaticAberration={0.15}
        roughness={0}
        color="white"
      />
    </mesh>
  );
}

export type CARDS = {
  id: number;
  image: string;
  label: string;
  /** When set, clicking the card navigates here instead of opening the lightbox. */
  href?: string;
}[]


export function StickyProjectParallax({ CARDS, scroller, onActiveChange }: { CARDS: CARDS; scroller?: { current: HTMLElement | null }; onActiveChange?: (index: number) => void }) {
  const navigate = usePageTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorIconRef = useRef<HTMLSpanElement>(null);
  const cardCursorRef = useRef<HTMLDivElement>(null);
  const overCloseRef = useRef(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Scroll-based parallax animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const scrollerEl = scroller?.current ?? window;
    const vh = scroller?.current?.clientHeight ?? window.innerHeight;
    const numCards = CARDS.length;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      // Center each card; off-screen cards start below (y = vh)
      gsap.set(card, { xPercent: -50, yPercent: -50, y: i > 0 ? vh : 0 });

      if (i > 0) {
        gsap.to(card, {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            scroller: scrollerEl,
            start: `top+=${(i - 1) * vh}px top`,
            end: `top+=${i * vh}px top`,
            scrub: true,
          },
        });
      }

      if (i < numCards - 1) {
        gsap.to(card, {
          rotate: -8,
          scale: 0.75,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            scroller: scrollerEl,
            start: `top+=${i * vh}px top`,
            end: `top+=${(i + 1) * vh}px top`,
            scrub: true,
          },
        });
      }
    });

    if (onActiveChange) {
      activeIndexRef.current = 0;
      onActiveChange(0);

      ScrollTrigger.create({
        trigger: container,
        scroller: scrollerEl,
        start: "top top",
        end: `+=${Math.max(numCards - 1, 1) * vh}`,
        scrub: true,
        onUpdate: (self) => {
          const idx = numCards > 1 ? Math.round(self.progress * (numCards - 1)) : 0;
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            onActiveChange(idx);
          }
        },
      });
    }

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller]);

  const openCard = useCallback((index: number) => {
    const href = CARDS[index]?.href;
    if (href) {
      navigate(href);
      return;
    }

    const card = cardRefs.current[index];
    const overlay = overlayRef.current;
    if (!card || !overlay) return;

    const rect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const topPct = (rect.top / vh) * 100;
    const rightPct = ((vw - rect.right) / vw) * 100;
    const bottomPct = ((vh - rect.bottom) / vh) * 100;
    const leftPct = (rect.left / vw) * 100;

    setExpandedIndex(index);
    document.body.style.overflow = "hidden";

    gsap.set(overlay, {
      display: "flex",
      clipPath: `inset(${topPct}% ${rightPct}% ${bottomPct}% ${leftPct}% round 16px)`,
      opacity: 1,
    });

    gsap.to(overlay, {
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      duration: 0.65,
      ease: "power3.inOut",
    });
  }, [CARDS, navigate]);

  const closeCard = useCallback(() => {
    const overlay = overlayRef.current;
    const cursor = cursorRef.current;
    if (!overlay) return;

    if (cursor) gsap.set(cursor, { opacity: 0 });

    gsap.to(overlay, {
      clipPath: "inset(8% 8% 8% 8% round 20px)",
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(overlay, { display: "none", opacity: 1 });
        setExpandedIndex(null);
        document.body.style.overflow = "";
      },
    });
  }, []);

  const goTo = useCallback((direction: 1 | -1) => {
    setExpandedIndex((prev) => {
      if (prev === null) return null;
      const next = Math.max(0, Math.min(CARDS.length - 1, prev + direction));
      if (next === prev) return prev;

      const img = overlayImgRef.current;
      if (img) {
        gsap.fromTo(
          img,
          { opacity: 0, x: direction * 40 },
          { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
        );
      }
      return next;
    });
  }, [CARDS.length]);

  // Keyboard navigation
  useEffect(() => {
    if (expandedIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(1);
      else if (e.key === "ArrowLeft") goTo(-1);
      else if (e.key === "Backspace") closeCard();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedIndex, goTo, closeCard]);

  // Custom cursor position tracking
  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    const cursor = cursorRef.current;
    const icon = cursorIconRef.current;
    if (!cursor || !icon) return;

    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    if (overCloseRef.current) {
      icon.textContent = "✕";
    } else if (e.clientX < window.innerWidth / 2) {
      icon.textContent = "←";
    } else {
      icon.textContent = "→";
    }
  }, []);

  const handleOverlayMouseEnter = useCallback(() => {
    const cursor = cursorRef.current;
    if (cursor) gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
  }, []);

  const handleOverlayMouseLeave = useCallback(() => {
    const cursor = cursorRef.current;
    if (cursor) gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (overCloseRef.current) {
        closeCard();
        return;
      }
      if (e.clientX < window.innerWidth / 2) {
        goTo(-1);
      } else {
        goTo(1);
      }
    },
    [closeCard, goTo]
  );

  // Custom arrow cursor for the card previews
  const handleCardMouseMove = useCallback((e: React.MouseEvent) => {
    const cursor = cardCursorRef.current;
    if (!cursor) return;
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    const cursor = cardCursorRef.current;
    if (cursor) gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    const cursor = cardCursorRef.current;
    if (cursor) gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${CARDS.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => openCard(i)}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="group absolute top-1/2 left-1/2 w-[90vw] h-[82vh] rounded-2xl overflow-hidden cursor-none"
              style={{ zIndex: i + 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.label}
                className="w-full h-full object-cover transition-[filter] duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/50" />
              <div
                className="absolute bottom-8 left-8 text-white font-light leading-none select-none"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                {card.label}
              </div>
            </div>
          ))}


        </div>
      </div>

      <div className="relative w-full py-32 flex items-center justify-center">
        <SlideButton onClick={() => navigate("/projects")}>
          See all projects
        </SlideButton>
      </div>

      {mounted && createPortal(
        <>
          {/* Fullscreen overlay — portaled to body to escape any GSAP transform context */}
          <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            onMouseMove={handleOverlayMouseMove}
            onMouseEnter={handleOverlayMouseEnter}
            onMouseLeave={handleOverlayMouseLeave}
            className="fixed inset-0 z-200 hidden items-center justify-center cursor-none select-none"
          >
            {expandedIndex !== null && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={overlayImgRef}
                  key={expandedIndex}
                  src={CARDS[expandedIndex].image}
                  alt={CARDS[expandedIndex].label}
                  className="w-full h-full object-cover pointer-events-none"
                />

                <div className="absolute bottom-8 left-8 text-white/50 text-xs tracking-[0.3em] uppercase select-none pointer-events-none">
                  {CARDS[expandedIndex].label}
                </div>

                <div className="absolute bottom-8 right-8 text-white/30 text-xs tracking-[0.2em] select-none pointer-events-none">
                  {expandedIndex + 1} / {CARDS.length}
                </div>

                {/* Close button */}
                <div
                  onMouseEnter={() => { overCloseRef.current = true; if (cursorIconRef.current) cursorIconRef.current.textContent = "✕"; }}
                  onMouseLeave={() => { overCloseRef.current = false; }}
                >
                  <ArrowLeft />
                  <span className="text-sm leading-none">BACKSPACE</span>
                </div>
              </>
            )}
          </div>

          {/* Custom cursor */}
          <div
            ref={cursorRef}
            className="fixed pointer-events-none z-300 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden opacity-0"
            style={{ top: -100, left: -100 }}
          >
            <Canvas
              camera={{ position: [0, 0, 2.5], fov: 40 }}
              gl={{ alpha: true, antialias: true }}
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={1.5} />
              <pointLight position={[2, 2, 2]} intensity={2} />
              <pointLight position={[-2, -2, 2]} intensity={0.8} color="#aaddff" />
              <GlassSphere />
            </Canvas>
            <span ref={cursorIconRef} className="absolute inset-0 flex items-center justify-center text-white text-sm leading-none select-none z-10">
              →
            </span>
          </div>

          {/* Custom cursor for card previews */}
          <div
            ref={cardCursorRef}
            className="fixed pointer-events-none z-300 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white opacity-0"
            style={{ top: -100, left: -100 }}
          >
            <ArrowUpRight className="text-zinc-950" size={22} strokeWidth={1.5} />
          </div>
        </>,
        document.body
      )}
    </>
  );
}
