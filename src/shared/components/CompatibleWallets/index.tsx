import { cn } from "cn";

interface CompatibleWalletsProps {
  readonly variant?: "desktop" | "mobile";
  readonly className?: string;
}

export function CompatibleWallets({ variant = "desktop", className }: CompatibleWalletsProps) {
  const isMobile = variant === "mobile";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h4 className={cn("font-bold text-foreground", isMobile ? "text-sm" : "text-lg")}>
        {isMobile ? "Carteiras" : "Carteiras compatíveis"}
      </h4>
      <div className={cn(
        "bg-surface-dark border rounded-lg tracking-widest flex flex-wrap items-center text-muted-foreground",
        isMobile ? "px-3 py-2.5 text-xs justify-center gap-2 w-full border-border/20" : "px-2 py-2 text-xs gap-2 w-fit border-border-soft"
      )}>
        <span className="text-text-accent font-bold">METAMASK</span> • <span className="text-text-accent font-bold">WALLETCONNECT</span> • <span className="text-text-accent font-bold">COINBASE</span>
      </div>
    </div>
  );
}
