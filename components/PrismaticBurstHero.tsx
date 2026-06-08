'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PrismaticBurst from './PrismaticBurst';

export default function PrismaticBurstHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = wrapperRef.current;
    if (!el) return;

    const trigger = document.querySelector('[data-hero-trigger]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    tl.to(el, {
      scaleY: 4,
      scaleX: 2,
      rotate: -90,
      opacity: 1,
      ease: 'none',
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden will-change-transform max-w-full max-h-dvh">
      <PrismaticBurst />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(8,8,8,0.21) 0%, rgba(8,8,8,1) 100%)' }}
      />
    </div>
  );
}
