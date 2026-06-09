'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SlideButton } from './ui/slide-button';

const PROJECT_TYPES = ['Web Design', 'Development', 'Motion', 'Branding', 'Other'];

export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' });

  useEffect(() => {
    if (submitted) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: ref.current,
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      };

      gsap.fromTo('.cs-title',
        { scale: 0.82, opacity: 0, transformOrigin: 'left top' },
        { scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: trigger }
      );
      gsap.fromTo('.cs-word',
        { y: '112%' },
        { y: '0%', duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: trigger }
      );
      gsap.fromTo('.cs-meta',
        { opacity: 0 },
        { opacity: 1, duration: 0.7, scrollTrigger: trigger }
      );

      gsap.fromTo('.cs-field',
        { scale: 0.93, y: 20, opacity: 0, transformOrigin: 'left center' },
        {
          scale: 1, y: 0, opacity: 1,
          duration: 0.8, ease: 'power3.out', stagger: 0.11,
          scrollTrigger: trigger,
        }
      );

      gsap.fromTo('.cs-footer',
        { scale: 0.95, y: 12, opacity: 0, transformOrigin: 'left center' },
        {
          scale: 1, y: 0, opacity: 1,
          duration: 0.7, ease: 'power3.out',
          scrollTrigger: trigger,
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const el = ref.current;
    if (!el || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        createdAt: serverTimestamp(),
      });
    } catch {
      setSending(false);
      return;
    }

    gsap.to(el.querySelectorAll('.cs-field'), { y: -16, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'power2.in' });
    gsap.to(el.querySelector('.cs-footer'), { opacity: 0, duration: 0.25, delay: 0.1 });
    gsap.to(el.querySelector('.cs-title'), { opacity: 0, duration: 0.3, delay: 0.15 });
    gsap.delayedCall(0.55, () => setSubmitted(true));
  }

  const set =
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <section id="contact" ref={ref} className=" px-10 sm:px-16 py-28">
      {submitted ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-white/25 text-xs uppercase tracking-widest mb-8">Message received</p>
          <h2
            className="font-bold text-white leading-none mb-10"
            style={{ fontSize: 'clamp(4rem, 13vw, 10rem)' }}
          >
            Message
            <br />
            Recived!
          </h2>
          <SlideButton onClick={() => { setSubmitted(false); setForm({ name: '', email: '', type: '', message: '' }); }}>Send Again</SlideButton>
        </div>
      ) : (
        <>
          {/* Title — starts invisible; GSAP sets from-state on mount */}
          <div className="cs-title mb-14" style={{ opacity: 0 }}>
            <p className="cs-meta text-white/25 text-xs uppercase tracking-widest mb-5">
              Let&apos;s work together
            </p>
            <div className="overflow-hidden leading-none">
              <h2
                className="cs-word inline-block font-bold text-white"
                style={{ fontSize: 'clamp(3.2rem, 11vw, 10rem)' }}
              >
                GET IN
              </h2>
            </div>
            <div className="overflow-hidden leading-none">
              <h2
                className="cs-word inline-block font-bold"
                style={{
                  fontSize: 'clamp(3.2rem, 11vw, 10rem)',
                  WebkitTextStroke: '1.5px rgba(255,255,255,0.2)',
                  color: 'transparent',
                }}
              >
                TOUCH.
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <Field label="Full Name" index="01" focused={focused === 'name'} className="cs-field">
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
            </Field>

            <Field label="Email Address" index="02" focused={focused === 'email'} className="cs-field">
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
            </Field>

            <Field label="I Need Help With" index="03" focused={false} className="cs-field">
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
            </Field>

            <Field label="Message" index="04" focused={focused === 'message'} className="cs-field">
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
            </Field>

            <div className="cs-footer mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ opacity: 0 }}>
              <p className="text-white/25 text-sm">
                Or reach me at{' '}
                <a
                  href="mailto:brsnrm@gmail.com"
                  className="text-white/45 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
                >
                  brsnrm@gmail.com
                </a>
              </p>

              <button
                type="submit"
                disabled={sending}
                className="group relative flex items-center gap-3 overflow-hidden border border-white/20 hover:border-white/50 px-8 py-4 text-sm uppercase tracking-widest text-white/50 hover:text-zinc-950 transition-colors duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
                <span className="relative z-10">{sending ? 'Sending…' : 'Send Message'}</span>
                <ArrowUpRight
                  size={15}
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}

function Field({
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
    <div className={`relative py-9 ${className ?? ''}`} style={{ opacity: 0 }}>
      <div
        className={`flex items-baseline gap-5 mb-5 transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-40'
          }`}
      >
        <span className="text-white text-xs font-mono tabular-nums">{index}</span>
        <span className="text-white text-xs uppercase tracking-widest">{label}</span>
      </div>
      {children}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-white/55 origin-left transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: focused ? 'scaleX(1)' : 'scaleX(0)' }}
      />
    </div>
  );
}
