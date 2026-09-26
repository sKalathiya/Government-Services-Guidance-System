import type {
  ServiceFilterParameters,
  ServiceListItem,
} from "../types/service.types";
import { getServiceList } from "../api/services";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ServiceSearchForm } from "../features/services/components/ServiceSearchForm";
import { ServiceResults } from "../features/services/components/ServiceResults";
import { ServiceResultsSkeleton } from "../features/services/components/ServiceResultsSkeleton";
import { getServiceListWithFiltersQueryKey } from "../features/services/queries/serviceQueryKeys";

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedFilter: ServiceFilterParameters = {
    q: searchParams.get("q")?.trim() ?? "",
    jurisdiction: searchParams.get("jurisdiction")?.trim().toUpperCase() ?? "",
  };

  const { data, isPending, isFetching, isError } = useQuery<ServiceListItem[]>({
    queryKey: getServiceListWithFiltersQueryKey(appliedFilter),
    queryFn: ({ signal }) => getServiceList(appliedFilter, signal),
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  const serviceList = data ?? [];

  const onSubmit = (nextSearchParams: ServiceFilterParameters) => {
    setSearchParams({
      ...nextSearchParams,
    });
  };

  return (
    <section aria-labelledby="services-heading" className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Government services
        </p>

        <h1
          id="services-heading"
          className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Find the service you need
        </h1>

        <p className="text-base leading-7 text-muted sm:text-lg">
          Search verified guidance by service name and jurisdiction.
        </p>
      </header>
      {isError && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
        >
          Failed to fetch services!
        </p>
      )}

      <ServiceSearchForm
        initialFilters={appliedFilter}
        isFetching={isFetching}
        onSubmit={onSubmit}
        key={searchParams.toString()}
      />

      {isPending && !isError && <ServiceResultsSkeleton />}
      {!isPending && !isError && <ServiceResults serviceList={serviceList} />}
    </section>
  );
}
