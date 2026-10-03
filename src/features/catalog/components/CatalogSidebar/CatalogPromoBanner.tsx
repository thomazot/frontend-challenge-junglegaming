export function CatalogPromoBanner() {
  return (
    <div className="flex flex-col border border-border/20 rounded-t-none rounded-b-[22px] overflow-hidden bg-card">
      <div className="p-4 flex flex-col gap-1 text-cente">
        <h4 className="text-primary font-mono text-2xl font-bold uppercase tracking-wider text-left">
          NFT em Destaque
        </h4>
        <h3 className="text-foreground font-mono text-[22px] font-bold uppercase">
          Oferta Limitada
        </h3>
      </div>
      <div className="relative aspect-4/5 w-full overflow-hidden">
        <img
          src="/images/monkey-nft.jpg"
          alt="NFT Promo"
          className="object-cover w-full h-full rounded-[22px]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
