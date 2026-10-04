import type { Nft, NftListParams, NftListResponse, NftReviewsResponse } from "@/shared/api/contracts";
import { nftListResponseSchema, nftSchema } from "@/shared/api/schemas";
import { ApiError, http } from "@/shared/api/http";

/** The mock accepts arrays as CSV; axios would otherwise emit `key[]=` entries the API rejects. */
const toListSearchParams = (params: NftListParams): URLSearchParams => {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.collection?.length) search.set("collection", params.collection.join(","));
  if (params.network?.length) search.set("network", params.network.join(","));
  if (params.minPrice) search.set("minPrice", params.minPrice);
  if (params.maxPrice) search.set("maxPrice", params.maxPrice);
  if (params.sort) search.set("sort", params.sort);
  if (params.tab && params.tab !== "todos") search.set("tab", params.tab);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  return search;
};

export const listNfts = async (params: NftListParams = {}, signal?: AbortSignal): Promise<NftListResponse> => {
  const { data } = await http.get<unknown>("/nfts", { params: toListSearchParams(params), signal });
  const result = nftListResponseSchema.safeParse(data);
  if (!result.success) throw new ApiError("UNKNOWN", "Resposta do catálogo inválida", 502);
  return result.data;
};

export const getNft = async (idOrSlug: string, signal?: AbortSignal): Promise<Nft> => {
  const { data } = await http.get<unknown>(`/nfts/${idOrSlug}`, { signal });
  const result = nftSchema.safeParse(data);
  if (!result.success) throw new ApiError("UNKNOWN", "Resposta do NFT inválida", 502);
  return result.data;
};

export const getNftReviews = async (
  idOrSlug: string,
  limit = 3,
  signal?: AbortSignal,
): Promise<NftReviewsResponse> => {
  const { data } = await http.get<NftReviewsResponse>(`/nfts/${idOrSlug}/reviews`, {
    params: { limit },
    signal,
  });
  return data;
};
