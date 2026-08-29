"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { EnterKeyNav } from "@/components/enter-key-nav";
import HeroText from "@/components/HeroText";
import { ContactSection } from "@/components/ContactSection";
import { StickyProjectParallax } from "@/components/sticky-project-parallax";
import { projects } from "@/lib/projects-data";
import Grainient from "@/components/Grainient";
import DotGrid from "@/components/DotGrid";
import Header from "@/components/header";
import { IDLE_PALETTE } from "@/lib/palette";

const FALLBACK_COLOR = "#EA285E";
/** Seconds held on a color before fading, and the fade itself. */
const IDLE_HOLD = 2.5;
const IDLE_FADE = 3;

/**
 * The dot field is `fixed`, so it never scrolls out of view on its own and its
 * rAF loop would keep repainting every dot for the whole page. Drop it as soon
 * as the page moves at all; the small gap back down to `SHOW` keeps it from
 * thrashing when you rest on the boundary.
 */
const DOTS_HIDE_AT = 10;
const DOTS_SHOW_AT = 4;

/** Once the page has moved this far, the full-bleed background sheds its inset + corners. */
const FRAME_COLLAPSE_AT = 8;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

const featuredProjects = projects.filter((p) => p.featured);
const initialColor = "#EA285E";

export default function Home() {
  const [bgColor, setBgColor] = useState(initialColor);
  const [dotsMounted, setDotsMounted] = useState(true);
  const [frameCollapsed, setFrameCollapsed] = useState(false);
  const colorRef = useRef(hexToRgb(initialColor));
  const idleRef = useRef<gsap.core.Timeline | null>(null);

  const applyColor = useCallback(() => setBgColor(rgbToHex(colorRef.current)), []);

  // Slow ambient drift through the palette — runs whenever no project owns the background.
  const startIdle = useCallback(() => {
    if (idleRef.current) return;
    gsap.killTweensOf(colorRef.current);
    // repeatRefresh re-records the start values each loop, so the cycle never jumps.
    const tl = gsap.timeline({ repeat: -1, repeatRefresh: true });
    IDLE_PALETTE.forEach((hex) => {
      tl.to(
        colorRef.current,
        { ...hexToRgb(hex), duration: IDLE_FADE, ease: "sine.inOut", onUpdate: applyColor },
        `+=${IDLE_HOLD}`
      );
    });
    idleRef.current = tl;
  }, [applyColor]);

  const stopIdle = useCallback(() => {
    idleRef.current?.kill();
    idleRef.current = null;
  }, []);

  const handleActiveChange = useCallback(
    (index: number) => {
      const project = featuredProjects[index];
      if (!project) {
        startIdle();
        return;
      }
      stopIdle();
      gsap.killTweensOf(colorRef.current);
      gsap.to(colorRef.current, {
        ...hexToRgb(project.color ?? FALLBACK_COLOR),
        duration: 0.6,
        ease: "power2.out",
        onUpdate: applyColor,
      });
    },
    [applyColor, startIdle, stopIdle]
  );

  useEffect(() => {
    startIdle();
    return stopIdle;
  }, [startIdle, stopIdle]);

  // Mount/unmount the dot field at the very top of the page, sampled once per frame.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      setDotsMounted((mounted) =>
        mounted ? y < DOTS_HIDE_AT : y < DOTS_SHOW_AT
      );
      setFrameCollapsed(y > FRAME_COLLAPSE_AT);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <main className="relative">

      <Header color={bgColor} />
      <div
        className={`fixed inset-0 z-0 h-full transition-[padding] duration-700 ease-out ${frameCollapsed ? "p-0" : "p-0 md:p-12 md:pb-0"
          }`}
      >
        <div
          className={`overflow-hidden h-full transition-[border-radius] duration-700 ease-out ${frameCollapsed ? "rounded-none" : "rounded-none md:rounded-[44px] md:rounded-b-none overflow-hidden md:border-t md:border-white/20"
            }`}
        >
          <Grainient color1="#000000" color2={bgColor} color3="#000000" />
        </div>
      </div>


      {/* Interactive dot field sitting on top of the gradient, behind all content. */}
      {dotsMounted && (
        <div
          className={`fixed inset-0 opacity-50 pointer-events-none transition-[padding] duration-700 ease-out ${frameCollapsed ? "p-0" : "p-0 md:p-12"
            }`}
        >
          <div
            className={`overflow-hidden transition-[border-radius] duration-700 ease-out ${frameCollapsed ? "rounded-none" : "rounded-none md:rounded-xl"
              }`}
          >
            <DotGrid
              dotSize={1}
              gap={28}
              baseColor={bgColor}
              activeColor={bgColor}
              proximity={140}
              shockRadius={260}
              shockStrength={4}
              resistance={750}
              returnDuration={1.4}
            />
          </div>
        </div>
      )}

      {/* Hero is intentionally short of a full viewport so the first
          StickyProjectParallax card peeks in at the bottom (~20%) as the
          scroll cue — replaces the old down arrow. Tune HERO_VH to taste. */}
      <div data-hero-trigger className="relative w-full">
        <section className="sticky top-0 flex items-center justify-center z-10 w-full overflow-hidden">
          <div className="h-[75vh] flex items-center justify-center w-full z-999">
            <HeroText />
          </div>
        </section>
      </div>

      <EnterKeyNav href="/projects" />

      <StickyProjectParallax
        CARDS={featuredProjects.map((p) => ({
          id: p.id,
          image: p.image,
          label: p.title,
          description: p.description,
          year: p.year,
          category: p.category,
          href: `/projects?open=${p.id}`,
        }))}
        onActiveChange={handleActiveChange}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-16  z-999">
        <ContactSection />
      </div>

      <footer className="relative z-999 w-full py-6 flex justify-center">
        <span className="text-sm opacity-60 tracking-widest uppercase font-mono">
          barisonurme &mdash; 2026
        </span>
      </footer>

    </main>
  );
}
