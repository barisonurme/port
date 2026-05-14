import { SienaParallax } from "@/components/siena-parallax";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/transition-link";
import { EnterKeyNav } from "@/components/enter-key-nav";

export default function Home() {
  return (
    <main className="bg-black">
      <SienaParallax />
      <EnterKeyNav href="/projects" />
      <section className="h-screen flex items-center justify-center bg-black">
        <TransitionLink href='/projects' className="flex flex-col items-center gap-4">
          <Button className="text-white/20 text-sm tracking-widest uppercase">
            More below
          </Button>
        </TransitionLink>
      </section>
    </main>
  );
}
