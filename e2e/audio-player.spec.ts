import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import uiEn from "../content/locales/en/site/ui.json";

const base = "/en";
const listenUi = uiEn.listen;

// Writing slug that has audio in the manifest / public folder
const writingWithAudio = "static-first";
const writingUrl = `${base}/writing/${writingWithAudio}`;

// Audio assets are in .gitignore; in CI they are absent, so the Listen button is not rendered.
// Skip these tests when audio files are not present (e.g. run audio:generate locally to enable).
const publicDir = path.join(process.cwd(), "public", "audio");
const hasWritingAudio = fs.existsSync(path.join(publicDir, "en", "writing", `${writingWithAudio}.mp3`));
const hasProjectAudio = fs.existsSync(path.join(publicDir, "en", "projects", "env-from-example.mp3"));

test.describe("Audio player", () => {
  test.beforeEach(() => {
    test.skip(!hasWritingAudio, "public/audio not present (gitignored); run audio:generate locally");
  });

  test("writing page with audio shows Listen trigger", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
  });

  test("clicking Listen opens player and shows controls", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();

    // Trigger label switches to "Hide player"
    await expect(page.getByRole("button", { name: listenUi.hideLabel })).toBeVisible();

    // Player container has Play button and progress (exact to avoid matching "Playback speed, 1×")
    const playButton = page.getByRole("button", { name: listenUi.playLabel, exact: true });
    await expect(playButton).toBeVisible();
    await expect(page.getByRole("slider", { name: listenUi.progressAriaLabel })).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(listenUi.speedMenuAriaLabel) })).toBeVisible();
  });

  test("player shows loading then ready with Play button", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();

    // Eventually in-page Play button is available (audio loaded)
    const playButton = page.getByRole("button", { name: listenUi.playLabel, exact: true });
    await expect(playButton).toBeVisible({ timeout: 15000 });
  });

  test("clicking Hide player collapses player", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();
    await expect(page.getByRole("button", { name: listenUi.hideLabel })).toBeVisible();
    const playButton = page.getByRole("button", { name: listenUi.playLabel, exact: true });
    await expect(playButton).toBeVisible({ timeout: 15000 });

    const hideButton = page.getByRole("button", { name: listenUi.hideLabel });
    await hideButton.click();

    // Listen trigger is visible again; in-page player is hidden
    await expect(page.getByRole("button", { name: listenUi.ariaLabel })).toBeVisible();
    await expect(playButton).not.toBeVisible();
  });

  test("play and pause toggle button label", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();

    const playButton = page.getByRole("button", { name: listenUi.playLabel, exact: true });
    await expect(playButton).toBeVisible({ timeout: 15000 });
    await playButton.click();

    // After play, pause button is shown
    const pauseButton = page.getByRole("button", { name: listenUi.pauseLabel, exact: true });
    await expect(pauseButton).toBeVisible({ timeout: 3000 });
    await pauseButton.click();

    // After pause, play button is shown again
    await expect(playButton).toBeVisible({ timeout: 2000 });
  });

  test("speed button cycles through speeds", async ({ page }) => {
    await page.goto(writingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();

    await expect(page.getByRole("button", { name: listenUi.playLabel, exact: true })).toBeVisible({
      timeout: 15000,
    });

    const speedButton = page.getByRole("button", { name: new RegExp(listenUi.speedMenuAriaLabel) });
    await expect(speedButton).toBeVisible();
    await expect(speedButton).toContainText("×");
  });
});

test.describe("Audio player – project page", () => {
  test.beforeEach(() => {
    test.skip(!hasProjectAudio, "public/audio not present (gitignored); run audio:generate locally");
  });

  // Project with audio (from manifest)
  const projectWithAudio = "env-from-example";
  const projectUrl = `${base}/projects/${projectWithAudio}`;

  test("project page with audio shows Listen trigger", async ({ page }) => {
    await page.goto(projectUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
  });

  test("project page Listen opens player with controls", async ({ page }) => {
    await page.goto(projectUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
    await listenTrigger.click();

    await expect(page.getByRole("button", { name: listenUi.hideLabel })).toBeVisible();
    await expect(page.getByRole("button", { name: listenUi.playLabel, exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("slider", { name: listenUi.progressAriaLabel })).toBeVisible();
  });
});
