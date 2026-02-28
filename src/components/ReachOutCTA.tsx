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
        className="btn-secondary inline-flex items-center text-sm px-4 py-2"
      >
        Start a conversation
      </Link>
    </div>
  );
}
