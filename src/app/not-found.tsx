import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        This page doesn&apos;t exist — but there&apos;s plenty more to explore.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="px-5 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/projects"
          className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Projects
        </Link>
        <Link
          href="/writing"
          className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Writing
        </Link>
      </nav>
    </main>
  );
}
