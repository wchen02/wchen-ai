import Link from "next/link";

export default function ReachOutCTA() {
  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Interested in discussing this further?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        I&apos;m always open to connecting with fellow builders and founders.
      </p>
      <Link 
        href="/#contact" 
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
      >
        Start a conversation
      </Link>
    </div>
  );
}
