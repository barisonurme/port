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
        {/* Runs before the browser parses the rest of <body>, so the
            `[data-reveal]` from-state in globals.css is applied without a
            flash — and, crucially, is *not* applied at all when scripting is
            unavailable, leaving the animated content readable. */}
        <script
          id="js-flag"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
