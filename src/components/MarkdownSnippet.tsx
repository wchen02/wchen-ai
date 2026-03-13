import { MDXRemote } from "next-mdx-remote/rsc";

interface MarkdownSnippetProps {
  source: string;
  className?: string;
}

export default async function MarkdownSnippet({
  source,
  className,
}: MarkdownSnippetProps) {
  return (
    <div className={className}>
      <MDXRemote source={source} />
    </div>
  );
}
