import { QueryClient } from "@tanstack/react-query";
import { toApiError } from "@/shared/api/http";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => toApiError(error).isTransient && failureCount < 2,
    },
  },
});
