/**
 * Giscus (GitHub Discussions) comment widget config.
 * Set GISCUS_REPO, GISCUS_REPO_ID, GISCUS_CATEGORY_ID (and optional GISCUS_CATEGORY) in env.
 * When unset, the comments section is not rendered. See docs/comments-setup.md.
 */
export interface GiscusConfig {
  repo: string;
  repoId: string;
  categoryId: string;
  category?: string;
}

export function getGiscusConfig(): GiscusConfig | null {
  const repo = process.env.GISCUS_REPO?.trim();
  const repoId = process.env.GISCUS_REPO_ID?.trim();
  const categoryId = process.env.GISCUS_CATEGORY_ID?.trim();
  const category = process.env.GISCUS_CATEGORY?.trim();

  if (!repo || !repoId || !categoryId) return null;
  return { repo, repoId, categoryId, category };
}
