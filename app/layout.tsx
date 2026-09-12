import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subtext — Content guidance for parents",
  description:
    "ISBN lookup for honest, metadata-based content advisories. Not a substitute for your judgment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Subtext
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/scan" className="hover:underline">
                Scan
              </Link>
              <Link href="/transparency" className="hover:underline">
                How it works
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>
        <DisclaimerBanner />
      </body>
    </html>
  );
}
