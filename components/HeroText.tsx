'use client';;
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { TransitionLink } from '@/components/transition-link';
import { SlideButton } from './ui/slide-button';
import WarpTextBlock from './WarpTextBlock';

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
        className="flex flex-col items-center gap-2 will-change-transform w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* The hero sits directly on the animated gradient, whose bright band
            is only ~3:1 against white. The shadow buys back the contrast the
            gradient takes away, and the tagline is a <p>, not an <h4> — it's
            a subtitle, not the next level of the document outline. */}

        {/* Each height tracks the font it has to hold: stacked is 2 lines x
            0.9 line-height / 0.78 against the same vw as the font, wide is one
            line against vh so short widescreens don't hand the hero a band of
            empty canvas. */}
        <WarpTextBlock
          text="Building & Shipping Software"
          stackedText={'Building & Shipping\nSoftware'}
          height="clamp(1rem, 13vh, 9rem)"
          stackedHeight="clamp(3rem, 13.7vw, 16.7rem)"
          warpStrength={2.5}
          warpScale={7}
          speed={1}
          pointerInfluence={1.5}
          pointerStrength={1.5}
          refraction={0.058}
          ripple
          fontSize="clamp(2.25rem, 12vw, 7.25rem)"
          fontWeight={600}
          letterSpacing="-0.06em"
          lineHeight={0.9}
        />

        {/* Reads as one sentence continuing out of the headline above, so the
            lowercase start and the missing period are deliberate: the thought
            closes on "end to end", not here. */}
        <p className="text-xl! sm:text-2xl! text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.65)]">
          That Actually Scalable, Functional and Maintainable from End to End
        </p>

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

      <div ref={arrowRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/65">
        <ArrowDown size={48} strokeWidth={1.25} />
      </div>
    </div>
  );
}
