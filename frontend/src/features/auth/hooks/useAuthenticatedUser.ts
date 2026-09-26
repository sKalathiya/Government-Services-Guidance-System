import { useQuery } from "@tanstack/react-query";
import { getAuthKey } from "../queries/auth.queryKeys";
import { getAuthenticatedUser } from "../../../api/auth";
import { ApiError } from "../../../api/client";

export default function useAuthenticatedUser() {
  return useQuery({
    queryKey: getAuthKey(),
    queryFn: ({ signal }) =>
      getAuthenticatedUser(signal).catch((error) => {
        const status = error instanceof ApiError && error.status;
        if (status === 401) return null;
        throw error;
      }),
    retry: (failureCount, error) => {
      const status = error instanceof ApiError && error.status;
      if (status === 401) return false;
      return failureCount < 1;
    },
    staleTime: 30_000,
  });
}
