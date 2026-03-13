import { describe, expect, it } from "vitest";
import { getGiscusTheme } from "@/lib/giscus-theme";

describe("getGiscusTheme", () => {
  it("returns light when documentElement has no dark class", () => {
    const doc = {
      documentElement: {
        classList: { contains: (name: string) => name === "dark" && false },
      },
    };
    expect(getGiscusTheme(doc)).toBe("light");
  });

  it("returns dark_dimmed when documentElement has dark class", () => {
    const doc = {
      documentElement: {
        classList: { contains: (name: string) => name === "dark" && true },
      },
    };
    expect(getGiscusTheme(doc)).toBe("dark_dimmed");
  });

  it("returns light when doc is null (SSR / no document)", () => {
    expect(getGiscusTheme(null)).toBe("light");
  });

  it("returns light when doc is undefined (uses global document in browser; in node undefined)", () => {
    const result = getGiscusTheme(undefined);
    expect(result).toBe("light");
  });
});

describe("theme toggle and comment theme alignment", () => {
  it("cycle light -> dark produces dark_dimmed for Giscus", () => {
    const lightDoc = {
      documentElement: { classList: { contains: () => false } },
    };
    const darkDoc = {
      documentElement: { classList: { contains: (name: string) => name === "dark" } },
    };
    expect(getGiscusTheme(lightDoc)).toBe("light");
    expect(getGiscusTheme(darkDoc)).toBe("dark_dimmed");
  });

  it("cycle dark -> light produces light for Giscus", () => {
    const darkDoc = {
      documentElement: { classList: { contains: (name: string) => name === "dark" } },
    };
    const lightDoc = {
      documentElement: { classList: { contains: () => false } },
    };
    expect(getGiscusTheme(darkDoc)).toBe("dark_dimmed");
    expect(getGiscusTheme(lightDoc)).toBe("light");
  });
});
