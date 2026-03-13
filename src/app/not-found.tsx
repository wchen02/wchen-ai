import Link from "next/link";
import { SITE_PROFILE } from "@/lib/site-config";

export const metadata = {
  title: `${SITE_PROFILE.notFound.title} | ${SITE_PROFILE.siteName}`,
};

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {SITE_PROFILE.notFound.description}
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/projects" className="btn-secondary">
          Projects
        </Link>
        <Link href="/writing" className="btn-secondary">
          Writing
        </Link>
      </nav>
    </main>
  );
}
