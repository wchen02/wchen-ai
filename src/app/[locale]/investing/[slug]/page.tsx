import { getWritings } from "@/lib/mdx";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { isInvestingWriting } from "@/lib/writing-sections";
import WritingPage, { generateMetadata } from "../../writing/[slug]/page";

export { generateMetadata };

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getWritings(locale)
      .filter(isInvestingWriting)
      .map((writing) => ({
        locale,
        slug: writing.slug,
      }))
  );
}

export default WritingPage;
