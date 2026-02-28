import WritingCard from "@/components/WritingCard";
import type { Writing } from "@/lib/schemas";

export default function ReadNext({ writings }: { writings: Writing[] }) {
  if (writings.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Read Next
      </h2>
      <div className="flex flex-col gap-2 -mx-5">
        {writings.map((w) => (
          <WritingCard key={w.slug} writing={w} />
        ))}
      </div>
    </section>
  );
}
