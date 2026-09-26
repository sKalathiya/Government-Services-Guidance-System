import type {
  AuthenticatedUser,
  LoginInput,
  PasswordChangeInput,
  RegisterInput,
} from "../types/auth.types";
import { apiGet, apiPatch, apiPost } from "./client";

export async function register(
  registerInput: RegisterInput,
  signal?: AbortSignal,
): Promise<AuthenticatedUser> {
  return await apiPost("/auth/register", registerInput, { signal });
}

export async function login(
  loginInput: LoginInput,
  signal?: AbortSignal,
): Promise<AuthenticatedUser> {
  return await apiPost("/auth/login", loginInput, { signal });
}

export async function logout(
  signal?: AbortSignal,
): Promise<{ message: string }> {
  return await apiPost("/auth/logout", undefined, { signal });
}

export async function getAuthenticatedUser(
  signal?: AbortSignal,
): Promise<AuthenticatedUser> {
  return await apiGet("/auth/me", { signal });
}

export async function changePassword(
  passwordChangeInput: PasswordChangeInput,
  signal?: AbortSignal,
): Promise<{ message: string }> {
  return await apiPatch<{ message: string }, PasswordChangeInput>(
    "/auth/password",
    passwordChangeInput,
    { signal },
  );
}
