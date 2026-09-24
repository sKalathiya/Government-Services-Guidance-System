import type {
  ServiceFilterParameters,
  ServiceListItem,
} from "../types/service.types";

const API_URL: string = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not set!");
}

export async function getServiceList(
  filters: ServiceFilterParameters = {},
  signal?: AbortSignal,
): Promise<ServiceListItem[]> {
  const base = API_URL.replace(/\/$/, "");
  const url = new URL(`${base}/services`, window.location.origin);

  const q = filters.q?.trim();
  const jurisdiction = filters.jurisdiction?.trim();

  if (q) url.searchParams.set("q", q);
  if (jurisdiction) url.searchParams.set("jurisdiction", jurisdiction);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "same-origin",
    signal,
  });

  if (!response.ok) {
    throw new Error("Could not load services!");
  }

  return (await response.json()) as ServiceListItem[];
}
