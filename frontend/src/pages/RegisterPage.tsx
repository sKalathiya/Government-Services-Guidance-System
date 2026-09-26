import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { ApiError } from "../api/client";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import type { RegisterInput } from "../types/auth.types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess() {
      navigate("/login");
    },
  });
  const errorMessage =
    !isPending && error instanceof Error
      ? registerErrorMessage(error)
      : undefined;

  return (
    <section
      aria-labelledby="register-heading"
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
            id="register-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-ink"
          >
            Create an account
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Save services and return to the guidance you need.
          </p>
          <div className="mt-8">
            <RegisterForm
              onSubmit={mutate}
              isPending={isPending}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function registerErrorMessage(error: Error) {
  if (error instanceof ApiError && error.status === 409) {
    return "An account with this email already exists.";
  }
  return "We could not create your account. Please try again.";
}
