const API_URL: string = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not set!");
}

type RequestOptions = {
  queryParams?: URLSearchParams;
  signal?: AbortSignal;
};

type ApiRequestOptions<TBody> = RequestOptions & {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  body?: TBody;
};

export function apiGet<TResponse>(
  path: string,
  options?: RequestOptions,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "GET",
    ...options,
  });
}

export function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return apiRequest<TResponse, TBody>(path, {
    method: "POST",
    body,
    ...options,
  });
}

export class ApiError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function apiDelete<TResponse>(
  path: string,
  options?: RequestOptions,
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: "DELETE",
    ...options,
  });
}

export function apiPatch<TResponse, TBody>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return apiRequest<TResponse, TBody>(path, {
    method: "PATCH",
    body,
    ...options,
  });
}

async function apiRequest<TResponse, TBody = undefined>(
  path: string,
  options: ApiRequestOptions<TBody>,
): Promise<TResponse> {
  const base = API_URL.replace(/\/$/, "");
  const url = new URL(`${base}${path}`, window.location.origin);
  options?.queryParams?.forEach((param, key) =>
    url.searchParams.set(key, param),
  );
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(url, {
    method: options.method,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers,
    credentials: "same-origin",
    signal: options?.signal,
  });

  if (!response.ok) {
    let message = "API request failed!";
    try {
      const errorBody = (await response.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(", ");
      } else if (typeof errorBody.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // Keep the safe fallback when the response is not JSON.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) {
    return undefined as TResponse;
  }
  return (await response.json()) as TResponse;
}
