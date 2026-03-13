import {
  getPreferredLocaleForRequest,
  localizePath,
  shouldRedirectBarePath,
} from "../src/lib/i18n";

interface Env {}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, next } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const url = new URL(request.url);
  if (!shouldRedirectBarePath(url.pathname)) {
    return next();
  }

  const preferredLocale = getPreferredLocaleForRequest({
    cookieHeader: request.headers.get("Cookie"),
    acceptLanguageHeader: request.headers.get("Accept-Language"),
  });

  url.pathname = localizePath(preferredLocale, url.pathname);
  return Response.redirect(url.toString(), 302);
}
