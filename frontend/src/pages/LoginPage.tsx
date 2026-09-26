import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginForm } from "../features/auth/components/LoginForm";

import type { LoginInput } from "../types/auth.types";
import { login } from "../api/auth";
import { getAuthKey } from "../features/auth/queries/auth.queryKeys";
import { ApiError } from "../api/client";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess(data) {
      queryClient.setQueryData(getAuthKey(), data);
      navigate("/services");
    },
  });
  const handleSubmit = (data: LoginInput) => {
    mutate(data);
  };
  const errorMessage =
    error instanceof Error ? loginErrorMessage(error) : undefined;

  return (
    <section
      aria-labelledby="login-heading"
      className="mx-auto w-full max-w-md"
    >
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div
          aria-hidden="true"
          className="h-1.5 bg-linear-to-r from-brand via-accent to-highlight"
        />
        <div className="px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Account
          </p>
          <h1
            id="login-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-ink"
          >
            Log in
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use your GovGuide account to save services and return to them later.
          </p>
          <div className="mt-8">
            <LoginForm
              onSubmit={handleSubmit}
              isPending={isPending}
              errorMessage={isPending ? undefined : errorMessage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function loginErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    return "Invalid email or password.";
  }
  return "We could not sign you in. Please try again.";
}
