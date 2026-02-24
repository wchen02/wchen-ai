import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Drift detection: ContactPayloadSchema is defined in both src/lib/schemas.ts
 * and functions/api/contact.ts. This test ensures they stay in sync by
 * comparing the schema object literal from both files.
 */
describe('ContactPayloadSchema drift detection', () => {
  function extractSchemaBlock(source: string): string {
    const match = source.match(
      /const ContactPayloadSchema\s*=\s*z\.object\(\{([\s\S]*?)\}\)/
    );
    if (!match) throw new Error('Could not find ContactPayloadSchema definition');
    return match[1]
      .replace(/\/\/.*$/gm, '')  // strip single-line comments
      .replace(/\s+/g, ' ')
      .trim();
  }

  it('functions/api/contact.ts schema matches src/lib/schemas.ts', () => {
    const canonicalSource = fs.readFileSync(
      path.resolve(__dirname, '../src/lib/schemas.ts'),
      'utf8',
    );
    const functionSource = fs.readFileSync(
      path.resolve(__dirname, '../functions/api/contact.ts'),
      'utf8',
    );

    const canonical = extractSchemaBlock(canonicalSource);
    const functionSchema = extractSchemaBlock(functionSource);

    expect(functionSchema).toBe(canonical);
  });
});
