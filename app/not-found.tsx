'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Home } from 'lucide-react';
import { TransitionLink } from '@/components/transition-link';
import { SlideButton } from '@/components/ui/slide-button';

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.nf-word',
        { y: '115%' },
        { y: '0%', duration: 1.15, ease: 'expo.out', stagger: 0.08 }
      );
      gsap.fromTo('.nf-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.12, delay: 0.45 }
      );
      gsap.to('.nf-ghost', {
        y: -14,
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Backspace mirrors the "BACKSPACE → home" affordance the other routes use.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') window.location.href = '/';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-10 text-center"
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG }}
      />

      {/* Oversized ghost numerals behind the message */}
      <span
        aria-hidden
        className="nf-ghost pointer-events-none absolute select-none font-bold leading-none text-white/[0.03]"
        style={{ fontSize: 'clamp(18rem, 45vw, 42rem)' }}
      >
        404
      </span>

      <div className="relative z-10 flex flex-col items-center">
        <p className="nf-reveal text-white/25 text-xs uppercase tracking-widest mb-8 opacity-0">
          Error 404
        </p>

        <div className="overflow-hidden leading-none">
          <h1
            className="nf-word inline-block font-semibold text-white"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
          >
            PAGE NOT
          </h1>
        </div>
        <div className="overflow-hidden leading-none">
          <h1
            className="nf-word inline-block font-semibold"
            style={{
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              // Fill is the page background (not transparent) so the stroke
              // renders as a clean outer contour instead of a centered band
              // that clogs the counters of a display face.
              WebkitTextStroke: '0.05em rgba(255,255,255,0.42)',
              paintOrder: 'stroke fill',
              color: '#09090b',
            }}
          >
            FOUND.
          </h1>
        </div>

        <p className="nf-reveal mt-8 max-w-md text-sm font-light leading-relaxed text-white/35 opacity-0">
          This page could not be found. It may have moved, or it never existed in
          the first place.
        </p>

        <div className="nf-reveal mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0">
          <TransitionLink href="/">
            <SlideButton icon={false}>
              <Home size={15} className="inline-block transition-transform group-hover:-translate-x-0.5" />
              <span className="px-3">Home</span>
            </SlideButton>
          </TransitionLink>
          <TransitionLink href="/projects">
            <SlideButton icon={false}>
              <span className="px-3">Projects</span>
            </SlideButton>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
