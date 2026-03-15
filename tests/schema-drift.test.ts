import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * ContactPayloadSchema is defined once in shared/contact.ts. This test ensures
 * all consumers use the shared module (no duplicate definitions) and that the
 * shared handler is the single implementation used by all provider wrappers.
 */
describe("ContactPayloadSchema single source of truth", () => {
  const sharedPath = path.resolve(__dirname, "../shared/contact.ts");
  const schemasPath = path.resolve(__dirname, "../src/lib/schemas.ts");
  const sharedHandlerPath = path.resolve(__dirname, "../shared/handlers/contact.ts");
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

  it("shared/handlers/contact.ts imports ContactPayloadSchema from shared", () => {
    const source = fs.readFileSync(sharedHandlerPath, "utf8");
    expect(source).toMatch(/from\s+["']\.\.\/contact["']/);
    expect(source).toContain("ContactPayloadSchema");
  });

  it("functions/api/contact.ts delegates to the shared handler", () => {
    const source = fs.readFileSync(contactFnPath, "utf8");
    expect(source).toMatch(/from\s+["']\.\.\/\.\.\/shared\/handlers\/contact["']/);
    expect(source).toContain("handleContact");
  });
});
