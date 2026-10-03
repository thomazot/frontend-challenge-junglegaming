import { CatalogFilters } from "./CatalogFilters";
import { CatalogPromoBanner } from "./CatalogPromoBanner";

export function CatalogSidebar() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <CatalogFilters />
      <CatalogPromoBanner />
    </div>
  );
}
