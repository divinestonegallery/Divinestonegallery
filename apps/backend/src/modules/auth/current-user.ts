import { createClerkClient } from "@clerk/backend";
import { getClerkConfiguration } from "./config";
import { profileFromBackendUser, syncClerkIdentity } from "./clerk-sync";

export async function synchronizeCurrentClerkUser(clerkUserId: string) {
  const configuration = getClerkConfiguration();
  if (!configuration) throw new Error("Clerk server configuration is unavailable.");

  const clerk = createClerkClient({
    publishableKey: configuration.publishableKey,
    secretKey: configuration.secretKey,
  });
  const clerkUser = await clerk.users.getUser(clerkUserId);
  return syncClerkIdentity(profileFromBackendUser(clerkUser));
}
