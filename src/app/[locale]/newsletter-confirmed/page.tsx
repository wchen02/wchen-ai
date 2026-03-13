import Link from "next/link";
import type { Metadata } from "next";
import { localizePath } from "@/lib/i18n";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/route-localization";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);

  return {
    title: `${siteProfile.newsletter.confirmedPageTitle} | ${siteProfile.siteName}`,
    alternates: {
      canonical: getCanonicalUrl(resolvedLocale, "/newsletter-confirmed"),
      languages: getLanguageAlternates("/newsletter-confirmed"),
    },
  };
}

export default async function LocalizedNewsletterConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const siteProfile = getSiteProfile(resolvedLocale);

  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {siteProfile.newsletter.confirmedTitle}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {siteProfile.newsletter.confirmedDescription}
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href={localizePath(resolvedLocale, "/writing")} className="btn-primary">
          {siteProfile.newsletter.confirmedPrimaryCtaLabel}
        </Link>
        <Link href={localizePath(resolvedLocale, "/")} className="btn-secondary">
          {siteProfile.newsletter.confirmedSecondaryCtaLabel}
        </Link>
      </nav>
    </main>
  );
}
