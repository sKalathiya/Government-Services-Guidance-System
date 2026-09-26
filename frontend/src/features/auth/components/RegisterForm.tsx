import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { RegisterSchema, type RegisterInput } from "../../../types/auth.types";

export type RegisterFormProps = {
  onSubmit: (data: RegisterInput) => void;
  isPending: boolean;
  errorMessage?: string;
};

const controlClasses =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-focus focus:ring-2 focus:ring-focus/20 aria-invalid:border-danger";

export function RegisterForm({
  onSubmit,
  isPending,
  errorMessage,
}: RegisterFormProps) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {errorMessage && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
        >
          {errorMessage}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-ink">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          disabled={isPending}
          className={controlClasses}
          {...form.register("name")}
          aria-invalid={form.formState.errors.name ? "true" : "false"}
          aria-describedby={
            form.formState.errors.name ? "name-error" : undefined
          }
        />
        {form.formState.errors.name && (
          <p id="name-error" className="text-sm text-danger">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isPending}
          className={controlClasses}
          {...form.register("email")}
          aria-invalid={form.formState.errors.email ? "true" : "false"}
          aria-describedby={
            form.formState.errors.email ? "email-error" : undefined
          }
        />
        {form.formState.errors.email && (
          <p id="email-error" className="text-sm text-danger">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-ink"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={isPending}
          className={controlClasses}
          {...form.register("password")}
          aria-invalid={form.formState.errors.password ? "true" : "false"}
          aria-describedby={
            form.formState.errors.password ? "password-error" : undefined
          }
        />
        {form.formState.errors.password && (
          <p id="password-error" className="text-sm text-danger">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand hover:text-brand-strong"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
