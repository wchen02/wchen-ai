import Link from "next/link";
import { localizePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locales";
import { getSiteProfile } from "@/lib/site-config";

export default function ReachOutCTA({ locale }: { locale?: string }) {
  const siteProfile = getSiteProfile(locale);
  const contactHref = localizePath(resolveLocale(locale), "/#contact");

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {siteProfile.cta.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {siteProfile.cta.description}
      </p>
      <Link 
        href={contactHref}
        className="btn-secondary inline-flex items-center text-sm px-4 py-2"
      >
        {siteProfile.cta.buttonLabel}
      </Link>
    </div>
  );
}
