import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavoriteStatus, removeFavorite } from "@/infrastructure/http";
import { toApiError } from "@/shared/api/http";
import { Icon } from "@/shared/components/Icon";
import { Button } from "@/shared/ui/button";

interface NftFavoriteButtonProps {
  readonly nftId: string;
  readonly onError: (message?: string) => void;
  readonly className?: string;
  readonly compact?: boolean;
}

export function NftFavoriteButton({ nftId, onError, className, compact = false }: NftFavoriteButtonProps) {
  const queryClient = useQueryClient();
  const favoriteQuery = useQuery({
    queryKey: ["nft-favorite", nftId],
    queryFn: ({ signal }) => getFavoriteStatus(nftId, signal),
    retry: false,
  });
  const favoriteMutation = useMutation({
    mutationFn: (shouldFavorite: boolean) => (shouldFavorite ? addFavorite(nftId) : removeFavorite(nftId)),
    onMutate: async (shouldFavorite) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["favorites"] }),
        queryClient.cancelQueries({ queryKey: ["nft-favorite", nftId] }),
      ]);
      const previousFavorite = queryClient.getQueryData<boolean>(["nft-favorite", nftId]);
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites"]);
      queryClient.setQueryData(["nft-favorite", nftId], shouldFavorite);
      if (previousFavorites) {
        const nextFavorites = shouldFavorite
          ? [...new Set([...previousFavorites, nftId])]
          : previousFavorites.filter((favoriteId) => favoriteId !== nftId);
        queryClient.setQueryData(["favorites"], nextFavorites);
      }
      return { previousFavorite, previousFavorites };
    },
    onSuccess: (nftIds) => {
      queryClient.setQueryData(["favorites"], nftIds);
      queryClient.setQueryData(["nft-favorite", nftId], nftIds.includes(nftId));
      onError();
    },
    onError: (error, _shouldFavorite, context) => {
      if (context?.previousFavorite === undefined) {
        queryClient.removeQueries({ queryKey: ["nft-favorite", nftId], exact: true });
      } else {
        queryClient.setQueryData(["nft-favorite", nftId], context.previousFavorite);
      }
      if (context?.previousFavorites === undefined) {
        queryClient.removeQueries({ queryKey: ["favorites"], exact: true });
      } else {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
      const apiError = toApiError(error);
      onError(
        apiError.code === "UNAUTHENTICATED" || apiError.code === "SESSION_EXPIRED"
          ? "Entre na sua conta para favoritar este NFT."
          : apiError.message,
      );
    },
  });

  const favorited = favoriteQuery.data ?? false;

  useEffect(() => {
    if (favoriteQuery.error) onError(toApiError(favoriteQuery.error).message);
  }, [favoriteQuery.error, onError]);

  const toggleFavorite = () => {
    onError();
    favoriteMutation.mutate(!favorited);
  };

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      className={className}
      aria-label={favorited ? "Remover NFT dos favoritos" : "Favoritar NFT"}
      aria-pressed={favorited}
      disabled={favoriteMutation.isPending || favoriteQuery.isPending}
      onClick={toggleFavorite}
    >
      <Icon name={favorited ? "heart" : "heart-outline"} size={20} />
      {!compact && <span>{favorited ? "Favoritado" : "Favoritar"}</span>}
    </Button>
  );
}
