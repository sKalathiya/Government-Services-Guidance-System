import type { PasswordChangeInput } from "../../../types/auth.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordChangeSchema } from "../../../types/auth.types";

const controlClasses =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink shadow-sm outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/20";

const primaryButtonClasses =
  "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60";
export type ChangePasswordFormProps = {
  isPending: boolean;
  onSubmit: (data: PasswordChangeInput) => void;
  error: Error | null;
};

export function ChangePasswordForm({
  isPending,
  onSubmit,
  error,
}: ChangePasswordFormProps) {
  const form = useForm<PasswordChangeInput>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleSubmit = async (data: PasswordChangeInput) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <h2 className="text-lg font-bold tracking-tight text-ink">
        Change password
      </h2>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
        >
          {error.message}
        </p>
      )}
      <div className="space-y-2">
        <label
          htmlFor="currentPassword"
          className="block text-sm font-semibold text-ink"
        >
          Current password
        </label>
        <input
          type="password"
          id="currentPassword"
          autoComplete="current-password"
          className={controlClasses}
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword && (
          <p className="text-sm text-danger">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="block text-sm font-semibold text-ink"
        >
          New password
        </label>
        <input
          type="password"
          id="newPassword"
          autoComplete="new-password"
          className={controlClasses}
          {...form.register("newPassword")}
        />
        {form.formState.errors.newPassword && (
          <p className="text-sm text-danger">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={isPending} className={primaryButtonClasses}>
        {isPending ? "Changing password..." : "Change password"}
      </button>
    </form>
  );
}
