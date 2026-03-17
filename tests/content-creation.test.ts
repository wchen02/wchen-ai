import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  parseFileBlocks,
  buildUserMessage,
  buildSystemPrompt,
  readSkillFile,
  writeContentFile,
  ALLOWED_OUTPUT_DIRS,
} from "../src/lib/content-creation";

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe("parseArgs", () => {
  it("returns an empty object for an empty argv", () => {
    expect(parseArgs(["node", "script"])).toEqual({});
  });

  it("parses a single --key value pair", () => {
    expect(parseArgs(["node", "script", "--type", "writing"])).toEqual({ type: "writing" });
  });

  it("parses multiple --key value pairs", () => {
    expect(
      parseArgs(["node", "script", "--type", "writing", "--topic", "Why I stopped using ORMs"])
    ).toEqual({ type: "writing", topic: "Why I stopped using ORMs" });
  });

  it("treats a --flag with no following value as true", () => {
    expect(parseArgs(["node", "script", "--draft"])).toEqual({ draft: "true" });
  });

  it("treats a flag followed immediately by another flag as true", () => {
    expect(parseArgs(["node", "script", "--draft", "--type", "writing"])).toEqual({
      draft: "true",
      type: "writing",
    });
  });

  it("parses --slug and --locale alongside --type and --topic", () => {
    expect(
      parseArgs([
        "node",
        "script",
        "--type",
        "writing",
        "--topic",
        "My topic",
        "--slug",
        "my-slug",
        "--locale",
        "es",
      ])
    ).toEqual({ type: "writing", topic: "My topic", slug: "my-slug", locale: "es" });
  });
});

// ---------------------------------------------------------------------------
// parseFileBlocks
// ---------------------------------------------------------------------------

describe("parseFileBlocks", () => {
  it("returns an empty array when there are no file blocks", () => {
    expect(parseFileBlocks("No blocks here")).toEqual([]);
  });

  it("extracts a single file block", () => {
    const response = `<file path="content/writing/my-post.mdx">
---
title: My post
---
Body text.
</file>`;
    const blocks = parseFileBlocks(response);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].path).toBe("content/writing/my-post.mdx");
    expect(blocks[0].content).toContain("title: My post");
  });

  it("trims leading and trailing whitespace from block content", () => {
    const response = `<file path="content/writing/post.mdx">

  body text

</file>`;
    const blocks = parseFileBlocks(response);
    expect(blocks[0].content).toBe("body text");
  });

  it("extracts multiple file blocks", () => {
    const response = `
<file path="content/writing/en.mdx">English content</file>
<file path="content/locales/es/writing/es.mdx">Spanish content</file>
<file path="content/locales/zh/writing/zh.mdx">Chinese content</file>
`;
    const blocks = parseFileBlocks(response);
    expect(blocks).toHaveLength(3);
    expect(blocks[0].path).toBe("content/writing/en.mdx");
    expect(blocks[1].path).toBe("content/locales/es/writing/es.mdx");
    expect(blocks[2].path).toBe("content/locales/zh/writing/zh.mdx");
  });

  it("returns an empty array for a malformed block missing the closing tag", () => {
    const response = `<file path="content/writing/broken.mdx">missing close`;
    expect(parseFileBlocks(response)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildUserMessage
// ---------------------------------------------------------------------------

describe("buildUserMessage", () => {
  it("returns the --prompt value verbatim", () => {
    expect(buildUserMessage({ prompt: "Update the about page" })).toBe("Update the about page");
  });

  it("builds a structured message from --type and --topic", () => {
    const msg = buildUserMessage({ type: "writing", topic: "Why I stopped using ORMs" });
    expect(msg).toBe("Create a writing entry about: Why I stopped using ORMs");
  });

  it("appends slug when --slug is provided", () => {
    const msg = buildUserMessage({ type: "project", topic: "My tool", slug: "my-tool" });
    expect(msg).toContain("Use slug: my-tool");
  });

  it("appends locale when --locale is provided", () => {
    const msg = buildUserMessage({ type: "writing", topic: "Cost of indirection", locale: "es" });
    expect(msg).toContain("Write for locale: es");
  });

  it("includes both slug and locale when both are provided", () => {
    const msg = buildUserMessage({ type: "writing", topic: "X", slug: "x-post", locale: "zh" });
    expect(msg).toContain("Use slug: x-post");
    expect(msg).toContain("Write for locale: zh");
  });

  it("throws when --type is missing", () => {
    expect(() => buildUserMessage({ topic: "Some topic" })).toThrow(
      "Provide either --prompt or both --type and --topic"
    );
  });

  it("throws when --topic is missing", () => {
    expect(() => buildUserMessage({ type: "writing" })).toThrow(
      "Provide either --prompt or both --type and --topic"
    );
  });

  it("throws when neither --prompt nor --type/--topic are provided", () => {
    expect(() => buildUserMessage({})).toThrow(
      "Provide either --prompt or both --type and --topic"
    );
  });
});

// ---------------------------------------------------------------------------
// readSkillFile
// ---------------------------------------------------------------------------

describe("readSkillFile", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns file content when the file exists", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("# SKILL\nContent here");

    const result = readSkillFile("/skills/website-content", "SKILL.md");
    expect(result).toBe("# SKILL\nContent here");
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join("/skills/website-content", "SKILL.md")
    );
  });

  it("returns an empty string when the file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const readSpy = vi.spyOn(fs, "readFileSync");

    const result = readSkillFile("/skills/website-content", "missing.md");
    expect(result).toBe("");
    expect(readSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

describe("buildSystemPrompt", () => {
  afterEach(() => vi.restoreAllMocks());

  it("includes SKILL.md, voice-guide, and content-schemas in the prompt", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath: unknown) => {
      const p = String(filePath);
      if (p.endsWith("SKILL.md")) return "SKILL CONTENT";
      if (p.endsWith("voice-guide.md")) return "VOICE CONTENT";
      if (p.endsWith("content-schemas.md")) return "SCHEMAS CONTENT";
      return "";
    });

    const prompt = buildSystemPrompt("/fake/skill-dir");
    expect(prompt).toContain("SKILL CONTENT");
    expect(prompt).toContain("VOICE CONTENT");
    expect(prompt).toContain("SCHEMAS CONTENT");
    expect(prompt).toContain("## Skill guidelines");
    expect(prompt).toContain("## Voice & Tone");
    expect(prompt).toContain("## Content Schemas");
    expect(prompt).toContain('<file path="RELATIVE/PATH/FROM/REPO/ROOT.mdx">');
  });

  it("handles missing skill files gracefully (no crash, empty sections)", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => buildSystemPrompt("/fake/skill-dir")).not.toThrow();
    const prompt = buildSystemPrompt("/fake/skill-dir");
    expect(prompt).toContain("## Skill guidelines");
    expect(prompt).toContain("## Voice & Tone");
    expect(prompt).toContain("## Content Schemas");
  });
});

// ---------------------------------------------------------------------------
// writeContentFile — path safety and allowed-directory enforcement
// ---------------------------------------------------------------------------

describe("writeContentFile", () => {
  const FAKE_ROOT = "/fake/repo";

  beforeEach(() => {
    vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
    vi.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it("writes a file into content/", () => {
    writeContentFile("content/writing/my-post.mdx", "# Hello", FAKE_ROOT);
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.resolve(FAKE_ROOT, "content/writing"),
      { recursive: true }
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(FAKE_ROOT, "content/writing/my-post.mdx"),
      "# Hello",
      "utf8"
    );
  });

  it("writes a file into public/writing/", () => {
    writeContentFile("public/writing/slug/image.png", "binary", FAKE_ROOT);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("writes a file into public/projects/", () => {
    writeContentFile("public/projects/my-project/screenshot.png", "binary", FAKE_ROOT);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("rejects an absolute path", () => {
    expect(() => writeContentFile("/etc/passwd", "evil", FAKE_ROOT)).toThrow(
      "Unsafe file path rejected"
    );
  });

  it("rejects a path containing ../", () => {
    expect(() =>
      writeContentFile("content/../../../etc/passwd", "evil", FAKE_ROOT)
    ).toThrow("Unsafe file path rejected");
  });

  it("rejects a path with .. component without a leading slash", () => {
    expect(() => writeContentFile("content/../../secret", "evil", FAKE_ROOT)).toThrow(
      "Unsafe file path rejected"
    );
  });

  it("rejects a path outside the allowed output directories", () => {
    expect(() => writeContentFile("src/lib/evil.ts", "evil", FAKE_ROOT)).toThrow(
      "not in an allowed output directory"
    );
  });

  it("rejects writing to the scripts/ directory", () => {
    expect(() => writeContentFile("scripts/evil.ts", "evil", FAKE_ROOT)).toThrow(
      "not in an allowed output directory"
    );
  });

  it("exports the canonical ALLOWED_OUTPUT_DIRS list", () => {
    expect(ALLOWED_OUTPUT_DIRS).toContain("content/");
    expect(ALLOWED_OUTPUT_DIRS).toContain("public/writing/");
    expect(ALLOWED_OUTPUT_DIRS).toContain("public/projects/");
  });
});
