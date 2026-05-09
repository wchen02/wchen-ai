type Env = {
  AUDIO_SOURCE?: string;
  R2_AUDIO_PUBLIC_BASE_URL?: string;
  S3_AUDIO_PUBLIC_BASE_URL?: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getAudioPublicBaseUrl(env: Env): string | null {
  const source = env.AUDIO_SOURCE?.trim().toLowerCase();
  const baseUrl = source === "s3" ? env.S3_AUDIO_PUBLIC_BASE_URL : env.R2_AUDIO_PUBLIC_BASE_URL;
  return baseUrl ? trimTrailingSlash(baseUrl.trim()) : null;
}

function resolvePathParam(pathParam: unknown): string {
  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }
  return typeof pathParam === "string" ? pathParam : "";
}

function copyResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const key of [
    "accept-ranges",
    "cache-control",
    "content-length",
    "content-range",
    "content-type",
    "etag",
    "last-modified",
  ]) {
    const value = source.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Access-Control-Allow-Origin", "*");
  return headers;
}

export async function onRequest(context: EventContext<Env, string, { path?: string | string[] }>) {
  const { request, env, params } = context;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const baseUrl = getAudioPublicBaseUrl(env);
  const pathParam = resolvePathParam(params.path);
  if (!baseUrl || !pathParam || pathParam.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`${baseUrl}/${pathParam.replace(/^\/+/, "")}`);
  targetUrl.search = requestUrl.search;

  const headers = new Headers();
  const range = request.headers.get("Range");
  if (range) headers.set("Range", range);

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyResponseHeaders(upstream.headers),
  });
}
