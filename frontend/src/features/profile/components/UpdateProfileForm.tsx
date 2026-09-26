import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "../../../types/profile.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const controlClasses =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-focus focus:ring-2 focus:ring-focus/20";

const primaryButtonClasses =
  "inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:cursor-pointer hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60";

export type UpdateProfileFormProps = {
  initialValues: UpdateProfileInput;
  isPending: boolean;
  error: Error | null;
  onSubmit: (data: UpdateProfileInput) => void;
};

export function UpdateProfileForm({
  initialValues,
  isPending,
  error,
  onSubmit,
}: UpdateProfileFormProps) {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = (data: UpdateProfileInput) => {
    const { name, email } = data;
    const finalData: UpdateProfileInput = {};
    if (name && name.trim() !== "") {
      finalData.name = name.trim();
    }
    if (email && email.trim() !== "") {
      finalData.email = email.trim().toLowerCase();
    }
    onSubmit(finalData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <h2 className="text-lg font-bold tracking-tight text-ink">
        Update profile
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
        <label htmlFor="name" className="block text-sm font-semibold text-ink">
          Name
        </label>
        <input
          type="text"
          id="name"
          className={controlClasses}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-danger">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          type="email"
          id="email"
          className={controlClasses}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-danger">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className={primaryButtonClasses}
      >
        {isPending ? "Updating..." : "Update profile"}
      </button>
    </form>
  );
}
