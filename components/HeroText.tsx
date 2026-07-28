'use client';;
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { TransitionLink } from '@/components/transition-link';
import { SlideButton } from './ui/slide-button';

export default function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = containerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const trigger = document.querySelector('[data-hero-trigger]');

    // perspective on the parent so children rotation has real depth
    gsap.set(el, { perspective: 300 });

    const loopTween = gsap.to(inner, {
      scale: 1,
      duration: 1.8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    const xTo = gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'power3.out' });
    const yTo = gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power3.out' });
    const rotYTo = gsap.quickTo(inner, 'rotateY', { duration: 0.8, ease: 'power3.out' });
    const rotXTo = gsap.quickTo(inner, 'rotateX', { duration: 0.8, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * 40);
      yTo(ny * 20);
      rotYTo(nx * 35);
      rotXTo(-ny * 25);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const arrowBounce = gsap.to(arrowRef.current, {
      y: 14,
      duration: 0.9,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsap.to(el, {
      scale: 3,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top top',
        end: '20% top',
        scrub: 0.5,
        onEnter: () => loopTween.pause(),
        onLeaveBack: () => loopTween.resume(),
      },
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      loopTween.kill();
      arrowBounce.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === trigger) t.kill();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="z-99999 flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen text-center will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        ref={innerRef}
        className="flex flex-col items-center gap-2 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <h1 className="text-4xl md:text-6xl! font-bold">Creative Developer</h1>
        <h4 className="text-2xl! opacity-50">Turning ideas into experiences you can feel</h4>

        <div className="flex gap-4 mt-4">
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

      <div ref={arrowRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40">
        <ArrowDown size={48} strokeWidth={1.25} />
      </div>
    </div>
  );
}
