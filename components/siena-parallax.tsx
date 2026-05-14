"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90";

export function SienaParallax() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=180%",
        scrub: 1.2,
        pin: true,
      },
    });

    // Expand clip-path: inset rectangle → full screen
    tl.fromTo(
      innerRef.current,
      { clipPath: "inset(12% 18% 12% 18% round 16px)" },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" },
      0
    );

    // Counter-scale inner image so it appears to zoom out (parallax feel)
    tl.fromTo(
      imgRef.current,
      { scale: 1.28 },
      { scale: 1, ease: "none" },
      0
    );

    // Letterbox bars shrink to nothing
    tl.fromTo(
      [topBarRef.current, bottomBarRef.current],
      { scaleY: 1 },
      { scaleY: 0, ease: "none" },
      0
    );

    // Play button fades out early
    tl.to(
      playRef.current,
      { opacity: 0, scale: 0.7, ease: "none", duration: 0.35 },
      0
    );

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Letterbox bars */}
      <div
        ref={topBarRef}
        className="absolute top-0 left-0 right-0 z-10 bg-black origin-top"
        style={{ height: "12%" }}
      />
      <div
        ref={bottomBarRef}
        className="absolute bottom-0 left-0 right-0 z-10 bg-black origin-bottom"
        style={{ height: "12%" }}
      />

      {/* Clipped image container */}
      <div
        ref={innerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: "inset(12% 18% 12% 18% round 16px)" }}
      >
        {/* Inner image — scales independently for parallax */}
        <div ref={imgRef} className="absolute inset-0" style={{ transform: "scale(1.28)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGE}
            alt="Cinematic landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Play button */}
      <div
        ref={playRef}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <button
          aria-label="Play"
          className="group flex items-center justify-center w-16 h-16 rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="w-5 h-5 ml-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Corner labels */}
      <div className="absolute top-6 left-8 z-30 text-white/25 text-xs tracking-[0.3em] uppercase select-none">
        Scroll
      </div>
      <div className="absolute top-6 right-8 z-30 text-white/25 text-xs tracking-[0.3em] uppercase select-none">
        2026
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-white/20 text-[10px] tracking-[0.4em] uppercase select-none">
        Baris Onurme
      </div>
    </section>
  );
}
