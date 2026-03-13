"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentLocale } from "@/components/LocaleProvider";
import { localizePath } from "@/lib/i18n";

export default function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const locale = useCurrentLocale();
  const pathname = usePathname() ?? "";
  const localizedHref = localizePath(locale, href);
  const isActive =
    localizedHref === `/${locale}`
      ? pathname === localizedHref
      : pathname.startsWith(localizedHref);

  const baseClass = isActive
    ? "text-emerald-600 dark:text-emerald-400 font-semibold link-nav"
    : "link-nav";

  return (
    <Link
      href={localizedHref}
      className={className ? `${baseClass} ${className}` : baseClass}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
