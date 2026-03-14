import fs from "fs";
import path from "path";
import { logger } from "../src/lib/logger";
import { SITE_URL } from "../src/lib/site-config";

function main(): void {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  const outPath = path.join(process.cwd(), "public", "robots.txt");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, robots, "utf8");
  logger.log(`Generated robots.txt at ${outPath}`);
}

main();
