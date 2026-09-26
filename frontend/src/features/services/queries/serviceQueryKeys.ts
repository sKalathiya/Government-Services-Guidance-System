import type { ServiceFilterParameters } from "../../../types/service.types";

export const getServiceListWithFiltersQueryKey = (
  filters: ServiceFilterParameters,
) => ["services", "list", filters];
export const getServiceByIdQueryKey = (id: string) => [
  "services",
  "detail",
  id,
];
export const getServiceListQueryKey = () => ["services", "list"];
