import type { FacetCount, Nft, NftListResponse } from "@/shared/api/contracts";
import { nftListParamsSchema } from "@/shared/api/schemas";
import { compareEth } from "@/shared/lib/eth";
import { currentScenario, mutateDb } from "../db";
import { ApiFailure, ok, parse, route } from "../server";

const DEFAULT_LIMIT = 9;

const countBy = (items: Nft[], pick: (nft: Nft) => string): FacetCount[] => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(pick(item), (counts.get(pick(item)) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

export const catalogHandlers = [
  route("get", "/api/nfts", (ctx) => {
    const raw: Record<string, string> = {};
    for (const key of new Set(ctx.url.searchParams.keys())) raw[key] = ctx.url.searchParams.getAll(key).join(",");
    const params = parse(nftListParamsSchema, raw);

    const all = currentScenario().behavior.emptyCatalog ? [] : ctx.db.nfts;
    const term = params.q?.toLocaleLowerCase("pt-BR");
    const matchesBase = (nft: Nft) =>
      (!term || [nft.name, nft.collection, nft.creator].some((field) => field.toLocaleLowerCase("pt-BR").includes(term))) &&
      (!params.minPrice || compareEth(nft.price, params.minPrice) >= 0) &&
      (!params.maxPrice || compareEth(nft.price, params.maxPrice) <= 0);

    const base = all.filter(matchesBase);
    const filtered = base.filter(
      (nft) =>
        (!params.collection?.length || params.collection.includes(nft.collection)) &&
        (!params.network?.length || params.network.includes(nft.network)),
    );

    const sort = params.sort ?? "recent";
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "price-asc") return compareEth(a.price, b.price) || a.id.localeCompare(b.id, "en", { numeric: true });
      if (sort === "price-desc") return compareEth(b.price, a.price) || a.id.localeCompare(b.id, "en", { numeric: true });
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id, "en", { numeric: true });
    });

    const limit = params.limit ?? DEFAULT_LIMIT;
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(params.page ?? 1, totalPages);
    const prices = ctx.db.nfts.map((nft) => nft.price).sort(compareEth);

    const body: NftListResponse = {
      data: sorted.slice((page - 1) * limit, page * limit),
      meta: { total, page, limit, totalPages },
      facets: {
        collections: countBy(base.filter((nft) => !params.network?.length || params.network.includes(nft.network)), (nft) => nft.collection),
        networks: countBy(base.filter((nft) => !params.collection?.length || params.collection.includes(nft.collection)), (nft) => nft.network),
        priceRange: { min: prices[0] ?? "0", max: prices[prices.length - 1] ?? "0" },
      },
    };
    return ok(body);
  }),

  route("get", "/api/nfts/:id", (ctx) => {
    const nft = ctx.db.nfts.find((candidate) => candidate.id === ctx.params.id);
    if (!nft) throw new ApiFailure(404, "NOT_FOUND", "NFT não encontrado");
    return ok(nft);
  }),

  route("get", "/api/favorites", (ctx) => ok({ nftIds: ctx.db.favorites[ctx.user.id] ?? [] }), { auth: true }),

  route("put", "/api/favorites/:id", (ctx) => {
    if (currentScenario().behavior.favoriteFails) throw new ApiFailure(500, "TRANSIENT", "Não foi possível favoritar");
    if (!ctx.db.nfts.some((nft) => nft.id === ctx.params.id)) throw new ApiFailure(404, "NOT_FOUND", "NFT não encontrado");
    const nftIds = mutateDb((db) => {
      const list = (db.favorites[ctx.user.id] ??= []);
      if (!list.includes(ctx.params.id)) list.push(ctx.params.id);
      return [...list];
    });
    return ok({ nftIds });
  }, { auth: true }),

  route("delete", "/api/favorites/:id", (ctx) => {
    if (currentScenario().behavior.favoriteFails) throw new ApiFailure(500, "TRANSIENT", "Não foi possível remover o favorito");
    const nftIds = mutateDb((db) => {
      db.favorites[ctx.user.id] = (db.favorites[ctx.user.id] ?? []).filter((id) => id !== ctx.params.id);
      return [...db.favorites[ctx.user.id]];
    });
    return ok({ nftIds });
  }, { auth: true }),
];
