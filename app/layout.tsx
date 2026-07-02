import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TransitionProvider } from "@/components/transition-provider";

const syne = Syne({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "barisonurme",
  description: "Portfolio of Baris Onurme",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", syne.variable)}
    >
      <body className="min-h-full flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-99999 flex items-center justify-between px-6 py-4 pointer-events-none">
          <span className="text-sm font-mono tracking-widest uppercase opacity-40">barisonurme</span>
        </header>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
