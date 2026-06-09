import { EnterKeyNav } from "@/components/enter-key-nav";

import HeroText from "@/components/HeroText";
import { ContactSection } from "@/components/ContactSection";
import PrismaticBurstHero from "@/components/PrismaticBurstHero";

export default function Home() {
  return (
    <main className="relative">
      <div className="fixed inset-0 z-0">
        <PrismaticBurstHero />
      </div>

      <div data-hero-trigger className="relative w-full">
        <section className="sticky top-0 flex items-center justify-center z-10 w-full overflow-hidden">
          <div className="h-screen flex items-center justify-center w-full z-999">
            <HeroText />
          </div>
        </section>
      </div>

      <EnterKeyNav href="/projects" />

      <div className="relative max-w-7xl mx-auto px-4 py-16  z-999">
        <ContactSection />
      </div>

      <footer className="relative z-999 w-full py-6 flex justify-center">
        <span className="text-sm opacity-30 tracking-widest uppercase font-mono">
          barisonurme &mdash; 2026
        </span>
      </footer>

    </main>
  );
}
