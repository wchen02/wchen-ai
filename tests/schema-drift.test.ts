import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * ContactPayloadSchema is defined once in shared/contact.ts and re-exported/imported
 * by src/lib/schemas.ts and functions/api/contact.ts. This test ensures both sides
 * use the shared module (no duplicate definitions).
 */
describe("ContactPayloadSchema single source of truth", () => {
  const sharedPath = path.resolve(__dirname, "../shared/contact.ts");
  const schemasPath = path.resolve(__dirname, "../src/lib/schemas.ts");
  const contactFnPath = path.resolve(__dirname, "../functions/api/contact.ts");

  it("shared/contact.ts defines ContactPayloadSchema", () => {
    const source = fs.readFileSync(sharedPath, "utf8");
    expect(source).toContain("ContactPayloadSchema");
    expect(source).toContain("z.object");
  });

  it("src/lib/schemas.ts re-exports from shared", () => {
    const source = fs.readFileSync(schemasPath, "utf8");
    expect(source).toMatch(/from\s+["']\.\.\/\.\.\/shared\/contact["']/);
  });

  it("functions/api/contact.ts imports from shared", () => {
    const source = fs.readFileSync(contactFnPath, "utf8");
    expect(source).toMatch(/from\s+["']\.\.\/\.\.\/shared\/contact["']/);
  });
});
