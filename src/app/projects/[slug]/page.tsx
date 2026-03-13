import LocaleRedirectPage from "@/components/LocaleRedirectPage";
import { getProjects } from "@/lib/mdx";

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LocaleRedirectPage targetPath={`/projects/${slug}`} />;
}