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
    onSuccess: (nftIds) => {
      queryClient.setQueryData(["favorites"], nftIds);
      queryClient.setQueryData(["nft-favorite", nftId], nftIds.includes(nftId));
      onError();
    },
    onError: (error) => {
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
