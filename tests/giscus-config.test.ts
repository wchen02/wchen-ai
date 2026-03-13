import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("getGiscusConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GISCUS_REPO;
    delete process.env.GISCUS_REPO_ID;
    delete process.env.GISCUS_CATEGORY_ID;
    delete process.env.GISCUS_CATEGORY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when GISCUS_REPO is missing", async () => {
    process.env.GISCUS_REPO_ID = "R_kgDOxyz";
    process.env.GISCUS_CATEGORY_ID = "DIC_kwDOxyz";
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    expect(getGiscusConfig()).toBeNull();
  });

  it("returns null when GISCUS_REPO_ID is missing", async () => {
    process.env.GISCUS_REPO = "owner/repo";
    process.env.GISCUS_CATEGORY_ID = "DIC_kwDOxyz";
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    expect(getGiscusConfig()).toBeNull();
  });

  it("returns null when GISCUS_CATEGORY_ID is missing", async () => {
    process.env.GISCUS_REPO = "owner/repo";
    process.env.GISCUS_REPO_ID = "R_kgDOxyz";
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    expect(getGiscusConfig()).toBeNull();
  });

  it("returns null when all env vars are unset", async () => {
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    expect(getGiscusConfig()).toBeNull();
  });

  it("returns config when required vars are set", async () => {
    process.env.GISCUS_REPO = "owner/repo";
    process.env.GISCUS_REPO_ID = "R_kgDOxyz";
    process.env.GISCUS_CATEGORY_ID = "DIC_kwDOxyz";
    vi.resetModules();
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    const config = getGiscusConfig();
    expect(config).not.toBeNull();
    expect(config).toEqual({
      repo: "owner/repo",
      repoId: "R_kgDOxyz",
      categoryId: "DIC_kwDOxyz",
      category: undefined,
    });
  });

  it("returns config with optional category when GISCUS_CATEGORY is set", async () => {
    process.env.GISCUS_REPO = "owner/repo";
    process.env.GISCUS_REPO_ID = "R_kgDOxyz";
    process.env.GISCUS_CATEGORY_ID = "DIC_kwDOxyz";
    process.env.GISCUS_CATEGORY = "Comments";
    vi.resetModules();
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    const config = getGiscusConfig();
    expect(config).not.toBeNull();
    expect(config!.category).toBe("Comments");
  });

  it("trims whitespace from env values", async () => {
    process.env.GISCUS_REPO = "  owner/repo  ";
    process.env.GISCUS_REPO_ID = " R_kgDOxyz ";
    process.env.GISCUS_CATEGORY_ID = " DIC_kwDOxyz ";
    process.env.GISCUS_CATEGORY = " General ";
    vi.resetModules();
    const { getGiscusConfig } = await import("../src/lib/giscus-config");
    const config = getGiscusConfig();
    expect(config).not.toBeNull();
    expect(config!.repo).toBe("owner/repo");
    expect(config!.repoId).toBe("R_kgDOxyz");
    expect(config!.categoryId).toBe("DIC_kwDOxyz");
    expect(config!.category).toBe("General");
  });
});
