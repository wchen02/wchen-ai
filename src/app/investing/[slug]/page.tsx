import LocaleRedirectPage from "@/components/LocaleRedirectPage";
import { getWritings } from "@/lib/mdx";
import { isInvestingWriting } from "@/lib/writing-sections";

export async function generateStaticParams() {
  return getWritings()
    .filter(isInvestingWriting)
    .map((writing) => ({
      slug: writing.slug,
    }));
}

export default async function InvestingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LocaleRedirectPage targetPath={`/investing/${slug}`} />;
}
