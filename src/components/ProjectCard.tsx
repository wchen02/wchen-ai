import Link from "next/link";
import { type Project } from "@/lib/schemas";
import { formatDate } from "@/lib/formatting";
import { localizePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locales";
import { getUiContent } from "@/lib/site-content";

export default function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale?: string;
}) {
  const uiContent = getUiContent(locale);
  const projectHref = localizePath(resolveLocale(locale), `/projects/${project.slug}`);

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-xl hover:shadow-sm transition-shadow ${project.featured ? "border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10" : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900"}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          <Link href={projectHref} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {project.title}
          </Link>
        </h3>
        <time dateTime={project.date} className="text-sm text-gray-500 whitespace-nowrap ml-4">
          {formatDate(project.date, { year: "numeric", month: "long" }, locale)}
        </time>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {project.type.map((t) => (
          <span key={t} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-md">
            {uiContent.projects.typeLabels[t]}
          </span>
        ))}
        {project.status === 'in-progress' && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md">
            {uiContent.projects.inProgressLabel}
          </span>
        )}
      </div>

      <div className="mt-2 space-y-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        <p><strong>{uiContent.projects.motivationLabel}:</strong> {project.motivation}</p>
        <p><strong>{uiContent.projects.problemLabel}:</strong> {project.problemAddressed}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link 
          href={projectHref}
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {uiContent.projects.readFullStoryLabel} →
        </Link>
      </div>
    </div>
  );
}