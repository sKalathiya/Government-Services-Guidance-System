import type { AuthenticatedUser } from "../types/auth.types";
import type { UpdateProfileInput } from "../types/profile.types";
import { apiDelete, apiPatch } from "./client";

export async function updateProfile(
  profile: UpdateProfileInput,
  signal?: AbortSignal,
): Promise<AuthenticatedUser> {
  return await apiPatch<AuthenticatedUser, UpdateProfileInput>(
    "/user/me",
    profile,
    {
      signal,
    },
  );
}

export async function deleteProfile(signal?: AbortSignal): Promise<void> {
  return await apiDelete<void>("/user/me", { signal });
}
