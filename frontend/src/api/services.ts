import type {
  ServiceDetail,
  ServiceFilterParameters,
  ServiceListItem,
} from "../types/service.types";
import { apiGet } from "./client";

export async function getServiceList(
  filters: ServiceFilterParameters = {},
  signal?: AbortSignal,
): Promise<ServiceListItem[]> {
  const path = "/services";
  const queryParams = new URLSearchParams();
  const q = filters.q?.trim();
  const jurisdiction = filters.jurisdiction?.trim();

  if (q) queryParams.set("q", q);
  if (jurisdiction) queryParams.set("jurisdiction", jurisdiction);

  return await apiGet<ServiceListItem[]>(path, { queryParams, signal });
}

export async function getServiceById(
  id: string,
  signal?: AbortSignal,
): Promise<ServiceDetail> {
  const path = "/services/" + encodeURIComponent(id);
  return await apiGet<ServiceDetail>(path, { signal });
}
