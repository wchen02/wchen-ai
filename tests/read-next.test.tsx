import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ReadNext from "../src/components/ReadNext";
import type { Writing } from "../src/lib/schemas";

function makeWriting(index: number): Writing {
  return {
    slug: `post-${index}`,
    title: `Post ${index}`,
    publishDate: "2026-03-14T12:00:00Z",
    theme: "Architecture",
    tags: ["site"],
    featured: false,
    draft: false,
    readingTimeMinutes: 3,
    excerpt: `Related post ${index}`,
    content: "",
  };
}

describe("ReadNext", () => {
  it("renders related posts in two columns with at most two rows", () => {
    const html = renderToStaticMarkup(
      <ReadNext writings={Array.from({ length: 5 }, (_, index) => makeWriting(index + 1))} locale="en" />,
    );

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).not.toContain("Post 5");
  });
});
