import {
  deleteProfileSchema,
  type DeleteProfileInput,
} from "../../../types/profile.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const controlClasses =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink shadow-sm outline-none transition focus:border-danger focus:ring-2 focus:ring-danger/20";

const dangerButtonClasses =
  "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export type DeleteProfileFormProps = {
  isPending: boolean;
  onSubmit: () => void;
  error: Error | null;
  emailConfirmation: string;
};

export function DeleteProfileForm({
  isPending,
  onSubmit,
  error,
  emailConfirmation,
}: DeleteProfileFormProps) {
  const form = useForm<DeleteProfileInput>({
    resolver: zodResolver(deleteProfileSchema),
    defaultValues: {
      emailConfirmation: "",
    },
  });
  const handleSubmit = (data: DeleteProfileInput) => {
    if (data.emailConfirmation !== emailConfirmation) {
      form.setError("emailConfirmation", { message: "Email does not match" });
    } else onSubmit();
  };
  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink">
          Delete account
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Type your email to confirm. This cannot be undone.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-surface px-4 py-3 text-sm font-medium text-danger"
        >
          {error.message}
        </p>
      )}
      <div className="space-y-2">
        <label
          htmlFor="emailConfirmation"
          className="block text-sm font-semibold text-ink"
        >
          Email confirmation
        </label>
        <input
          type="email"
          id="emailConfirmation"
          className={controlClasses}
          {...form.register("emailConfirmation")}
        />
        {form.formState.errors.emailConfirmation && (
          <p className="text-sm text-danger">
            {form.formState.errors.emailConfirmation.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={isPending} className={dangerButtonClasses}>
        {isPending ? "Deleting..." : "Delete account"}
      </button>
    </form>
  );
}
