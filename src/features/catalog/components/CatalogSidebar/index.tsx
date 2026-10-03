import { useQuery } from "@tanstack/react-query";
import { Route } from "@/app/routes";
import { listNfts } from "@/infrastructure/http";
import type { NftListResponse } from "@/shared/api/contracts";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogPromoBanner } from "./CatalogPromoBanner";
import { CatalogSidebarSkeleton } from "./CatalogSidebarSkeleton";

export { CatalogSidebarSkeleton } from "./CatalogSidebarSkeleton";

interface CatalogSidebarProps {
  readonly facets?: NftListResponse["facets"];
  /** Called after a filter changes (e.g. to close the mobile sheet). */
  readonly onFilterSelect?: () => void;
}

/**
 * Catalog filters. When `facets` is not provided (e.g. inside the mobile Sheet,
 * outside the route component tree), fetches them from the API using the
 * current URL params so both stay in sync.
 */
export function CatalogSidebar({ facets, onFilterSelect }: CatalogSidebarProps) {
  const search = Route.useSearch();
  const { data, isPending } = useQuery({
    queryKey: ["nfts", search],
    queryFn: ({ signal }) => listNfts(search, signal),
    // Reuse the cached result from the home page; only fetch standalone (mobile sheet).
    enabled: !facets,
  });

  const resolved = facets ?? data?.facets;

  return (
    <div className="flex flex-col gap-8 w-full">
      {!resolved && isPending && <CatalogSidebarSkeleton />}
      {resolved && (
        <CatalogFilters
          collections={resolved.collections}
          networks={resolved.networks}
          priceRange={resolved.priceRange}
          onFilterSelect={onFilterSelect}
        />
      )}
      <CatalogPromoBanner />
    </div>
  );
}
