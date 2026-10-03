import type { NftListResponse } from "@/shared/api/contracts";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogPromoBanner } from "./CatalogPromoBanner";

interface CatalogSidebarProps {
  facets?: NftListResponse["facets"];
}

export function CatalogSidebar({ facets }: CatalogSidebarProps) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {facets && (
        <CatalogFilters collections={facets.collections} networks={facets.networks} priceRange={facets.priceRange} />
      )}
      <CatalogPromoBanner />
    </div>
  );
}
