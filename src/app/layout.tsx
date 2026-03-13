import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SocialIcon from "@/components/SocialIcons";
import NavLink from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { SITE_PROFILE, SOCIAL_LINKS } from "@/lib/site-config";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: METADATA_DEFAULTS.defaultTitle,
  description: METADATA_DEFAULTS.defaultDescription,
  icons: {
    icon: METADATA_DEFAULTS.faviconPath,
  },
  metadataBase: new URL(METADATA_DEFAULTS.canonicalBaseUrl),
  alternates: { canonical: METADATA_DEFAULTS.canonicalBaseUrl },
  openGraph: {
    title: METADATA_DEFAULTS.defaultTitle,
    description: METADATA_DEFAULTS.defaultDescription,
    url: METADATA_DEFAULTS.canonicalBaseUrl,
    siteName: METADATA_DEFAULTS.siteName,
    locale: METADATA_DEFAULTS.locale,
    type: "website",
    images: [{
      url: METADATA_DEFAULTS.defaultOgImageUrl,
      width: METADATA_DEFAULTS.defaultOgImageWidth,
      height: METADATA_DEFAULTS.defaultOgImageHeight,
      alt: METADATA_DEFAULTS.defaultOgImageAlt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: METADATA_DEFAULTS.twitterHandle,
    creator: METADATA_DEFAULTS.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title={METADATA_DEFAULTS.rssTitle} href="/rss.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-emerald-200 dark:selection:bg-emerald-900 min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
          {SITE_PROFILE.navigation.skipToContentLabel}
        </a>
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded">
              {SITE_PROFILE.brandMark}
            </Link>
            <div className="flex items-center gap-6">
              <nav className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300" aria-label="Main">
                <NavLink href="/projects">{SITE_PROFILE.navigation.projectsLabel}</NavLink>
                <NavLink href="/writing">{SITE_PROFILE.navigation.writingLabel}</NavLink>
                <NavLink href="/about">{SITE_PROFILE.navigation.aboutLabel}</NavLink>
                <Link href="/#contact" className="link-nav">
                  {SITE_PROFILE.navigation.contactLabel}
                </Link>
              </nav>
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div id="main-content" className="flex-grow">
          {children}
        </div>

        <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
          <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} {SITE_PROFILE.siteName}. {SITE_PROFILE.footer.rightsLabel}
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {link.label}
                </a>
              ))}
              <a href="/rss.xml" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded">
                {SITE_PROFILE.navigation.rssLabel}
              </a>
              <Link href="/#contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {SITE_PROFILE.navigation.contactLabel}
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
