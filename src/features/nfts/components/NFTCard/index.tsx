import { Link } from "@tanstack/react-router";
import { Icon } from "@/shared/components/Icon";
import type { EthString } from "@/shared/lib/eth";
import { formatEth } from "@/shared/lib/eth";

export interface NFTCardProps {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly price: EthString;
  readonly oldPrice?: EthString;
  readonly badge?: string;
  readonly image: string;
  readonly collection: string;
  readonly network: string;
  readonly decimalSeparator?: string;
}

export function NFTCard({ slug, name, price, oldPrice, badge, image, decimalSeparator }: NFTCardProps) {
  return (
    <Link
      to="/nft/$nftSlug"
      params={{ nftSlug: slug }}
      className="flex flex-col gap-3 group cursor-pointer"
      aria-label={`Ver detalhes de ${name}`}
    >
      <div className="relative aspect-square bg-card p-2.5">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
            <Icon name="verified" className="w-3 h-3" />
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h4 className="font-mono text-base font-normal leading-4 text-foreground">{name}</h4>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold leading-4 text-primary">{formatEth(price, 2, decimalSeparator)} ETH</span>
          {oldPrice && (
            <span className="font-mono text-lg font-normal leading-4 text-secondary">{formatEth(oldPrice, 2, decimalSeparator)} ETH</span>
          )}
        </div>
      </div>
    </Link>
  );
}
