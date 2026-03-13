import fs from "fs";
import path from "path";
import { SITE_URL } from "../src/lib/site-config";

function main(): void {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  const outPath = path.join(process.cwd(), "public", "robots.txt");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, robots, "utf8");
  console.log(`Generated robots.txt at ${outPath}`);
}

main();
