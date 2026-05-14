"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const projects = [
  {
    id: 1,
    title: "Horizon",
    year: "2024",
    category: "Web App",
    description:
      "A full-stack SaaS dashboard built with Next.js and Postgres. Real-time analytics, team management, and custom reporting pipelines.",
    tech: ["Next.js", "TypeScript", "Postgres", "Tailwind"],
    color: "#0f0f0f",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  },
  {
    id: 2,
    title: "Fauna",
    year: "2024",
    category: "Mobile",
    description:
      "A nature-tracking mobile app with AI species identification. Built with React Native and a custom ML pipeline for image recognition.",
    tech: ["React Native", "Python", "TensorFlow", "AWS"],
    color: "#111",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  },
  {
    id: 3,
    title: "Marble",
    year: "2023",
    category: "Design System",
    description:
      "A minimal component library and design system used across 5 production apps. 60+ components, fully accessible, dark-mode first.",
    tech: ["React", "Storybook", "Radix UI", "SCSS"],
    color: "#0a0a0a",
    image:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80",
  },
  {
    id: 4,
    title: "Relay",
    year: "2023",
    category: "Infrastructure",
    description:
      "An open-source edge proxy built in Go. Sub-millisecond routing, plugin system, and a web-based control plane.",
    tech: ["Go", "Docker", "Redis", "gRPC"],
    color: "#0d0d0d",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
  },
  {
    id: 5,
    title: "Solace",
    year: "2022",
    category: "Product",
    description:
      "A mental wellness app with journaling, mood tracking, and guided meditations. 10k+ active users within first month of launch.",
    tech: ["Flutter", "Firebase", "Node.js", "OpenAI"],
    color: "#0c0c0c",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  },
];

export default function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const bgRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const titleRef = useRef<HTMLHeadingElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const expandedImageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const activeProject =
    projects.find((p) => p.id === activeId) ?? null;
  const hoveredProject =
    projects.find((p) => p.id === hoveredId) ?? null;

  // fade images on hover
  useEffect(() => {
    projects.forEach((p) => {
      const el = imageRefs.current.get(p.id);
      if (!el) return;
      gsap.to(el, {
        opacity: hoveredId === p.id ? 1 : 0,
        duration: 0.55,
        ease: "power2.out",
      });
    });
  }, [hoveredId]);

  // expand / collapse
  useEffect(() => {
    if (isExpanded && activeProject) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        expandedImageRef.current,
        { y: 30, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
          delay: 0.25,
        }
      );
      gsap.fromTo(
        detailRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.4 }
      );
    } else {
      gsap.to([overlayRef.current, titleRef.current, expandedImageRef.current, detailRef.current], {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [isExpanded, activeProject]);

  const handleProjectClick = (id: number) => {
    setActiveId(id);
    setIsExpanded(true);
    gsap.to(listRef.current, { opacity: 0, y: 10, duration: 0.25 });
  };

  const handleClose = () => {
    setIsExpanded(false);
    gsap.to(listRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      delay: 0.3,
      ease: "power2.out",
    });
    setTimeout(() => setActiveId(null), 400);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* background images layer */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        {projects.map((p) => (
          <div
            key={p.id}
            ref={(el) => { if (el) imageRefs.current.set(p.id, el); }}
            className="absolute inset-0 opacity-0"
            style={{ transition: "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ))}
        {/* default dark bg when nothing hovered */}
        <div className="absolute inset-0 bg-zinc-950 -z-10" />
      </div>

      {/* subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* top-left label */}
      <div className="absolute top-10 left-10 z-20">
        <p className="text-white/30 text-xs tracking-[0.25em] uppercase">
          Selected Work
        </p>
      </div>

      {/* project count */}
      <div className="absolute top-10 right-10 z-20 text-right">
        <p className="text-white/25 text-xs tabular-nums">
          {String(projects.length).padStart(2, "0")} Projects
        </p>
      </div>

      {/* project list — bottom right */}
      <div
        ref={listRef}
        className="absolute bottom-10 right-10 z-20 flex flex-col items-end gap-1"
      >
        {projects.map((p, i) => (
          <button
            key={p.id}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleProjectClick(p.id)}
            className="group flex items-center gap-4 cursor-pointer py-1.5"
          >
            <span className="text-white/20 text-xs tabular-nums group-hover:text-white/40 transition-colors duration-200">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-white/50 text-xs uppercase tracking-widest group-hover:text-white/80 transition-colors duration-200">
              {p.category}
            </span>
            <span
              className="text-white font-light transition-all duration-300 group-hover:tracking-wider"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
            >
              {p.title}
            </span>
          </button>
        ))}
      </div>

      {/* hovered project label — bottom left */}
      <div className="absolute bottom-10 left-10 z-20 h-8 overflow-hidden">
        <p
          className="text-white/40 text-sm transition-all duration-300"
          style={{ opacity: hoveredProject ? 1 : 0 }}
        >
          {hoveredProject?.year ?? ""}
        </p>
      </div>

      {/* ── EXPANDED VIEW ── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 opacity-0 pointer-events-none"
        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
      >
        {/* background */}
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm" />

        {/* close button */}
        <button
          onClick={handleClose}
          className="absolute top-10 right-10 z-20 text-white/40 hover:text-white text-sm tracking-widest uppercase transition-colors duration-200"
        >
          Close
        </button>

        {/* content */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full px-10 sm:px-16 pt-20 pb-10 overflow-y-auto">
          {/* title — top */}
          <h1
            ref={titleRef}
            className="text-white font-light mb-8 opacity-0 leading-none"
            style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
          >
            {activeProject?.title}
          </h1>

          {/* image */}
          <div
            ref={expandedImageRef}
            className="w-full max-w-3xl rounded-xl overflow-hidden mb-10 opacity-0"
            style={{ aspectRatio: "16/9" }}
          >
            {activeProject && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* info */}
          <div
            ref={detailRef}
            className="max-w-3xl w-full opacity-0"
          >
            <div className="flex gap-8 mb-6 text-white/40 text-sm">
              <span>{activeProject?.category}</span>
              <span>{activeProject?.year}</span>
            </div>
            <p className="text-white/70 text-lg font-light leading-relaxed mb-8 max-w-2xl">
              {activeProject?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeProject?.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs text-white/50 border border-white/10 rounded-full px-3 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
