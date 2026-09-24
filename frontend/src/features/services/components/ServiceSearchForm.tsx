import { useState } from "react";
import type { ServiceFilterParameters } from "../../../types/service.types";

export type ServiceSearchFormProps = {
  initialFilters: ServiceFilterParameters;
  isFetching: boolean;
  onSubmit: (serviceFilter: ServiceFilterParameters) => void;
};

export function ServiceSearchForm({
  initialFilters,
  isFetching,
  onSubmit,
}: ServiceSearchFormProps) {
  const [formData, setFormData] = useState(initialFilters);
  function handleFormSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextSearchParams: ServiceFilterParameters = {};
    const q = formData.q?.trim();
    const jurisdiction = formData.jurisdiction?.trim().toUpperCase();
    if (q) nextSearchParams.q = q;
    if (jurisdiction) nextSearchParams.jurisdiction = jurisdiction;
    onSubmit(nextSearchParams);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <label htmlFor="q"> Search Service Name </label>
      <input
        type="text"
        id="q"
        value={formData.q}
        onChange={(e) => setFormData({ ...formData, q: e.target.value })}
      />

      <label htmlFor="jurisdiction">Search Jurisdiction</label>
      <select
        value={formData.jurisdiction}
        id="jurisdiction"
        onChange={(e) =>
          setFormData({ ...formData, jurisdiction: e.target.value })
        }
      >
        <option value="">All jurisdictions</option>
        <option value="GUJARAT">Gujarat</option>
        <option value="CENTRAL">Central</option>
      </select>

      <button type="submit" disabled={isFetching}>
        Search
      </button>

      {isFetching && <p aria-live="polite">loading</p>}
    </form>
  );
}
