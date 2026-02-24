import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wilson Chen | Founder & Builder",
  description: "Personal website of Wilson Chen. Founder, builder, and software engineer.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Wilson Chen | Founder & Builder",
    description: "Personal website of Wilson Chen. Founder, builder, and software engineer.",
    url: "https://wchen.ai",
    siteName: "Wilson Chen",
    locale: "en_US",
    type: "website",
    images: [{ url: "https://wchen.ai/og-default.png", width: 1200, height: 630, alt: "Wilson Chen — Founder & Builder" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="Wilson Chen | Writing" href="/rss.xml" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 antialiased selection:bg-emerald-200 dark:selection:bg-emerald-900 min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to content
        </a>
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              WC.
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/projects" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Projects
              </Link>
              <Link href="/writing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Writing
              </Link>
              <Link href="/#contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <div id="main-content" className="flex-grow">
          {children}
        </div>

        <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
          <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Wilson Chen. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://github.com/wenshengchen" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                GitHub
              </a>
              <a href="/rss.xml" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                RSS
              </a>
              <Link href="/#contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
