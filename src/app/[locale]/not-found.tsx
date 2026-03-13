"use client";

import Link from "next/link";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { localizePath } from "@/lib/i18n";
import { getSiteProfile } from "@/lib/site-config";

export default function LocalizedNotFound() {
  const locale = useCurrentLocale();
  const siteProfile = getSiteProfile(locale);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {siteProfile.notFound.description}
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href={localizePath(locale, "/")} className="btn-primary">
          {siteProfile.notFound.homeLabel}
        </Link>
        <Link href={localizePath(locale, "/projects")} className="btn-secondary">
          {siteProfile.notFound.projectsLabel}
        </Link>
        <Link href={localizePath(locale, "/writing")} className="btn-secondary">
          {siteProfile.notFound.writingLabel}
        </Link>
      </nav>
    </main>
  );
}
