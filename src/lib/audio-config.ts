function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export type AudioSource = "local" | "r2";

export function getAudioSource(): AudioSource {
  return process.env.AUDIO_SOURCE?.trim().toLowerCase() === "r2" ? "r2" : "local";
}

export function isLocalAudioSource(): boolean {
  return getAudioSource() === "local";
}

export function getAudioPublicBaseUrl(): string | null {
  if (isLocalAudioSource()) {
    return "/audio";
  }
  const baseUrl = process.env.R2_AUDIO_PUBLIC_BASE_URL?.trim();
  return baseUrl ? trimTrailingSlash(baseUrl) : null;
}

export function getAudioManifestUrl(): string | null {
  if (isLocalAudioSource()) {
    return null;
  }
  const explicitUrl = process.env.R2_AUDIO_MANIFEST_URL?.trim();
  if (explicitUrl) {
    return explicitUrl;
  }
  const baseUrl = getAudioPublicBaseUrl();
  return baseUrl ? `${baseUrl}/audio-manifest.json` : null;
}

export function getAudioAssetUrl(relativePath: string): string {
  const baseUrl = getAudioPublicBaseUrl();
  const normalizedPath = relativePath.replace(/^\/+/, "");
  if (!baseUrl) {
    return "";
  }
  return `${baseUrl}/${normalizedPath}`;
}
