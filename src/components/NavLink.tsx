"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { localizePath } from "@/lib/i18n";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const locale = useCurrentLocale();
  const pathname = usePathname() ?? "";
  const localizedHref = localizePath(locale, href);
  const isActive =
    localizedHref === `/${locale}`
      ? pathname === localizedHref
      : pathname.startsWith(localizedHref);

  return (
    <Link
      href={localizedHref}
      className={
        isActive
          ? "text-emerald-600 dark:text-emerald-400 font-semibold link-nav"
          : "link-nav"
      }
    >
      {children}
    </Link>
  );
}
