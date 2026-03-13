---
name: home-about-refresh
description: Update the homepage and about page on demand so they stay relevant to the site owner's current writings and projects. Use when the user asks to refresh the home page, update the about page, sync home/about with recent writing or projects, make the homepage reflect new work, or keep home and about aligned with what they've published. This skill gathers signal from the content corpus (writings and projects) and applies it to locale site copy (home.json, about.json) in the site owner's voice.
---

# Home & About Refresh

Update `content/locales/<locale>/site/home.json` and `content/locales/<locale>/site/about.json` so they reflect what the site owner is actually writing and building. The corpus (writings + projects) is the source of truth; home and about should summarize and stay aligned with it.

## When to Use

- User says: "update the home page," "refresh the about page," "sync home and about with my writing," "make the homepage reflect my projects," "keep home and about relevant," or similar.
- After adding or changing several writing or project entries and the user wants the main pages to reflect that.
- On-demand refresh without requiring the user to manually rewrite hero, focus, philosophy, or expertise.

## Prerequisites

1. Read `.agents/skills/website-content/references/voice-guide.md` so updates match the site owner's voice.
2. Read `.agents/skills/website-content/references/page-patterns.md` for the exact section order and copy structure of the homepage and about page.
3. Read [references/corpus-signals.md](references/corpus-signals.md) for what to extract from writings and projects and how it maps to home and about.

## Workflow

### 1. Gather corpus signal

- **Writings**: List and read a representative set from `content/writing/*.mdx` (and optionally `content/locales/<locale>/writing/*.mdx`). Prefer recent and `featured: true`. From each piece use: `theme`, `tags`, and 1–2 concrete convictions or reframes from the body (opening, position, closing).
- **Projects**: List and read from `content/projects/*.mdx` (and optionally locale-specific projects). Prefer `featured` and `status: active` or `in-progress`. From each use: `motivation`, `problemAddressed`, `learnings`, `type`, and any recurring problem areas.

Synthesize: current themes, problems the site owner cares about, principles that repeat, and areas of expertise that show up in both writing and projects.

### 2. Decide scope

- **Single locale**: Update only the default locale (e.g. `content/locales/en/site/home.json` and `about.json`).
- **All locales**: Update the default locale first, then update each other locale under `content/locales/<locale>/site/` with the same structural changes. Preserve existing translations where the meaning is still accurate; replace or add only where the new focus/themes require it. Do not invoke the content-translation skill for JSON (it is for MDX only).

### 3. Update home.json

- **hero.intro** / **hero.paragraphs**: Align with current role, current product/company, and what the site owner is exploring (from recent writings and active projects).
- **currentFocus.title** / **currentFocus.description** / **currentFocus.paragraphs**: Set from the main problem area and thesis that appear in the corpus (1–2 paragraphs max).
- **selectedWork** / **recentThinking**: Only section titles and descriptions; no need to change if they already fit. Empty states stay as-is.
- Keep route values unprefixed (e.g. `"/about"`). Preserve all required keys; see existing `content/locales/en/site/home.json` for shape.

### 4. Update about.json

- **intro.description**: One sentence that matches current positioning (founder/builder, focus area).
- **philosophy.paragraphs**: 3 paragraphs. Pull convictions and reframes from writings and project narratives; avoid generic filler.
- **expertise.items**: Up to 4 cards. Derive from recurring themes in writings and from project `problemAddressed` / `type` (e.g. "Context-Aware Agents," "Developer Experience"). Each: short **title**, 1–2 sentence **description**.
- **background.paragraphs**: Only update if the user has added new roles or context elsewhere; otherwise leave as-is.
- **principles.items**: 3 items. Extract recurring principles from writing conclusions and project learnings. Each: short **principle** (imperative, 2–5 words), **detail** (one sentence).
- **metadataDescription**: One line summarizing the about page for SEO; update if focus changed.

### 5. Preserve voice and constraints

- First person throughout.
- No corporate filler, hedging, exclamation points, or emojis.
- Paragraphs: 1–3 sentences; one idea per paragraph.
- Match the tone calibration in voice-guide (home = concise, present-tense; about = grounded, philosophical).

## File locations

| Target | Path |
|--------|------|
| Home copy | `content/locales/<locale>/site/home.json` |
| About copy | `content/locales/<locale>/site/about.json` |
| Writings (shared) | `content/writing/*.mdx` |
| Projects (shared) | `content/projects/*.mdx` |
| Voice guide | `.agents/skills/website-content/references/voice-guide.md` |
| Page structure | `.agents/skills/website-content/references/page-patterns.md` |

## After updating

- If the user asked for a single locale, confirm which locale was updated.
- If multiple locales were updated, list them and note any strings left in the default locale because translation was not requested.
- Do not run the content-translation skill for these JSON files; that skill is for MDX writing and project entries only.
