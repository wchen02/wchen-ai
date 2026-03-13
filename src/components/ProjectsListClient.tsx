"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useCurrentLocale } from "@/components/LocaleProvider";
import type { Project } from "@/lib/schemas";
import { formatDate } from "@/lib/formatting";
import { localizePath } from "@/lib/i18n";

const STAGGER_DELAY = 0.06;

interface ProjectsListClientProps {
  projects: Project[];
}

export default function ProjectsListClient({ projects }: ProjectsListClientProps) {
  const locale = useCurrentLocale();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="grid gap-6">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={localizePath(locale, `/projects/${project.slug}`)}
            className="group flex flex-col gap-2 p-4 -mx-4 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {project.title}
              </h3>
              <time dateTime={project.date} className="text-sm text-gray-500">
                {formatDate(project.date, { year: "numeric", month: "short" }, locale)}
              </time>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.motivation}
            </p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="grid gap-6">
        {projects.map((project, i) => (
          <m.div
            key={project.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * STAGGER_DELAY, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="transition-[box-shadow] duration-200 hover:shadow-[0_4px_14px_-4px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_4px_14px_-4px_rgba(16,185,129,0.15)]"
          >
            <Link
              href={localizePath(locale, `/projects/${project.slug}`)}
              className="group flex flex-col gap-2 p-4 -mx-4 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors block"
            >
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>
                <time dateTime={project.date} className="text-sm text-gray-500">
                  {formatDate(project.date, { year: "numeric", month: "short" }, locale)}
                </time>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.motivation}
              </p>
            </Link>
          </m.div>
        ))}
      </div>
    </LazyMotion>
  );
}
