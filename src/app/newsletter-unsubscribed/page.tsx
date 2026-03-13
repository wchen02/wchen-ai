import Link from "next/link";
import { SITE_PROFILE } from "@/lib/site-config";

export const metadata = {
  title: `Unsubscribed | ${SITE_PROFILE.siteName}`,
};

export default function NewsletterUnsubscribedPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        You have been unsubscribed
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        You will not receive future newsletter emails unless you subscribe again.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/writing" className="btn-primary">
          Read the writing archive
        </Link>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </nav>
    </main>
  );
}
