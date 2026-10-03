import type { Nft, NftListParams, NftListResponse } from "@/shared/api/contracts";
import { http } from "@/shared/api/http";

/** The mock accepts arrays as CSV; axios would otherwise emit `key[]=` entries the API rejects. */
const toListSearchParams = (params: NftListParams): URLSearchParams => {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.collection?.length) search.set("collection", params.collection.join(","));
  if (params.network?.length) search.set("network", params.network.join(","));
  if (params.minPrice) search.set("minPrice", params.minPrice);
  if (params.maxPrice) search.set("maxPrice", params.maxPrice);
  if (params.sort) search.set("sort", params.sort);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  return search;
};

export const listNfts = async (params: NftListParams = {}, signal?: AbortSignal): Promise<NftListResponse> => {
  const { data } = await http.get<NftListResponse>("/nfts", { params: toListSearchParams(params), signal });
  return data;
};

export const getNft = async (id: string, signal?: AbortSignal): Promise<Nft> => {
  const { data } = await http.get<Nft>(`/nfts/${id}`, { signal });
  return data;
};
