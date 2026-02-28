import Link from "next/link";

export const metadata = {
  title: "Subscribed! | Wilson Chen",
};

export default function NewsletterConfirmed() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        You&apos;re subscribed!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Thanks for confirming. You&apos;ll hear from me when I publish something new.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/writing" className="btn-primary">
          Read my writing
        </Link>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </nav>
    </main>
  );
}
