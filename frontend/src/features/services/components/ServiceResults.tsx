import { Link } from "react-router-dom";
import type { ServiceListItem } from "../../../types/service.types";

export type ServiceResultsProps = {
  serviceList: ServiceListItem[];
};

export function ServiceResults({ serviceList }: ServiceResultsProps) {
  if (serviceList.length === 0) {
    return (
      <div
        role="status"
        className="rounded-card border border-dashed border-line bg-surface/70 px-6 py-10 text-center"
      >
        <h2 className="text-lg font-semibold text-ink">No services found</h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Try a different service name or select another jurisdiction.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="space-y-4">
      <div className="space-y-1">
        <h2
          id="results-heading"
          className="text-xl font-bold tracking-tight text-ink"
        >
          Available services
        </h2>

        <p aria-live="polite" className="text-sm text-muted">
          {serviceList.length}{" "}
          {serviceList.length === 1 ? "service" : "services"} found
        </p>
      </div>

      <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
        {serviceList.map((service) => (
          <li key={service.id} className="h-full">
            <Link
              to={`/services/${service.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-card"
            >
              <div
                aria-hidden="true"
                className="h-1.5 bg-linear-to-r from-brand via-accent to-highlight"
              />
              <span className="flex h-full flex-col p-5">
              <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                {service.jurisdiction.name}
              </span>

              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand">
                {service.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                View eligibility, required documents, fees, and application
                steps.
              </p>

              <span className="mt-auto pt-5 text-sm font-semibold text-brand">
                View guidance <span aria-hidden="true">→</span>
              </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
