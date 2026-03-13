import { getLocaleContent } from "./content";
export type {
  AboutContent,
  FormsContent,
  HomeContent,
  SystemContent,
  UiContent,
} from "./schemas";

export function getHomeContent(locale?: string) {
  return getLocaleContent(locale).home;
}

export function getAboutContent(locale?: string) {
  return getLocaleContent(locale).about;
}

export function getUiContent(locale?: string) {
  return getLocaleContent(locale).ui;
}

export function getFormsContent(locale?: string) {
  return getLocaleContent(locale).forms;
}

export function getSystemContent(locale?: string) {
  return getLocaleContent(locale).system;
}
