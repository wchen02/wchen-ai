import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import uiEn from "../content/locales/en/site/ui.json";

const base = "/en";
const listenUi = uiEn.listen;

// Writing slug that has audio in the manifest / public folder
const writingWithAudio = "static-first";
const writingUrl = `${base}/writing/${writingWithAudio}`;

// Playwright serves the static export from out/, so skip unless the served audio
// asset exists there. public/audio can be newer than out/ if build has not rerun.
const servedAudioDir = path.join(process.cwd(), "out", "audio");
const hasWritingAudio = fs.existsSync(path.join(servedAudioDir, "en", "writing", `${writingWithAudio}.mp3`));
const hasProjectAudio = fs.existsSync(path.join(servedAudioDir, "en", "projects", "env-from-example.mp3"));
const investingWithAudio = "public-portfolio-journal";
const investingUrl = `${base}/investing/${investingWithAudio}`;
const hasInvestingAudio = fs.existsSync(path.join(servedAudioDir, "en", "investing", `${investingWithAudio}.mp3`));

test.describe("Audio player", () => {
  test.beforeEach(() => {
    test.skip(!hasWritingAudio, "out/audio not present; run audio:generate and rebuild locally");
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
    test.skip(!hasProjectAudio, "out/audio not present; run audio:generate and rebuild locally");
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

test.describe("Audio player – investing page", () => {
  test.beforeEach(() => {
    test.skip(!hasInvestingAudio, "out/audio not present; run audio:generate and rebuild locally");
  });

  test("investing page with audio shows Listen trigger", async ({ page }) => {
    await page.goto(investingUrl);
    const listenTrigger = page.getByRole("button", { name: listenUi.ariaLabel });
    await expect(listenTrigger).toBeVisible({ timeout: 10000 });
  });
});
