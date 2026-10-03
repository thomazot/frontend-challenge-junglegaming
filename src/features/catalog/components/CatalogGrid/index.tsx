import { NFTCard, NFTCardProps } from "@/features/nfts/components/NFTCard";

export function CatalogGrid({ items }: { items: NFTCardProps[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Nenhum NFT encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {items.map(item => (
        <NFTCard key={item.id} {...item} />
      ))}
    </div>
  );
}
