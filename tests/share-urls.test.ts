import { describe, expect, it } from "vitest";
import {
  TWITTER_TEXT_MAX,
  truncateForTwitter,
  shareUrlEmail,
  shareUrlTwitter,
  shareUrlLinkedIn,
  shareUrlFacebook,
} from "@/lib/share-urls";

describe("truncateForTwitter", () => {
  it("returns text unchanged when within max length", () => {
    const short = "Hello world";
    expect(truncateForTwitter(short)).toBe(short);
    expect(truncateForTwitter(short, 5)).toBe("Hello…");
  });

  it("truncates at word boundary and appends ellipsis when over max", () => {
    const long = "a ".repeat(80);
    const result = truncateForTwitter(long, 50);
    expect(result.length).toBeLessThanOrEqual(51);
    expect(result.endsWith("…")).toBe(true);
    expect(result.slice(-2)).not.toMatch(/\s\S$/);
  });

  it("uses default TWITTER_TEXT_MAX when maxLength not provided", () => {
    const over = "x".repeat(TWITTER_TEXT_MAX + 50);
    const result = truncateForTwitter(over);
    expect(result.length).toBeLessThanOrEqual(TWITTER_TEXT_MAX + 1);
  });

  it("truncates at word boundary", () => {
    const text = "one two three four five";
    expect(truncateForTwitter(text, 7)).toBe("one…");
    expect(truncateForTwitter(text, 11)).toBe("one two…");
    expect(truncateForTwitter(text, 15)).toBe("one two three…");
  });
});

describe("shareUrlEmail", () => {
  it("builds mailto with subject and body (url only) when no description", () => {
    const url = shareUrlEmail("My Title", "https://example.com/page");
    expect(url).toMatch(/^mailto:\?/);
    expect(decodeURIComponent(url)).toContain("subject=My Title");
    expect(decodeURIComponent(url)).toContain("body=https://example.com/page");
  });

  it("includes description and url in body when description provided", () => {
    const url = shareUrlEmail("Article", "https://site.com/a", "A short summary.");
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("subject=Article");
    expect(decoded).toContain("A short summary.");
    expect(decoded).toContain("https://site.com/a");
    expect(decoded).toMatch(/A short summary\.\s+\s+https:\/\//);
  });

  it("encodes special characters in subject and body", () => {
    const url = shareUrlEmail("Title & Co.", "https://x.com?q=1&2");
    expect(url).toContain(encodeURIComponent("Title & Co."));
    expect(url).toContain(encodeURIComponent("https://x.com?q=1&2"));
  });
});

describe("shareUrlTwitter", () => {
  it("builds tweet intent with title and url when no description", () => {
    const url = shareUrlTwitter("My Post", "https://example.com/p");
    expect(url).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/);
    expect(decodeURIComponent(url)).toContain("text=My Post");
    expect(decodeURIComponent(url)).toContain("url=https://example.com/p");
  });

  it("includes title and truncated description in text when description provided", () => {
    const desc = "A".repeat(300);
    const url = shareUrlTwitter("Title", "https://x.com", desc);
    const match = url.match(/text=([^&]+)/);
    expect(match).toBeTruthy();
    const text = decodeURIComponent(match![1]);
    expect(text).toMatch(/^Title — /);
    expect(text.length).toBeLessThanOrEqual(200 + "Title — ".length + 1);
    expect(text.endsWith("…") || text.length <= 200 + "Title — ".length).toBe(true);
  });

  it("encodes text and url", () => {
    const url = shareUrlTwitter("Hello & World", "https://a.com?x=1");
    expect(url).toContain(encodeURIComponent("Hello & World"));
    expect(url).toContain(encodeURIComponent("https://a.com?x=1"));
  });
});

describe("shareUrlLinkedIn", () => {
  it("builds LinkedIn share URL with encoded url param", () => {
    const url = shareUrlLinkedIn("https://example.com/page");
    expect(url).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent("https://example.com/page")
    );
  });

  it("encodes special characters in url", () => {
    const u = "https://site.com?a=1&b=2";
    expect(shareUrlLinkedIn(u)).toContain(encodeURIComponent(u));
  });
});

describe("shareUrlFacebook", () => {
  it("builds Facebook share URL with encoded u param", () => {
    const url = shareUrlFacebook("https://example.com/page");
    expect(url).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent("https://example.com/page")
    );
  });

  it("encodes special characters in url", () => {
    const u = "https://site.com?foo=bar&baz";
    expect(shareUrlFacebook(u)).toContain(encodeURIComponent(u));
  });
});
