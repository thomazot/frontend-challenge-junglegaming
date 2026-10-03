import { Icon } from "@/shared/components/Icon";

export interface NFTCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  collection: string;
  network: string;
}

export function NFTCard({ name, price, oldPrice, badge, image }: NFTCardProps) {
  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <div className="relative aspect-square bg-card p-2.5">
        <img 
          src={image} 
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover rounded-[20px] group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
            <Icon name="verified" className="w-3 h-3" />
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h4 className="font-mono text-base font-normal leading-4 text-foreground">{name}</h4>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold leading-4 text-primary">{price.toFixed(2)} ETH</span>
          {oldPrice && (
            <span className="font-mono text-lg font-normal leading-4 text-[#B39463]">{oldPrice.toFixed(2)} ETH</span>
          )}
        </div>
      </div>
    </div>
  );
}
