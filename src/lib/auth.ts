import { auth } from "@clerk/nextjs/server";

/**
 * Get the current user's ID, or null if not signed in.
 * Use this in API routes that can work for both signed-in and anonymous users.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication - throws an error if user is not signed in.
 * Use this in API routes that require authentication.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Create a standardized unauthorized response
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
