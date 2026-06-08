'use client';;
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitionLink } from '@/components/transition-link';
import { SlideButton } from './ui/slide-button';

export default function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = containerRef.current;
    if (!el) return;

    const trigger = document.querySelector('[data-hero-trigger]');

    gsap.to(el, {
      rotateX: 0,
      z: -0,
      scale: 3,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: '5% top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === trigger) t.kill();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="z-99999 flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen text-center gap-2 will-change-transform"
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
    >
      <h1 className="text-6xl! font-bold z-999">Creative Developer</h1>
      <h4 className="text-2xl! opacity-50 z-999">Where ideas come to life with magic touch</h4>

      <div className="flex gap-4 mt-4 z-999">
        <SlideButton
          icon={false}
          onClick={() => {
            const el = document.getElementById('contact');
            if (el) {
              const top = el.getBoundingClientRect().top + document.documentElement.scrollTop;
              window.dispatchEvent(new CustomEvent('smooth-scroll-to', { detail: { top } }));
            }
          }}
        >
          Contact
        </SlideButton>
        <TransitionLink href="/projects" className="flex flex-col items-center gap-4">
          <SlideButton icon={false}>Projects</SlideButton>
        </TransitionLink>
      </div>
    </div>
  );
}
