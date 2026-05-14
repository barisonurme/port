import { SienaParallax } from "@/components/siena-parallax";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-black">
      <SienaParallax />
      <section className="h-screen flex items-center justify-center bg-black">
        <Link href='/projects' className="flex flex-col items-center gap-4">
          <Button className="text-white/20 text-sm tracking-widest uppercase">
            More below
          </Button></Link>
      </section>
    </main>
  );
}
