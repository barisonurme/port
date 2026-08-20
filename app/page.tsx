"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { EnterKeyNav } from "@/components/enter-key-nav";
import HeroText from "@/components/HeroText";
import { ContactSection } from "@/components/ContactSection";
import { StickyProjectParallax } from "@/components/sticky-project-parallax";
import { projects } from "@/lib/projects-data";
import Grainient from "@/components/Grainient";

const FALLBACK_COLOR = "#FF5B3F";

/** Colors the background drifts through while no project is active. */
const IDLE_PALETTE = ["#FF5B3F", "#4CD18F", "#007AFF", "#F39E0A", "#B14CFF"];
/** Seconds held on a color before fading, and the fade itself. */
const IDLE_HOLD = 2.5;
const IDLE_FADE = 3;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

const featuredProjects = projects.filter((p) => p.featured);
const initialColor = "#FF5B3F";

export default function Home() {
  const [bgColor, setBgColor] = useState(initialColor);
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

  return (
    <main className="relative">

      <div className="fixed inset-0 z-0">
        <Grainient color1="#000000" color2={bgColor} color3="#000000" />
      </div>

      <div data-hero-trigger className="relative w-full">
        <section className="sticky top-0 flex items-center justify-center z-10 w-full overflow-hidden">
          <div className="h-screen flex items-center justify-center w-full z-999">
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
