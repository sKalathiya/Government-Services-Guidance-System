import type {
  ServiceFilterParameters,
  ServiceListItem,
} from "../types/service.types";
import { getServiceList } from "../api/services";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ServiceSearchForm } from "../features/services/components/ServiceSearchForm";
import { ServiceResults } from "../features/services/components/ServiceResults";

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedFilter: ServiceFilterParameters = {
    q: searchParams.get("q")?.trim() ?? "",
    jurisdiction: searchParams.get("jurisdiction")?.trim().toUpperCase() ?? "",
  };

  const { data, isPending, isFetching, isError } = useQuery<ServiceListItem[]>({
    queryKey: ["services", appliedFilter],
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
    <main>
      <h1>Services</h1>
      {isError && <p role="alert">Failed to fetch services!</p>}

      <ServiceSearchForm
        initialFilters={appliedFilter}
        isFetching={isFetching}
        onSubmit={onSubmit}
        key={searchParams.toString()}
      />

      {!isPending && !isError && <ServiceResults serviceList={serviceList} />}
    </main>
  );
}
