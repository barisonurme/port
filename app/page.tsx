"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { EnterKeyNav } from "@/components/enter-key-nav";
import HeroText from "@/components/HeroText";
import { ContactSection } from "@/components/ContactSection";
import { StickyProjectParallax } from "@/components/sticky-project-parallax";
import { projects } from "@/lib/projects-data";
import Grainient from "@/components/Grainient";

const FALLBACK_COLOR = "#FF5B3F";

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

  const handleActiveChange = useCallback((index: number) => {
    const target = hexToRgb(featuredProjects[index]?.color ?? FALLBACK_COLOR);
    gsap.to(colorRef.current, {
      ...target,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => setBgColor(rgbToHex(colorRef.current)),
    });
  }, []);

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
        <span className="text-sm opacity-30 tracking-widest uppercase font-mono">
          barisonurme &mdash; 2026
        </span>
      </footer>

    </main>
  );
}
