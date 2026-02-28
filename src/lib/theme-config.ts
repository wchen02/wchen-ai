/**
 * Short descriptors for writing themes (FR-004). Used on the writing index and related content.
 * Keys must match the `theme` field in writing frontmatter.
 */
export const THEME_DESCRIPTORS: Record<string, string> = {
  "Architecture": "Systems design and static-first approaches",
  "Infrastructure": "Hosting, email, and platform choices",
  "Workflow": "How we build and ship",
  "Developer Tools": "AI, agents, and developer experience",
} as const;

export function getThemeDescriptor(theme: string): string {
  return THEME_DESCRIPTORS[theme] ?? theme;
}
