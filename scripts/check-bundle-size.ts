import fs from 'fs';
import path from 'path';

const MAX_INITIAL_JS_KB = 100;
const OUT_DIR = path.join(process.cwd(), 'out');
const CHUNKS_DIR = path.join(OUT_DIR, '_next', 'static', 'chunks');

function getFileSizeKB(filePath: string): number {
  return fs.statSync(filePath).size / 1024;
}

function collectJsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function checkBundleSize(): void {
  console.log('Checking JS bundle size...');

  if (!fs.existsSync(CHUNKS_DIR)) {
    console.warn(`Chunks directory not found at ${CHUNKS_DIR}. Skipping bundle size check.`);
    return;
  }

  const jsFiles = collectJsFiles(CHUNKS_DIR);
  const fileSizes = jsFiles.map((f) => ({
    file: path.relative(OUT_DIR, f),
    sizeKB: getFileSizeKB(f),
  }));

  fileSizes.sort((a, b) => b.sizeKB - a.sizeKB);

  const totalKB = fileSizes.reduce((sum, f) => sum + f.sizeKB, 0);

  console.log('\nJS chunks:');
  for (const f of fileSizes) {
    console.log(`  ${f.sizeKB.toFixed(1).padStart(8)} KB  ${f.file}`);
  }
  console.log(`\n  Total: ${totalKB.toFixed(1)} KB (limit: ${MAX_INITIAL_JS_KB} KB)`);

  if (totalKB > MAX_INITIAL_JS_KB) {
    console.error(
      `\nBundle size ${totalKB.toFixed(1)} KB exceeds ${MAX_INITIAL_JS_KB} KB limit. Build aborted.`
    );
    process.exit(1);
  }

  console.log('\nBundle size within budget.');
}

checkBundleSize();
