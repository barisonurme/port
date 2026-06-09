'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MoveLeft } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TransitionLink } from '@/components/transition-link';
import { SlideButton } from '@/components/ui/slide-button';

const PROJECT_TYPES = ['Web Design', 'Development', 'Motion', 'Branding', 'Other'];

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.c-word',
        { y: '115%' },
        { y: '0%', duration: 1.15, ease: 'expo.out', stagger: 0.07 }
      );
      gsap.fromTo('.c-meta',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
      );
      gsap.fromTo('.c-field',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.1, delay: 0.6 }
      );
      gsap.fromTo('.c-footer',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 1.1 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(false);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[ContactPage] submit failed:', err);
      setSending(false);
      setError(true);
      return;
    }
    gsap.to('.c-field', { y: -18, opacity: 0, stagger: 0.05, duration: 0.35, ease: 'power2.in' });
    gsap.to('.c-footer', { opacity: 0, duration: 0.25, delay: 0.1 });
    gsap.to('.c-title-area', { opacity: 0, duration: 0.3, delay: 0.15 });
    gsap.delayedCall(0.55, () => setSubmitted(true));
  }

  const set =
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div ref={containerRef} className="relative min-h-screen bg-zinc-950">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG }}
      />

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-10 sm:px-16 pt-8">
        <TransitionLink
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors duration-200"
        >
          <MoveLeft size={14} />
          BACKSPACE
        </TransitionLink>
        <span className="c-meta text-white/20 text-xs tracking-widest opacity-0">CONTACT / 2026</span>
      </nav>

      {submitted ? (
        /* ── Success state ───────────────────────── */
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-10">
          <p className="text-white/25 text-xs uppercase tracking-widest mb-8">Talk Soon</p>
          <h2
            className="font-bold text-white leading-none mb-10"
            style={{ fontSize: 'clamp(4rem, 13vw, 10rem)' }}
          >
            Message
            <br />
            Recived!
          </h2>
          <TransitionLink
            href="/"
            className="text-white/35 hover:text-white text-xs tracking-widest uppercase transition-colors duration-300"
          >
            ← Back home
          </TransitionLink>
        </div>
      ) : (
        /* ── Form ────────────────────────────────── */
        <div className="px-10 sm:px-16 pt-28 pb-28">
          {/* Title */}
          <div className="c-title-area mb-14">
            <p className="c-meta text-white/25 text-xs uppercase tracking-widest mb-5 opacity-0">
              Let&apos;s work together
            </p>
            <div className="overflow-hidden leading-none">
              <h1
                className="c-word inline-block font-bold text-white"
                style={{ fontSize: 'clamp(3.2rem, 11vw, 10rem)' }}
              >
                GET IN
              </h1>
            </div>
            <div className="overflow-hidden leading-none">
              <h1
                className="c-word inline-block font-bold"
                style={{
                  fontSize: 'clamp(3.2rem, 11vw, 10rem)',
                  WebkitTextStroke: '1.5px rgba(255,255,255,0.2)',
                  color: 'transparent',
                }}
              >
                TOUCH.
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            {/* 01 Name */}
            <FormField label="Full Name" index="01" focused={focused === 'name'} className="c-field">
              <input
                type="text"
                required
                placeholder="Your full name"
                value={form.name}
                onChange={set('name')}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent text-white font-light outline-none placeholder:text-white/15"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.6rem)' }}
              />
            </FormField>

            {/* 02 Email */}
            <FormField label="Email Address" index="02" focused={focused === 'email'} className="c-field">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={set('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent text-white font-light outline-none placeholder:text-white/15"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.6rem)' }}
              />
            </FormField>

            {/* 03 Project type — pill selector */}
            <FormField label="I Need Help With" index="03" focused={false} className="c-field">
              <div className="flex flex-wrap gap-2.5 pb-1">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type }))}
                    className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all duration-300 border cursor-pointer ${form.type === type
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-transparent text-white/35 border-white/12 hover:border-white/35 hover:text-white/60'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FormField>

            {/* 04 Message */}
            <FormField label="Message" index="04" focused={focused === 'message'} className="c-field">
              <textarea
                rows={3}
                required
                placeholder="Tell me about your project..."
                value={form.message}
                onChange={set('message')}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent text-white font-light outline-none placeholder:text-white/15 resize-none"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.6rem)' }}
              />
            </FormField>

            {/* Footer row */}
            <div className="c-footer mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 opacity-0">
              <div className="flex flex-col gap-2">
                {error && (
                  <p className="text-red-400/70 text-sm">
                    Something went wrong. Try again or email me directly.
                  </p>
                )}
                <p className="text-white/25 text-sm">
                  Or reach me at{' '}
                  <a
                    href="mailto:brsnrm@gmail.com"
                    className="text-white/45 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
                  >
                    brsnrm@gmail.com
                  </a>
                </p>
              </div>

              {/* Slide-fill CTA */}
              <SlideButton type="submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send Message'}
              </SlideButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────────────────────── */
function FormField({
  label,
  index,
  focused,
  children,
  className,
}: {
  label: string;
  index: string;
  focused: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative py-9 ${className ?? ''}`}>
      <div
        className={`flex items-baseline gap-5 mb-5 transition-opacity duration-400 ${focused ? 'opacity-100' : 'opacity-40'
          }`}
      >
        <span className="text-white text-xs font-mono tabular-nums">{index}</span>
        <span className="text-white text-xs uppercase tracking-widest">{label}</span>
      </div>
      {children}
      {/* Separator line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      {/* Animated focus indicator */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-white/55 origin-left transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: focused ? 'scaleX(1)' : 'scaleX(0)' }}
      />
    </div>
  );
}
