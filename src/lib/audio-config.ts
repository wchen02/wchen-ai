function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export type AudioSource = "local" | "r2" | "s3";

export function getAudioSource(): AudioSource {
  const source = process.env.AUDIO_SOURCE?.trim().toLowerCase();
  if (source === "r2") return "r2";
  if (source === "s3") return "s3";
  return "local";
}

export function isLocalAudioSource(): boolean {
  return getAudioSource() === "local";
}

export function getAudioPublicBaseUrl(): string | null {
  const source = getAudioSource();
  if (source === "local") {
    return "/audio";
  }
  const envPrefix = source === "s3" ? "S3" : "R2";
  const baseUrl = process.env[`${envPrefix}_AUDIO_PUBLIC_BASE_URL`]?.trim();
  return baseUrl ? trimTrailingSlash(baseUrl) : null;
}

export function getAudioManifestUrl(): string | null {
  const source = getAudioSource();
  if (source === "local") {
    return null;
  }
  const envPrefix = source === "s3" ? "S3" : "R2";
  const explicitUrl = process.env[`${envPrefix}_AUDIO_MANIFEST_URL`]?.trim();
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
