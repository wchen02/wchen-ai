import {
  getPreferredLocaleForRequest,
  localizePath,
  shouldRedirectBarePath,
} from "../src/lib/i18n";

/** No Workers bindings (KV, D1, etc.) for this entry. */
type Env = Record<string, never>;

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, next } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const url = new URL(request.url);

  // Legacy RSS URL: redirect to default-locale feed (static export does not run next.config redirects)
  if (url.pathname === "/rss.xml") {
    url.pathname = "/rss/en.xml";
    return Response.redirect(url.toString(), 302);
  }

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
