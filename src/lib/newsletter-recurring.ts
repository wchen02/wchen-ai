import fs from "fs";
import path from "path";
import { z } from "zod";

import { DEFAULT_LOCALE } from "./locales";
import { absoluteUrl } from "./site-config";
import { extractExcerpt, getProjects, getWritings } from "./mdx";

export type RecurringNewsletterItemType = "writing" | "project";

const NEWSLETTER_STATE_PATH = path.join(process.cwd(), "content", "site", "newsletter-state.json");

const NewsletterSendRecordSchema = z.object({
  slug: z.string().min(1),
  sentAt: z.string().datetime(),
  subject: z.string().min(1),
});

const NewsletterSendStateSchema = z.object({
  writing: z.array(NewsletterSendRecordSchema).default([]),
  projects: z.array(NewsletterSendRecordSchema).default([]),
});

export type NewsletterSendRecord = z.infer<typeof NewsletterSendRecordSchema>;
export type NewsletterSendState = z.infer<typeof NewsletterSendStateSchema>;

export interface RecurringNewsletterCandidate {
  type: RecurringNewsletterItemType;
  slug: string;
  title: string;
  summary: string;
  ctaUrl: string;
  publishedAt: string;
}

export function getNewsletterStatePath(): string {
  return NEWSLETTER_STATE_PATH;
}

export function loadNewsletterSendState(statePath: string = NEWSLETTER_STATE_PATH): NewsletterSendState {
  if (!fs.existsSync(statePath)) {
    return { writing: [], projects: [] };
  }

  const raw = fs.readFileSync(statePath, "utf8");
  return NewsletterSendStateSchema.parse(JSON.parse(raw));
}

export function writeNewsletterSendState(
  state: NewsletterSendState,
  statePath: string = NEWSLETTER_STATE_PATH
): void {
  const normalized = NewsletterSendStateSchema.parse(state);
  fs.writeFileSync(statePath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

export function getRecurringNewsletterCandidates(locale: string = DEFAULT_LOCALE): RecurringNewsletterCandidate[] {
  const writingCandidates = getWritings(locale).map((writing) => ({
    type: "writing" as const,
    slug: writing.slug,
    title: writing.title,
    summary: writing.excerpt,
    ctaUrl: absoluteUrl(`/writing/${writing.slug}`, locale),
    publishedAt: writing.publishDate,
  }));

  const projectCandidates = getProjects(locale).map((project) => ({
    type: "project" as const,
    slug: project.slug,
    title: project.title,
    summary: extractExcerpt(project.content, 200),
    ctaUrl: absoluteUrl(`/projects/${project.slug}`, locale),
    publishedAt: project.date,
  }));

  return [...writingCandidates, ...projectCandidates].sort(compareRecurringCandidates);
}

export function compareRecurringCandidates(
  a: RecurringNewsletterCandidate,
  b: RecurringNewsletterCandidate
): number {
  const publishedAtDiff = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
  if (publishedAtDiff !== 0) {
    return publishedAtDiff;
  }

  if (a.type !== b.type) {
    return a.type.localeCompare(b.type);
  }

  return a.slug.localeCompare(b.slug);
}

export function hasNewsletterBeenSent(
  state: NewsletterSendState,
  candidate: Pick<RecurringNewsletterCandidate, "type" | "slug">
): boolean {
  const records = candidate.type === "writing" ? state.writing : state.projects;
  return records.some((record) => record.slug === candidate.slug);
}

export function selectNextRecurringNewsletterCandidate(
  candidates: RecurringNewsletterCandidate[],
  state: NewsletterSendState
): RecurringNewsletterCandidate | null {
  return candidates.find((candidate) => !hasNewsletterBeenSent(state, candidate)) ?? null;
}

export function selectUnsentRecurringNewsletterCandidates(
  candidates: RecurringNewsletterCandidate[],
  state: NewsletterSendState
): RecurringNewsletterCandidate[] {
  return candidates.filter((candidate) => !hasNewsletterBeenSent(state, candidate));
}

export function markRecurringNewsletterSent(
  state: NewsletterSendState,
  candidate: Pick<RecurringNewsletterCandidate, "type" | "slug">,
  sentAt: string,
  subject: string
): NewsletterSendState {
  if (hasNewsletterBeenSent(state, candidate)) {
    return state;
  }

  const record: NewsletterSendRecord = {
    slug: candidate.slug,
    sentAt,
    subject,
  };

  if (candidate.type === "writing") {
    return {
      ...state,
      writing: [...state.writing, record],
    };
  }

  return {
    ...state,
    projects: [...state.projects, record],
  };
}

export function markRecurringNewsletterCandidatesSent(
  state: NewsletterSendState,
  candidates: Array<Pick<RecurringNewsletterCandidate, "type" | "slug">>,
  sentAt: string,
  subject: string
): NewsletterSendState {
  return candidates.reduce(
    (nextState, candidate) => markRecurringNewsletterSent(nextState, candidate, sentAt, subject),
    state
  );
}
