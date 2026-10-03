import { Input } from "@/shared/ui/input";
import { Icon } from "@/shared/components/Icon";

export function HeaderMobileSearch() {
  return (
    <div className="flex flex-1 items-center gap-3 bg-card rounded-[10px] px-4 h-11.25 text-muted-foreground">
      <Icon name="search-mobile" />
      <Input
        type="search"
        placeholder="Explorar coleções"
        className="border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 font-mono shadow-none h-full text-sm font-bold"
      />
    </div>
  );
}
