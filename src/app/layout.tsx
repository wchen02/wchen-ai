import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { METADATA_DEFAULTS } from "@/lib/metadata-defaults";
import { SUPPORTED_LOCALES } from "@/lib/locales";

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
    <html lang={METADATA_DEFAULTS.languageTag} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title={METADATA_DEFAULTS.rssTitle} href="/rss/en.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}var p=window.location.pathname.split("/")[1];var s=${JSON.stringify(
              SUPPORTED_LOCALES
            )};document.documentElement.lang=s.indexOf(p)>=0?p:${JSON.stringify(
              METADATA_DEFAULTS.languageTag
            )}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-emerald-200 dark:selection:bg-emerald-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
