import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toApiError } from "@/shared/api/http";
import type { LoginInput, RegisterInput, Session } from "@/shared/api/contracts";
import { getSession, login, logout, register } from "@/infrastructure/http/auth-api";
import { disconnectRealtime } from "@/infrastructure/socket/client";

export const sessionQueryKey = ["session"] as const;

const privateQueryKeys = [
  ["favorites"],
  ["nft-favorite"],
  ["profile"],
  ["wallets"],
  ["orders"],
  ["order"],
] as const;

const clearPrivateQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  for (const queryKey of privateQueryKeys) {
    queryClient.removeQueries({ queryKey });
  }
};

export const clearAuthenticatedCache = (queryClient: QueryClient) => {
  disconnectRealtime();
  clearPrivateQueries(queryClient);
  queryClient.setQueryData(sessionQueryKey, null);
  void queryClient.invalidateQueries({ queryKey: ["cart"] });
  void queryClient.invalidateQueries({ queryKey: ["nfts"] });
};

const cacheSession = async (
  queryClient: ReturnType<typeof useQueryClient>,
  session: Session,
) => {
  const previousSession = queryClient.getQueryData<Session | null>(sessionQueryKey);
  if (previousSession?.user.id !== session.user.id) {
    disconnectRealtime();
    clearPrivateQueries(queryClient);
  }
  queryClient.setQueryData(sessionQueryKey, session);
  await queryClient.invalidateQueries({ queryKey: ["cart"] });
};

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async ({ signal }) => {
      try {
        return await getSession(signal);
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.code === "UNAUTHENTICATED" || apiError.code === "SESSION_EXPIRED") {
          return null;
        }
        throw apiError;
      }
    },
    staleTime: 60_000,
    retry: (failureCount, error) => toApiError(error).isTransient && failureCount < 2,
    refetchOnWindowFocus: true,
  });
}

export function useAuthMutations() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (input: LoginInput) => login(input),
    gcTime: 0,
    onSuccess: (session) => cacheSession(queryClient, session),
  });

  const registerMutation = useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: (input: RegisterInput) => register(input),
    gcTime: 0,
    onSuccess: (session) => cacheSession(queryClient, session),
  });

  const logoutMutation = useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: logout,
    onSuccess: () => clearAuthenticatedCache(queryClient),
  });

  const performLogin = async (input: LoginInput) => {
    try {
      return await loginMutation.mutateAsync(input);
    } finally {
      loginMutation.reset();
    }
  };

  const performRegister = async (input: RegisterInput) => {
    try {
      return await registerMutation.mutateAsync(input);
    } finally {
      registerMutation.reset();
    }
  };

  const performLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      logoutMutation.reset();
    }
  };

  return {
    login: performLogin,
    register: performRegister,
    logout: performLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
