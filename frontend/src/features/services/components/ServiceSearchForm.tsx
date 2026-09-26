import type { ServiceFilterParameters } from "../../../types/service.types";
import { useForm } from "react-hook-form";

export type ServiceSearchFormProps = {
  initialFilters: ServiceFilterParameters;
  isFetching: boolean;
  onSubmit: (serviceFilter: ServiceFilterParameters) => void;
};

const controlClasses =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-focus focus:ring-2 focus:ring-focus/20";

export function ServiceSearchForm({
  initialFilters,
  isFetching,
  onSubmit,
}: ServiceSearchFormProps) {
  const form = useForm<ServiceFilterParameters>({
    defaultValues: initialFilters,
  });

  const handleFormSubmit = (data: ServiceFilterParameters) => {
    const nextSearchParams: ServiceFilterParameters = {};
    const q = data.q?.trim();
    const jurisdiction = data.jurisdiction?.trim().toUpperCase();
    if (q) nextSearchParams.q = q;
    if (jurisdiction) nextSearchParams.jurisdiction = jurisdiction;
    onSubmit(nextSearchParams);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      role="search"
      aria-label="Filter government services"
      className="grid gap-5 rounded-card border border-brand/10 bg-linear-to-br from-brand-soft via-surface to-accent-soft p-4 shadow-card sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.45fr)_auto] lg:items-end"
    >
      <div className="space-y-2">
        <label htmlFor="q" className="block text-sm font-semibold text-ink">
          Service name
        </label>

        <input
          id="q"
          type="search"
          {...form.register("q")}
          className={controlClasses}
          placeholder="For example, pension or ration card"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="jurisdiction"
          className="block text-sm font-semibold text-ink"
        >
          Jurisdiction
        </label>

        <select
          id="jurisdiction"
          {...form.register("jurisdiction")}
          className={controlClasses}
        >
          <option value="">All jurisdictions</option>
          <option value="GUJARAT">Gujarat</option>
          <option value="CENTRAL">Central Government</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isFetching}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        Search
      </button>
    </form>
  );
}
