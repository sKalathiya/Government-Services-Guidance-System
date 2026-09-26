import { useQuery } from "@tanstack/react-query";
import { getServiceByIdQueryKey } from "../features/services/queries/serviceQueryKeys";
import { Link, useParams } from "react-router-dom";
import { getServiceById } from "../api/services";
import { ApiError } from "../api/client";
import { ServiceDetailContent } from "../features/services/components/ServiceDetailContent";

export function ServiceDetailsPage() {
  const params = useParams();
  const id = (params.id as string)?.trim();
  const { data, isPending, error, isError } = useQuery({
    queryKey: getServiceByIdQueryKey(id),
    queryFn: ({ signal }) => getServiceById(id, signal),
    staleTime: 30_000,
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });

  if (!id) {
    return (
      <section
        role="alert"
        className="mx-auto max-w-xl rounded-card border border-danger/20 bg-danger/5 px-6 py-10 text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-danger">
          Invalid address
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          This service link is incomplete
        </h1>

        <p className="mt-3 leading-7 text-muted">
          Return to the services page and choose a valid government service.
        </p>

        <Link
          to="/services"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Browse services
        </Link>
      </section>
    );
  }

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Loading service details"
        className="space-y-6 motion-safe:animate-pulse"
      >
        <div className="h-4 w-32 rounded bg-line" />

        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="h-6 w-28 rounded-full bg-brand-soft" />
          <div className="mt-5 h-10 max-w-xl rounded bg-line" />
          <div className="mt-4 h-5 max-w-2xl rounded bg-line" />
          <div className="mt-2 h-5 max-w-lg rounded bg-line" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-56 rounded-card bg-line" />
          <div className="h-56 rounded-card bg-line" />
        </div>

        <span className="sr-only">Loading service details</span>
      </div>
    );
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;

    return (
      <section
        role="alert"
        className="mx-auto max-w-xl rounded-card border border-line bg-surface px-6 py-10 text-center shadow-card"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-danger">
          {isNotFound ? "Service unavailable" : "Request failed"}
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          {isNotFound
            ? "We could not find this service"
            : "We could not load the service"}
        </h1>

        <p className="mt-3 leading-7 text-muted">
          {isNotFound
            ? "The service may have been removed or the link may be outdated."
            : "Please try again later or return to the services list."}
        </p>

        <Link
          to="/services"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Back to services
        </Link>
      </section>
    );
  }

  return <ServiceDetailContent service={data} />;
}
