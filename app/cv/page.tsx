'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowDownToLine } from 'lucide-react';
import { ContactSection } from '@/components/ContactSection';
import { cv } from '@/lib/cv-data';
import { OutlineText } from '@/components/ui/outline-text';

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function CVPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cv-word',
        { y: '115%' },
        { y: '0%', duration: 1.15, ease: 'expo.out', stagger: 0.08 }
      );
      gsap.fromTo('.cv-meta',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      );
      gsap.fromTo('.cv-reveal',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.55 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="cv-root relative min-h-screen bg-zinc-950">
      {/* Grain overlay */}
      <div
        className="cv-grain pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG }}
      />



      <div className="cv-sheet mx-auto max-w-6xl px-10 sm:px-16 pt-28 pb-28">
        {/* Name block */}
        <header className="mb-14">
          <div className="overflow-hidden leading-[0.95]">
            <h1
              className="cv-word cv-name inline-block font-semibold text-white"
              style={{ fontSize: 'clamp(2.6rem, 8vw, 6.5rem)' }}
            >
              {cv.name}
            </h1>
          </div>
          <div className="overflow-hidden leading-[0.95]">

            <h2
              className="cv-word cv-role inline-block font-semibold"
              style={{
                fontSize: 'clamp(2.6rem, 8vw, 6.5rem)',
                WebkitTextStroke: '0.022em rgba(255,255,255,0.38)',
                paintOrder: 'stroke fill',
                color: '#09090b',
              }}
            >

              {cv.role}
            </h2>

          </div>
        </header>

        <div className="cv-grid grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-x-16 gap-y-14">
          {/* ── Left column ─────────────────────────── */}
          <div className="cv-col flex flex-col gap-14">
            <section className="cv-reveal">
              <SectionHeading title="Experience" index="01" />

              <div className="cv-stack space-y-7">
                {cv.intro.map((p, i) => (
                  <p key={i} className="cv-body text-white/55 text-sm font-light leading-relaxed max-w-2xl">
                    {p}
                  </p>
                ))}
              </div>

              <div className="cv-stack cv-jobs mt-12 space-y-12">
                {cv.experience.map((job) => (
                  <article key={job.company}>
                    <p className="cv-faint text-white/30 text-xs font-mono tracking-widest mb-2">
                      {job.period}
                    </p>
                    <h3 className="cv-job text-white text-xl sm:text-2xl font-light mb-4">
                      {job.company} <span className="cv-dim text-white/40">— {job.role}</span>
                    </h3>
                    <div className="cv-stack space-y-4">
                      {job.body.map((p, i) => (
                        <p key={i} className="cv-body text-white/50 text-sm font-light leading-relaxed max-w-2xl">
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="cv-reveal">
              <SectionHeading title="Education" index="02" />
              <div className="cv-stack space-y-8">
                {cv.education.map((e) => (
                  <div key={e.school}>
                    <p className="cv-faint text-white/30 text-xs font-mono tracking-widest mb-2">
                      {e.period}
                    </p>
                    <h3 className="cv-job text-white text-lg sm:text-xl font-light">{e.school}</h3>
                    <p className="cv-dim text-white/40 text-sm font-light mt-1">{e.field}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right column ────────────────────────── */}
          <div className="cv-col flex flex-col gap-14">
            <section className="cv-reveal">
              <SectionHeading title="Contacts" index="03" />
              <ul className="cv-stack space-y-3">
                {cv.contacts.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="cv-link text-white/55 hover:text-white text-sm tracking-wide transition-colors duration-200"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cv-reveal">
              <SectionHeading title="Skills" index="04" />
              <ul className="cv-skills grid grid-cols-2 gap-x-6 gap-y-2.5">
                {cv.skills.map((s) => (
                  <li key={s} className="cv-dim text-white/45 text-sm font-light">
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section className="cv-reveal">
              <SectionHeading title="Languages" index="05" />
              <ul className="cv-stack space-y-3">
                {cv.languages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-4">
                    <span className="cv-body text-white/55 text-sm">{l.name}</span>
                    <span className="cv-faint text-white/30 text-sm font-light">{l.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Download — opens the browser print dialog, which writes the
            print stylesheet in globals.css out as a clean A4 PDF. */}
        <div className="cv-no-print cv-reveal mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-white/25 text-sm">
            Prefer a copy? Save this page as a PDF — it prints on A4.
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="group relative flex items-center gap-3 overflow-hidden border border-white/20 hover:border-white/50 px-8 py-4 text-sm uppercase tracking-widest text-white/50 hover:text-zinc-950 transition-colors duration-500 cursor-pointer"
          >
            <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            <span className="relative z-10">Download PDF</span>
            <ArrowDownToLine
              size={15}
              className="relative z-10 transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </button>
        </div>
      </div>

      {/* Same form as the homepage — a CV is where someone decides to reach
          out, so the reply path lives right under it. Print-only chrome. */}
      <div className="cv-no-print relative z-10 mx-auto max-w-7xl px-4">
        <ContactSection />
      </div>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────────────────── */
function SectionHeading({ title, index }: { title: string; index: string }) {
  return (
    <div className="cv-heading flex items-baseline justify-between border-b border-white/15 pb-2.5 mb-7">
      <span className="text-white/70 text-xs uppercase tracking-[0.25em]">{title}</span>
      <span className="cv-faint text-white/30 text-xs font-mono tabular-nums">{index}</span>
    </div>
  );
}
