"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import NavLink from "@/components/NavLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SocialIcon from "@/components/SocialIcons";
import ThemeToggle from "@/components/ThemeToggle";
import { localizePath } from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/locales";
import type { SocialLink } from "@/lib/site-config";
import type { SiteProfile } from "@/lib/schemas";

const MENU_PANEL_ID = "site-header-menu-panel";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function SiteHeader({
  locale,
  brandMark,
  navigation,
  socialLinks,
}: {
  locale: SupportedLocale;
  brandMark: string;
  navigation: SiteProfile["navigation"];
  socialLinks: SocialLink[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    closeButtonRef.current?.focus();
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeMenu]);

  const navLinks = (
    <>
      <NavLink href="/projects">{navigation.projectsLabel}</NavLink>
      <NavLink href="/writing">{navigation.writingLabel}</NavLink>
      <NavLink href="/about">{navigation.aboutLabel}</NavLink>
      <Link
        href={localizePath(locale, "/#contact")}
        className="link-nav"
        onClick={closeMenu}
      >
        {navigation.contactLabel}
      </Link>
    </>
  );

  const utils = (
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
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href={localizePath(locale, "/")}
          className="font-bold text-lg tracking-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
        >
          {brandMark}
        </Link>

        {/* Desktop: nav + utils */}
        <div className="hidden md:flex items-center gap-6">
          <nav
            className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300"
            aria-label={navigation.mainAriaLabel}
          >
            {navLinks}
          </nav>
          {utils}
        </div>

        {/* Mobile: menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden p-2 -m-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
          aria-expanded={isMenuOpen}
          aria-controls={MENU_PANEL_ID}
          aria-label={isMenuOpen ? navigation.menuCloseAriaLabel : navigation.menuOpenAriaLabel}
          onClick={isMenuOpen ? closeMenu : openMenu}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className="md:hidden fixed inset-0 z-40"
        aria-hidden={!isMenuOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeMenu}
          aria-hidden
        />

        {/* Panel */}
        <div
          id={MENU_PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label={navigation.mainAriaLabel}
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-background border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col transition-transform duration-200 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
              {brandMark}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              className="p-2 -m-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
              aria-label={navigation.menuCloseAriaLabel}
              onClick={closeMenu}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-8 p-6 overflow-auto">
            <nav
              className="flex flex-col gap-4 text-sm font-medium text-gray-600 dark:text-gray-300"
              aria-label={navigation.mainAriaLabel}
            >
              <NavLink href="/projects" onClick={closeMenu}>
                {navigation.projectsLabel}
              </NavLink>
              <NavLink href="/writing" onClick={closeMenu}>
                {navigation.writingLabel}
              </NavLink>
              <NavLink href="/about" onClick={closeMenu}>
                {navigation.aboutLabel}
              </NavLink>
              <Link
                href={localizePath(locale, "/#contact")}
                className="link-nav"
                onClick={closeMenu}
              >
                {navigation.contactLabel}
              </Link>
            </nav>
            {utils}
          </div>
        </div>
      </div>
    </header>
  );
}
