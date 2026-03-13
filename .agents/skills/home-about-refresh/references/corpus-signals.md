# Corpus Signals: Writings & Projects → Home & About

This reference defines what to extract from the content corpus and how it maps to homepage and about-page copy. Use it when running the home-about-refresh workflow.

## What to Read

| Source | Location | Prefer |
|--------|----------|--------|
| Writings | `content/writing/*.mdx`, `content/locales/<locale>/writing/*.mdx` | `featured: true`, most recent `publishDate` |
| Projects | `content/projects/*.mdx`, `content/locales/<locale>/projects/*.mdx` | `featured: true`, `status: active` or `in-progress` |

Read at least 3–5 recent or featured writings and 2–4 active/featured projects before proposing home/about changes. If the corpus is small, read all non-draft entries.

---

## From Writing Entries

| Extract | Where | Use for |
|---------|--------|---------|
| `theme` | Frontmatter | Recurring themes → expertise cards, current focus wording |
| `tags` | Frontmatter | Refine expertise areas, avoid stale tags in about |
| Key conviction / reframe | Body: opening, middle position, closing | philosophy.paragraphs, principles.items |
| Problem reframed | Body (first third) | currentFocus.paragraphs |
| Forward-looking statement | Body (last paragraph) | hero.paragraphs, currentFocus |

**Example**: A piece with theme "Developer Tools" and a closing line like "The best tools disappear" → candidate for philosophy or principles; "knowledge fragmentation" as a repeated problem → currentFocus.

---

## From Project Entries

| Extract | Where | Use for |
|---------|--------|---------|
| `motivation` | Frontmatter | hero.paragraphs (what they're building and why) |
| `problemAddressed` | Frontmatter | currentFocus, expertise card topics |
| `learnings` | Frontmatter | principles.items |
| `type` | Frontmatter | Wording for "building" (e.g. agents, apps, tools) |
| Recurring problem area | Across several projects | expertise.items, currentFocus.paragraphs |

**Example**: Multiple projects with "context-aware" or "developer experience" → ensure an expertise card and current focus line reflect that; a learning like "Ship, then refine" → principles.

---

## Mapping to home.json

| home.json block | Corpus signal |
|-----------------|----------------|
| **hero.intro** | Current role, company/product names, one line on what they build (from projects + about). |
| **hero.paragraphs** | What they're exploring now (themes from writings); primary focus (problem area from projects + writings). |
| **currentFocus.paragraphs** | Main problem they're obsessed with (repeated in writings/problemAddressed); thesis on where the industry or space is heading (from writing conclusions). |

Keep **selectedWork** / **recentThinking** section titles and descriptions generic unless the site owner asks to change them.

---

## Mapping to about.json

| about.json block | Corpus signal |
|------------------|----------------|
| **intro.description** | One sentence: who they are, what they build, where they sit (e.g. "intersection of AI and developer tools"). |
| **philosophy.paragraphs** | 3 paragraphs from convictions and reframes in writings; avoid generic statements that don't appear in the corpus. |
| **expertise.items** | 4 cards: titles from recurring themes (writing `theme`, project `problemAddressed`); descriptions from 1–2 sentences in those pieces. |
| **principles.items** | 3 items: principle phrase from writing conclusions or project `learnings`; detail in one sentence. |
| **background.paragraphs** | Only update if new roles/companies appear in the corpus or the user requests it; otherwise leave unchanged. |

---

## Synthesis Rules

1. **Prefer evidence over invention**: If the corpus doesn't support a claim, don't add it to home or about.
2. **Recurrence wins**: Themes and principles that appear in multiple writings or projects should be reflected first.
3. **Present over past**: Home and current focus should emphasize what they're doing now (recent writings, active projects).
4. **Consistency**: After updating, ensure hero + currentFocus + about intro tell a coherent story (same focus area, same positioning).
