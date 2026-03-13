# Comments (writings & projects)

This template can show a comment section on writing and project pages using [Giscus](https://giscus.app): comments are GitHub Discussions embedded via a script. There is no database or API to run—the widget talks to GitHub directly.

If you don’t configure Giscus, the comments section is simply not shown. No errors.

## First-time setup

### 1. Choose a GitHub repo for discussions

Use a **public** repo. It can be the same repo as this site or a separate one (e.g. `your-username/your-blog-comments`).

### 2. Enable Discussions

In the repo: **Settings** → **General** → scroll to **Discussions** → check **Discussions**, then **Save**.

### 3. Install the Giscus app

The widget needs the [Giscus GitHub App](https://github.com/apps/giscus) to create discussions when someone opens a new page.

- Open [github.com/apps/giscus](https://github.com/apps/giscus) → **Install**.
- Choose “Only select repositories” and pick the repo from step 1 → **Install**.

### 4. Get your config from giscus.app

- Go to [giscus.app](https://giscus.app).
- Enter your **repository** (e.g. `owner/repo`).
- Pick a **Discussion category** (e.g. “Comments” or “General”). Create one in the repo’s Discussions → **New category** if needed.
- Leave other options as you like, then click **Enable giscus** (or use the defaults).
- The page will show an embed code with `data-repo`, `data-repo-id`, `data-category`, and `data-category-id`. Copy those values.

### 5. Set environment variables

Add these to your `.env` (or your host’s environment). Use the values from the giscus.app snippet:

```bash
# Comments (Giscus). Omit to hide the comments section.
GISCUS_REPO=owner/repo
GISCUS_REPO_ID=R_kgDO...
GISCUS_CATEGORY_ID=DIC_kwDO...
# Optional; shown in the embed (e.g. "Comments" or "General")
# GISCUS_CATEGORY=Comments
```

See [.env.example](../.env.example) for a template.

### 6. Build and deploy

Run your usual build. The comments section will appear on each writing and project page. Commenters must be signed in to GitHub to post.

## How it works

- **Discussion title in GitHub**: Each page gets a clear title so you can see which article or project the thread is for:
  - Writings: `Writing: <article title> (<locale>)`
  - Projects: `Project: <project title> (<locale>)`
- **Theme**: The widget follows the visitor’s system light/dark preference.
- **Threading**: GitHub Discussions allow one level of replies (reply to a comment).

## Local development

Run `pnpm run dev`. If the Giscus env vars are set, the widget loads and uses your repo’s Discussions. If they are not set, the comments section does not render.
