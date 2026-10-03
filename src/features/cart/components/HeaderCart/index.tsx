import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Icon } from "@/shared/components/Icon";

export function HeaderCart() {
  return (
    <Button variant="ghostPrimary" size="icon" className="relative">
      <Icon name="cart" className="size-6" />
      <Badge
        className="absolute 0 -right-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground border-transparent"
      >
        6
      </Badge>
      <span className="sr-only">Carrinho</span>
    </Button>
  );
}
