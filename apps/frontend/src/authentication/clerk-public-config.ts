export function getClerkPublishableKey() {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || null;
}

export function isClerkConfigured() {
  return Boolean(getClerkPublishableKey());
}
