import { env } from "cloudflare:workers";

export function getMediaBucket() {
  if (!env.MEDIA) {
    throw new Error(
      "Cloudflare R2 binding `MEDIA` is unavailable. Set the `r2` field in .openai/hosting.json to `MEDIA` before enabling media uploads.",
    );
  }

  return env.MEDIA;
}
