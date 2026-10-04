import { useQuery } from "@tanstack/react-query";
import { getNftReviews } from "@/infrastructure/http";

export const useNftReviews = (nftId: string, limit = 3) =>
  useQuery({
    queryKey: ["nft-reviews", nftId, limit],
    queryFn: ({ signal }) => getNftReviews(nftId, limit, signal),
  });
