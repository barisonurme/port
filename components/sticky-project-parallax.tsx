"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { usePageTransition, useInitialLoading } from "@/components/transition-provider";
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
  description?: string;
  year?: string;
  category?: string;
  /** When set, clicking the card navigates here instead of opening the lightbox. */
  href?: string;
}[]


/** How far ahead of the card animation the active-index tracking runs, in viewport heights. */
const ACTIVE_LEAD_VH = 0.75;

/** Below this scrollY the first card is still just a scroll cue: a click scrolls
 *  the section in instead of opening a project, the hover cursor points down,
 *  and the pointer-driven 3D tilt stays off. */
const SCROLL_CUE_MAX_Y = 250;

export function StickyProjectParallax({ CARDS, scroller, onActiveChange, activeLead = ACTIVE_LEAD_VH }: { CARDS: CARDS; scroller?: { current: HTMLElement | null }; onActiveChange?: (index: number) => void; activeLead?: number }) {
  const navigate = usePageTransition();
  const initialLoading = useInitialLoading();
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Three independent planes per card — no shared clipping parent, so each can
  // tilt on its own without the others (or a wrapper) slicing its edges.
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const infoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  // Global pointer → 3D tilt: which card owns the tilt right now, whether the
  // section is on screen at all, and the last normalized cursor position so a
  // newly-activated card can snap to it without waiting for the next move.
  const tiltIndexRef = useRef(0);
  const sectionOnScreenRef = useRef(false);
  const pointerRef = useRef({ nx: 0, ny: 0 });
  // On phones / coarse pointers the per-frame tilt (three gsap.to targets on
  // every ScrollTrigger update) is the main scroll-jank source, so it's skipped
  // there entirely — the cards just slide and rotate on scroll.
  const isMobileRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorIconRef = useRef<HTMLSpanElement>(null);
  const cardCursorRef = useRef<HTMLDivElement>(null);
  const overCloseRef = useRef(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  // At the very top of the page the first card only peeks under the hero, so a
  // click there scrolls the section in rather than opening a project — and the
  // hover cursor points down instead of up-right to say so.
  const [atPageTop, setAtPageTop] = useState(true);
  // Mirror of atPageTop for the callbacks that must not re-create on every
  // scroll (applyTilt, openCard).
  const atPageTopRef = useRef(true);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Track "is this a phone / touch device" for skipping the 3D tilt.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => { isMobileRef.current = mq.matches; };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Drive one card's three planes from a normalized cursor position (nx/ny in
  // -0.5…0.5). Called from a global pointermove, so the tilt tracks the mouse
  // anywhere on screen — not only while hovering the card. Passing nx = ny = 0
  // settles the card back to flat.
  const applyTilt = useCallback((i: number, nx: number, ny: number) => {
    if (isMobileRef.current) return;
    // While the section is still a scroll cue, keep the cards perfectly flat —
    // a zero (nx = ny = 0) call still runs so a mid-tilt card can settle.
    if (atPageTopRef.current && (nx !== 0 || ny !== 0)) return;
    // Background frame — gentle tilt on a deep perspective; nothing clips it.
    const frame = frameRefs.current[i];
    if (frame) {
      gsap.to(frame, {
        rotateX: -ny * 5,
        rotateY: nx * 7,
        transformPerspective: 1600,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    // Image panel + card text — a separate plane, stronger tilt and a
    // counter-shift on a tighter perspective, floating above the frame.
    const rx = -ny * 11;
    const ry = nx * 14;
    const tx = nx * -10;
    const ty = ny * -10;
    const flat = nx === 0 && ny === 0;

    const panel = panelRefs.current[i];
    if (panel) {
      gsap.to(panel, {
        rotateX: rx,
        rotateY: ry,
        x: tx,
        y: ty,
        scale: flat ? 1 : 1.04,
        transformPerspective: 1100,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    const info = infoRefs.current[i];
    if (info) {
      gsap.to(info, {
        rotateX: rx,
        rotateY: ry,
        x: tx,
        y: ty,
        transformPerspective: 1100,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  // Track whether we're still in the "scroll cue" zone near the top of the page.
  // Drives the down/up-right hover cursor, the click behavior and the 3D tilt.
  useEffect(() => {
    const onScroll = () => {
      const atTop = window.scrollY < SCROLL_CUE_MAX_Y;
      if (atTop === atPageTopRef.current) return;
      atPageTopRef.current = atTop;
      setAtPageTop(atTop);
      // Leaving the cue zone: let the active card pick up the cursor. Entering
      // it: settle whatever card was mid-tilt back to flat.
      const { nx, ny } = pointerRef.current;
      applyTilt(tiltIndexRef.current, atTop ? 0 : nx, atTop ? 0 : ny);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [applyTilt]);

  // Global pointer tracking: tilt the active card wherever the mouse is.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      pointerRef.current = { nx, ny };
      if (sectionOnScreenRef.current) applyTilt(tiltIndexRef.current, nx, ny);
    };
    const onLeave = () => applyTilt(tiltIndexRef.current, 0, 0);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [applyTilt]);

  // Blur + fade the whole pinned stack in, rising from the bottom. Created
  // paused at mount so the hidden state is set before first paint (no flash),
  // then played once the initial loading screen is gone — see the
  // [initialLoading] effect below.
  const introRef = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;

    const intro = gsap.fromTo(
      sticky,
      { autoAlpha: 0, filter: "blur(24px)", y: 120 },
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        // Last of the staggered intros: text 0s, header +0.5s, project stack +1s.
        // The delay counts from play(), so it stays anchored to the loader wipe.
        delay: 1,
        paused: true,
        // Drop the filter entirely once revealed — a lingering `filter` on this
        // ancestor rasterizes the subtree and kills the cards' own backdrop-blur.
        onComplete: () => gsap.set(sticky, { filter: "none" }),
      }
    );
    introRef.current = intro;

    return () => {
      intro.kill();
      introRef.current = null;
    };
  }, []);

  // Play the intro once the loader is gone, from the same moment the header/hero
  // intros start. On a client-side nav there's no loader, so initialLoading is
  // already false on mount and it plays right away.
  useEffect(() => {
    if (!initialLoading) introRef.current?.play();
  }, [initialLoading]);

  // Scroll-based parallax animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // The mobile URL bar hides on scroll and fires a resize mid-gesture.
    // Without this, ScrollTrigger recomputes every start/end from the new
    // innerHeight and the pinned (position: sticky) card stack jumps. Same
    // idea as the /projects title: don't let JS disturb the native pin.
    ScrollTrigger.config({ ignoreMobileResize: true });
    const isMobile = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    // Boolean scrub snaps progress to each scroll event; iOS momentum scroll
    // delivers those in bursts, so the slide/rotate stutters. A small numeric
    // scrub lets GSAP interpolate on its own ticker between them.
    const cardScrub: number | boolean = isMobile ? 0.4 : true;

    const container = containerRef.current;
    if (!container) return;

    const scrollerEl = scroller?.current ?? window;
    const vh = scroller?.current?.clientHeight ?? window.innerHeight;
    const numCards = CARDS.length;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      // Center each card; off-screen cards start below (y = vh)
      gsap.set(card, { xPercent: -50, yPercent: -50, y: i > 0 ? vh : 0 });

      // Baseline for the pointer-driven 3D tilt. Frame, image panel and text are
      // separate planes with no clipping wrapper, so each rotates freely and
      // shows its full rounded shape.
      const frame = frameRefs.current[i];
      if (frame) gsap.set(frame, { transformOrigin: "center" });
      const panel = panelRefs.current[i];
      if (panel) gsap.set(panel, { transformOrigin: "center" });
      const infoEl = infoRefs.current[i];
      if (infoEl) gsap.set(infoEl, { transformOrigin: "center" });

      if (i > 0) {
        gsap.to(card, {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            scroller: scrollerEl,
            start: `top+=${(i - 1) * vh}px top`,
            end: `top+=${i * vh}px top`,
            scrub: cardScrub,
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
            scrub: cardScrub,
          },
        });
      }

      // Title / meta / description reveal, played as the card takes over the
      // viewport. It stays revealed for the rest of the section — only
      // scrolling back above the start rewinds it.
      const info = card.querySelector<HTMLElement>("[data-card-info]");
      if (info) {
        const meta = info.querySelector<HTMLElement>("[data-card-meta]");
        const chars = info.querySelectorAll<HTMLElement>("[data-card-char]");
        const desc = info.querySelector<HTMLElement>("[data-card-desc]");

        gsap.set(info, { opacity: 1 });
        gsap.set(chars, { yPercent: 120 });
        if (meta) gsap.set(meta, { opacity: 0, y: 12 });
        if (desc) gsap.set(desc, { opacity: 0, y: 18 });

        const reveal = gsap.timeline({ paused: true });
        if (meta) reveal.to(meta, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
        reveal.to(chars, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.022 }, 0.06);
        if (desc) reveal.to(desc, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.3);

        // The first card is already on screen, so it reveals slightly before the
        // section pins; the rest reveal while they slide up into place.
        const startPx = i === 0 ? -0.35 * vh : (i - 1) * vh + 0.62 * vh;

        ScrollTrigger.create({
          trigger: container,
          scroller: scrollerEl,
          start: `top+=${startPx}px top`,
          end: "bottom bottom",
          toggleActions: "play none none reverse",
          animation: reveal,
        });
      }
    });

    // Keep the global-pointer tilt pointed at the right card, and let it idle
    // while the section is off screen.
    ScrollTrigger.create({
      trigger: container,
      scroller: scrollerEl,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        sectionOnScreenRef.current = self.isActive;
        if (!self.isActive) applyTilt(tiltIndexRef.current, 0, 0);
      },
    });

    ScrollTrigger.create({
      trigger: container,
      scroller: scrollerEl,
      start: "top top",
      end: `+=${Math.max(numCards - 1, 1) * vh}`,
      scrub: true,
      onUpdate: (self) => {
        const idx = numCards > 1 ? Math.round(self.progress * (numCards - 1)) : 0;
        if (idx === tiltIndexRef.current) return;
        // Hand the tilt over: settle the card we're leaving, snap the new one
        // to wherever the cursor already is.
        applyTilt(tiltIndexRef.current, 0, 0);
        tiltIndexRef.current = idx;
        const { nx, ny } = pointerRef.current;
        applyTilt(idx, nx, ny);
      },
    });

    if (onActiveChange) {
      activeIndexRef.current = -1;

      // Lead-in: only the first card claims the background early, before the
      // section reaches the top of the viewport. Later indices stay in sync
      // with their card animation.
      ScrollTrigger.create({
        trigger: container,
        scroller: scrollerEl,
        start: `top-=${vh * activeLead}px top`,
        end: "top top",
        onEnter: () => {
          activeIndexRef.current = 0;
          onActiveChange(0);
        },
        onEnterBack: () => {
          activeIndexRef.current = 0;
          onActiveChange(0);
        },
        onLeaveBack: () => {
          activeIndexRef.current = -1;
          onActiveChange(-1);
        },
      });

      ScrollTrigger.create({
        trigger: container,
        scroller: scrollerEl,
        start: "top top",
        end: `+=${Math.max(numCards - 1, 1) * vh}`,
        scrub: true,
        // Past the last card the background is free again — hand it back
        // to the idle cycle, and reclaim it when scrolling back in.
        onLeave: () => {
          activeIndexRef.current = -1;
          onActiveChange(-1);
        },
        onEnterBack: () => {
          const idx = numCards - 1;
          activeIndexRef.current = idx;
          onActiveChange(idx);
        },
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
  }, [scroller, activeLead]);

  const openCard = useCallback((index: number) => {
    // While the card is still a scroll cue (down arrow showing), send the
    // section to the top of the viewport (pins it, card 0 centered) instead of
    // opening. Uses the same Lenis bridge as the hero buttons.
    if (window.scrollY < SCROLL_CUE_MAX_Y) {
      const container = containerRef.current;
      if (container) {
        const top = container.getBoundingClientRect().top + document.documentElement.scrollTop;
        window.dispatchEvent(new CustomEvent("smooth-scroll-to", { detail: { top } }));
      }
      return;
    }

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
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cursor = cardCursorRef.current;
    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
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
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen flex items-center justify-center overflow-clip [overflow-clip-margin:4rem]"
        >
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
              className="group absolute top-1/2 left-1/2 w-[94vw] h-[86vh] md:w-[90vw] md:h-[82vh] cursor-none"
              style={{ zIndex: i + 1 }}
            >
              {/* Plane 1 — background frame. Own element, own rounding, nothing clips
                  it. No backdrop-blur here: it gets a 3D transform, and
                  backdrop-filter + 3D transform paints a solid grey in Chrome. */}
              <div
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
                className="absolute inset-0 rounded-xl md:rounded-2xl bg-black/20 backdrop-blur-sm md:bg-black/10 md:backdrop-blur-3xl"
              />

              {/* Plane 2 — image panel. Own element inset by the frame's border; clips
                  only its own photo, so it can tilt harder without a gap. */}
              <div
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="absolute inset-2 md:inset-4 rounded-lg md:rounded-xl overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.label}
                  className="w-full h-full object-cover transition-[filter] duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30" />
                {/* Linear scrim over the top third on mobile, under the card text. */}
                <div
                  className="absolute inset-0 pointer-events-none md:hidden"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 12%, rgba(0,0,0,0.25) 24%, rgba(0,0,0,0) 33%)",
                  }}
                />
                {/* Radial scrim anchored to the top-left corner, under the card text. */}
                <div
                  className="absolute inset-0 pointer-events-none hidden md:block"
                  style={{
                    background:
                      "radial-gradient(circle farthest-side at 0% 0%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 80%)",
                  }}
                />
              </div>

              {/* Plane 3 — card text. Rides the image panel's tilt. */}
              <div
                data-card-info
                ref={(el) => {
                  infoRefs.current[i] = el;
                }}
                className="absolute top-6 left-6 right-6 md:top-12 md:left-12 md:right-12 text-white select-none pointer-events-none"
                style={{ opacity: 0 }}
              >
                {(card.year || card.category) && (
                  <div
                    data-card-meta
                    className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.3em] text-white/60"
                  >
                    {card.year && <span>{card.year}</span>}
                    {card.year && card.category && <span className="hbg-white/40">|</span>}
                    {card.category && <span>{card.category}</span>}
                  </div>
                )}

                <h3
                  className="font-light leading-[1.05]"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                >
                  {card.label.split(" ").map((word, w, words) => (
                    <span
                      key={w}
                      className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
                    >
                      {Array.from(word).map((ch, c) => (
                        <span key={c} data-card-char className="inline-block">
                          {ch}
                        </span>
                      ))}
                      {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                    </span>
                  ))}
                </h3>

                {card.description && (
                  <p
                    data-card-desc
                    className="mt-4 max-w-xl font-light leading-relaxed text-white/70"
                    style={{ fontSize: "clamp(0.85rem, 1.15vw, 1.05rem)" }}
                  >
                    {card.description}
                  </p>
                )}
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

                <div className="absolute bottom-8 left-8 max-w-xl select-none pointer-events-none">
                  <div className="text-white/50 text-xs tracking-[0.3em] uppercase">
                    {CARDS[expandedIndex].label}
                  </div>
                  {CARDS[expandedIndex].description && (
                    <p className="mt-2 text-sm font-light leading-relaxed text-white/40">
                      {CARDS[expandedIndex].description}
                    </p>
                  )}
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
            {atPageTop ? (
              <ArrowDown className="text-zinc-950" size={22} strokeWidth={1.5} />
            ) : (
              <ArrowUpRight className="text-zinc-950" size={22} strokeWidth={1.5} />
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
