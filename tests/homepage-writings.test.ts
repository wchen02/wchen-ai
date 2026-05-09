import { describe, expect, it } from "vitest";
import type { Writing } from "../src/lib/schemas";
import { getHomePageWritings } from "../src/lib/writing-sections";

function makeWriting(overrides: Partial<Writing> & Pick<Writing, "slug" | "title" | "publishDate" | "theme">): Writing {
  return {
    tags: [],
    featured: false,
    draft: false,
    readingTimeMinutes: 1,
    excerpt: "",
    content: "",
    ...overrides,
  };
}

describe("homepage writing selection", () => {
  it("includes the latest investing posts in recent thinking", () => {
    const writings = [
      makeWriting({
        slug: "older-general",
        title: "Older General",
        publishDate: "2026-05-08T12:00:00Z",
        theme: "Architecture",
        featured: true,
      }),
      makeWriting({
        slug: "latest-investing",
        title: "Latest Investing",
        publishDate: "2026-05-09T13:30:00Z",
        theme: "Investing",
      }),
      makeWriting({
        slug: "middle-general",
        title: "Middle General",
        publishDate: "2026-05-09T02:45:00Z",
        theme: "Writing",
      }),
    ];

    expect(getHomePageWritings(writings, 2).map((writing) => writing.slug)).toEqual([
      "latest-investing",
      "middle-general",
    ]);
  });
});
