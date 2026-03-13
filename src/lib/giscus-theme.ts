/**
 * Giscus widget theme from site theme (light/dark).
 * Used by GiscusComments; testable via optional doc param.
 */
export function getGiscusTheme(
  doc?: { documentElement: { classList: { contains: (name: string) => boolean } } } | null
): string {
  const documentLike = doc ?? (typeof document !== "undefined" ? document : null);
  if (!documentLike) return "light";
  const isDark = documentLike.documentElement.classList.contains("dark");
  return isDark ? "dark_dimmed" : "light";
}
