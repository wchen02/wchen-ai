/**
 * Environment-based logger: production only emits errors; development emits all levels.
 * Use this instead of console.* so production builds stay quiet.
 */

// Use process.env.NODE_ENV so Next.js (and other bundlers) replace it at build time. In a static production
// build the client bundle becomes isProduction = true; at runtime (next start / deploy) NODE_ENV is production.
// Scripts: use "pnpm run build" / "pnpm run start" (they set NODE_ENV=production). Do not set NODE_ENV=production
// when running "next dev" — Next and React require development mode for the dev server.
const isProduction = process.env.NODE_ENV === "production";
function log(level: "debug" | "info" | "log" | "warn" | "error", ...args: unknown[]) {
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(...args);
    return;
  }
  if (isProduction) return;
  switch (level) {
    case "debug":
      // eslint-disable-next-line no-console
      console.debug(...args);
      break;
    case "info":
      // eslint-disable-next-line no-console
      console.info(...args);
      break;
    case "log":
      // eslint-disable-next-line no-console
      console.log(...args);
      break;
    case "warn":
      // eslint-disable-next-line no-console
      console.warn(...args);
      break;
    default:
      break;
  }
}

export const logger = {
  debug: (...args: unknown[]) => log("debug", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  log: (...args: unknown[]) => log("log", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
};

// In the browser in production, silence known third-party console noise (e.g. giscus.app)
if (typeof globalThis !== "undefined" && "window" in globalThis && isProduction) {
  const silencePatterns = ["[giscus]", "Discussion not found", "A new discussion will be created"];
  const shouldSilence = (args: unknown[]) => {
    const text = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
    return silencePatterns.some((p) => text.includes(p));
  };
  const origWarn = console.warn;
  const origLog = console.log;
  console.warn = (...args: unknown[]) => {
    if (shouldSilence(args)) return;
    origWarn.apply(console, args);
  };
  console.log = (...args: unknown[]) => {
    if (shouldSilence(args)) return;
    origLog.apply(console, args);
  };
}
