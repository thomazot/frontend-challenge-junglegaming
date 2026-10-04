import { http } from "@/shared/api/http";

interface FavoritesResponse {
  nftIds: string[];
}

export const getFavoriteStatus = async (nftId: string, signal?: AbortSignal): Promise<boolean> => {
  const { data } = await http.get<{ isFavorite: boolean }>(`/nfts/${nftId}/favorite`, { signal });
  return data.isFavorite;
};

export const listFavorites = async (signal?: AbortSignal): Promise<string[]> => {
  const { data } = await http.get<FavoritesResponse>("/favorites", { signal });
  return data.nftIds;
};

export const addFavorite = async (nftId: string): Promise<string[]> => {
  const { data } = await http.put<FavoritesResponse>(`/favorites/${nftId}`);
  return data.nftIds;
};

export const removeFavorite = async (nftId: string): Promise<string[]> => {
  const { data } = await http.delete<FavoritesResponse>(`/favorites/${nftId}`);
  return data.nftIds;
};
