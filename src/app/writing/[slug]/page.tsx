import LocaleRedirectPage from "@/components/LocaleRedirectPage";
import { getWritings } from "@/lib/mdx";

export async function generateStaticParams() {
  const writings = getWritings();
  return writings.map((writing) => ({
    slug: writing.slug,
  }));
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LocaleRedirectPage targetPath={`/writing/${slug}`} />;
}