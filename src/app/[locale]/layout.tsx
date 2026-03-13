import Link from "next/link";
import { notFound } from "next/navigation";
import NavLink from "@/components/NavLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider } from "@/components/LocaleProvider";
import SocialIcon from "@/components/SocialIcons";
import ThemeToggle from "@/components/ThemeToggle";
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
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={localizePath(locale as SupportedLocale, "/")}
            className="font-bold text-lg tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
          >
            {siteProfile.brandMark}
          </Link>
          <div className="flex items-center gap-6">
            <nav
              className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300"
              aria-label={siteProfile.navigation.mainAriaLabel}
            >
              <NavLink href="/projects">{siteProfile.navigation.projectsLabel}</NavLink>
              <NavLink href="/writing">{siteProfile.navigation.writingLabel}</NavLink>
              <NavLink href="/about">{siteProfile.navigation.aboutLabel}</NavLink>
              <Link href={localizePath(locale as SupportedLocale, "/#contact")} className="link-nav">
                {siteProfile.navigation.contactLabel}
              </Link>
            </nav>
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <LanguageSwitcher />
              {socialLinks.map((link) => (
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

      <div id="main-content" className="flex-grow min-w-0 overflow-x-hidden">
        {children}
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
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
