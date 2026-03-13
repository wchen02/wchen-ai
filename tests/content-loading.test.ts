import path from "path";
import { describe, expect, it } from "vitest";
import { getLocaleContent } from "../src/lib/content";
import { resolveLocale, SUPPORTED_LOCALES } from "../src/lib/locales";
import {
  getAboutContent,
  getFormsContent,
  getHomeContent,
  getSystemContent,
  getUiContent,
} from "../src/lib/site-content";
import {
  getProjectBySlug,
  getProjects,
  getWritingBySlug,
  getWritings,
} from "../src/lib/mdx";
import { SITE_PROFILE } from "../src/lib/site-config";

describe("content loaders", () => {
  it("loads the default locale site content from content/locales", () => {
    expect(SITE_PROFILE.languageTag).toBe("en");
    expect(getHomeContent().hero.aboutLink.label).toBeTruthy();
    expect(getAboutContent().intro.title).toBeTruthy();
    expect(getUiContent().projects.readFullStoryLabel).toBeTruthy();
    expect(getFormsContent().contact.fields.email.label).toBeTruthy();
    expect(getSystemContent().newsletter.subscribeSuccess).toBeTruthy();
  });

  it("loads translated site content for supported locales", () => {
    expect(SUPPORTED_LOCALES).toContain("es");
    expect(SUPPORTED_LOCALES).toContain("zh");
    expect(resolveLocale("es-MX")).toBe("es");
    expect(resolveLocale("zh-CN")).toBe("zh");
    expect(getLocaleContent("es").profile.languageTag).toBe("es");
    expect(getLocaleContent("zh").profile.languageTag).toBe("zh");
    expect(getHomeContent("es").hero.aboutLink.label).toBeTruthy();
    expect(getHomeContent("zh").hero.aboutLink.label).toBeTruthy();
    expect(getAboutContent("es").intro.title).toBe("Sobre mi");
    expect(getAboutContent("zh").intro.title).toBe("关于");
    expect(getUiContent("es").languageSwitcher.label).toBe("Idioma");
    expect(getUiContent("zh").languageSwitcher.label).toBe("语言");
    expect(getFormsContent("es").contact.fields.email.label).toBe("Correo electronico");
    expect(getFormsContent("zh").contact.fields.email.label).toBe("邮箱");
    expect(getSystemContent("es").newsletter.subscribeSuccess).toContain("suscripcion");
    expect(getSystemContent("zh").newsletter.subscribeSuccess).toContain("确认订阅");
  });

  it("loads writing and project content from a non-default locale path", () => {
    const fixtureContentDir = path.resolve(__dirname, "./fixtures/content");

    const writings = getWritings("es", fixtureContentDir);
    const projects = getProjects("es", fixtureContentDir);

    expect(writings).toHaveLength(1);
    expect(writings[0].title).toBe("Hola desde pruebas");
    expect(getWritingBySlug("hola-desde-pruebas", "es", fixtureContentDir)?.title).toBe(
      "Hola desde pruebas"
    );

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe("Proyecto de prueba");
    expect(getProjectBySlug("proyecto-de-prueba", "es", fixtureContentDir)?.title).toBe(
      "Proyecto de prueba"
    );
  });
});
