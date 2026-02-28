"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={
        isActive
          ? "text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
          : "hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      }
    >
      {children}
    </Link>
  );
}
