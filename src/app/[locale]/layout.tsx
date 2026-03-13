import Link from "next/link";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/LocaleProvider";
import SiteHeader from "@/components/SiteHeader";
import { localizePath } from "@/lib/i18n";
import {
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/locales";
import { getSiteProfile, getSocialLinks } from "@/lib/site-config";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const siteProfile = getSiteProfile(locale);
  const socialLinks = getSocialLinks(locale);

  return (
    <LocaleProvider locale={locale}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        {siteProfile.navigation.skipToContentLabel}
      </a>
      <SiteHeader
        locale={locale as SupportedLocale}
        brandMark={siteProfile.brandMark}
        navigation={siteProfile.navigation}
        socialLinks={socialLinks}
      />

      <div id="main-content" className="flex-grow min-w-0 overflow-x-hidden">
        {children}
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-800 pt-8 pb-20 mt-12 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} {siteProfile.siteName}. {siteProfile.footer.rightsLabel}
          </p>
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`/rss/${locale}.xml`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
            >
              {siteProfile.navigation.rssLabel}
            </a>
            <Link
              href={localizePath(locale as SupportedLocale, "/#contact")}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {siteProfile.navigation.contactLabel}
            </Link>
          </div>
        </div>
      </footer>
    </LocaleProvider>
  );
}
