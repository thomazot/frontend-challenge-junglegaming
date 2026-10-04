import type { Nft } from "@/shared/api/contracts";
import { NFTCard } from "@/features/nfts/components/NFTCard";

export { CatalogGridSkeleton } from "./CatalogGridSkeleton";

export function CatalogGrid({ items }: { items: Nft[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Nenhum NFT encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {items.map(({ id, slug, name, price, oldPrice, badge, image }) => (
        <NFTCard key={id} slug={slug} name={name} price={price} oldPrice={oldPrice} badge={badge} image={image} />
      ))}
    </div>
  );
}
