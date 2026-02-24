# Page Patterns & Component Reference

Layout and component patterns for each page of wchen.ai.

## Global Patterns

- **Max width**: `max-w-3xl` (all pages)
- **Padding**: `px-6 py-12 md:py-24`
- **Section spacing**: `space-y-16` between top-level sections, `space-y-6` within
- **Section headings**: H2 with `border-b border-gray-200 dark:border-gray-800 pb-2`
- **Prose blocks**: `prose dark:prose-invert` with `text-gray-600 dark:text-gray-400 leading-relaxed`
- **Accent color**: Emerald (`emerald-600` light / `emerald-400` dark)
- **Font**: Inter via `next/font/google`

---

## Homepage (`src/app/page.tsx`)

### Section order (priority-driven)
1. **Hero** — Name, "Founder & Builder", current exploration statement, link to about
2. **Current Focus & Problems** — What Wilson is obsessed with right now
3. **Selected Work** — Top 3 projects (featured-first), link to all
4. **Recent Thinking** — Top 3 writings (featured-first), link to all
5. **Activity** — GitHub contribution graph
6. **Contact** — "Let's collaborate" + ContactForm

### Hero copy structure
- H1: "Wilson Chen"
- Subtitle: "Founder & Builder"
- Two short paragraphs: (1) what he's exploring, (2) primary focus area
- Link: "More about me & my philosophy →"

### Current Focus copy structure
- Two paragraphs max
- First paragraph: the core problem he's obsessed with
- Second paragraph: his thesis on where the industry is heading

---

## About Page (`src/app/about/page.tsx`)

### Section order
1. **Header** — "About" + intro paragraph
2. **Philosophy** — 3 paragraphs on core beliefs
3. **Interests & Expertise** — 4 cards in 2x2 grid (title + description)
4. **Background** — 3 paragraphs on career arc
5. **Principles I Build By** — 3 items with principle + detail
6. **ReachOutCTA**

### Interest card structure
Each card: `p-5 rounded-xl bg-gray-50 dark:bg-neutral-900 border`
- H3: Bold topic name (e.g. "Context-Aware Agents")
- Body: `text-sm`, 1-2 sentences describing the interest

### Principle item structure
Each item: emerald dot + bold principle + supporting detail
- Principle: 2-5 words, imperative ("Ship, then refine")
- Detail: 1 sentence expanding the principle

---

## Writing Index (`src/app/writing/page.tsx`)

- Groups entries by theme
- Theme headers as navigation anchors
- WritingCard: title, date, reading time, theme badge, featured styling

---

## Writing Detail (`src/app/writing/[slug]/page.tsx`)

1. Back link: "← Back to all writing"
2. Header: title, date, reading time, theme, tags
3. MDX body: `prose dark:prose-invert prose-emerald max-w-none`
4. ReachOutCTA

---

## Projects Index (`src/app/projects/page.tsx`)

- ProjectCard list
- Cards include: title, date, status, type badges, motivation excerpt, links

---

## Project Detail (`src/app/projects/[slug]/page.tsx`)

1. Back link: "← Back to all projects"
2. Header: title, date, type badges, links
3. Narrative highlight box (`bg-gray-50 dark:bg-neutral-900 rounded-xl`):
   - "The Motivation" (from frontmatter)
   - "The Problem" (from frontmatter)
   - "Key Learnings" (from frontmatter, optional)
4. MDX body
5. ReachOutCTA

---

## ReachOutCTA Component

Placed at the bottom of About, Writing detail, and Project detail pages.
- Heading: "Interested in discussing this further?"
- Body: "I'm always open to connecting with fellow builders and founders."
- Button: "Start a conversation" → links to `/#contact`
