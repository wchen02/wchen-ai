import type { Writing } from "@/lib/schemas";

export const INVESTING_THEME = "Investing";

export function isInvestingWriting(writing: Pick<Writing, "theme">): boolean {
  return writing.theme === INVESTING_THEME;
}

export function getGeneralWritings(writings: Writing[]): Writing[] {
  return writings.filter((writing) => !isInvestingWriting(writing));
}

export function getInvestingWritings(writings: Writing[]): Writing[] {
  return writings.filter(isInvestingWriting);
}
