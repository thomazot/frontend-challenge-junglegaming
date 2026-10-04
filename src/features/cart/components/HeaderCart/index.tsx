import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Icon } from "@/shared/components/Icon";

interface HeaderCartProps {
  readonly itemCount?: number;
  readonly hasError?: boolean;
}

export function HeaderCart({ itemCount, hasError = false }: HeaderCartProps) {
  let ariaLabel = "Carrinho";
  if (hasError) ariaLabel = "Carrinho indisponível";
  else if (itemCount) ariaLabel = `Carrinho, ${itemCount} itens`;

  return (
    <Button
      variant="ghostPrimary"
      size="icon"
      className="relative"
      aria-label={ariaLabel}
      title={hasError ? "Não foi possível carregar o carrinho" : undefined}
    >
      <Icon name="cart" className="size-6" />
      {itemCount !== undefined && itemCount > 0 && (
        <Badge className="absolute -right-0.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-transparent bg-primary px-0.5 py-0 text-[10px] text-primary-foreground ring-2 ring-background">
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
