import { verifyToken } from "@clerk/backend";
import { cookies } from "next/headers";
import { getAllowedAuthOrigins, getClerkConfiguration } from "./config";

export type GallerySession = {
  userId: string;
  sessionId: string | null;
};

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice(7).trim() || null;
}

function cookieToken(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === "__session") return decodeURIComponent(value.join("="));
  }

  return null;
}

async function verifySessionToken(token: string): Promise<GallerySession | null> {
  const configuration = getClerkConfiguration();
  if (!configuration) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: configuration.secretKey,
      jwtKey: configuration.jwtKey,
      authorizedParties: getAllowedAuthOrigins(),
    });

    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      sessionId: typeof payload.sid === "string" ? payload.sid : null,
    };
  } catch {
    return null;
  }
}

export async function getGallerySessionFromRequest(request: Request) {
  const token = bearerToken(request) ?? cookieToken(request.headers.get("cookie"));
  return token ? verifySessionToken(token) : null;
}

export async function getGallerySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  return token ? verifySessionToken(token) : null;
}

export function isGalleryAuthConfigured() {
  return Boolean(getClerkConfiguration());
}
