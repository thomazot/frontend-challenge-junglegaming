import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/app/routes";
import type { NftSort, NftTab } from "@/shared/api/contracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface CatalogHeaderProps {
  readonly sort?: NftSort;
}

const tabs: { id: NftTab; label: string }[] = [
  { id: "todos", label: "Todos os NFTs" },
  { id: "novos", label: "Novos lançamentos" },
  { id: "alta", label: "Em alta" },
];

export function CatalogHeader({ sort = "recent" }: CatalogHeaderProps) {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const activeTab: NftTab = search.tab ?? "todos";

  const selectTab = (tab: NftTab) => {
    if (tab === activeTab) return;
    navigate({
      search: (prev) => ({ ...prev, tab: tab === "todos" ? undefined : tab, page: undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">

        {/* Custom Tabs to match Header animation */}
        <div className="flex flex-wrap items-center gap-5 border-none" role="tablist" aria-label="Categorias do catálogo">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 bg-transparent border-none outline-none font-mono text-sm leading-4 font-medium transition-colors whitespace-nowrap ${isActive ? "text-primary" : "text-foreground"
                  }`}
              >
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 w-4/5 h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono text-sm font-normal leading-normal text-foreground">Ordenar por:</span>
          <Select
            value={sort}
            onValueChange={(value) =>
              // Sorting change restarts pagination.
              navigate({
                search: (prev) => ({ ...prev, sort: value as NftSort, page: undefined }),
                replace: true,
                resetScroll: false,
              })
            }
          >
            <SelectTrigger
              aria-label="Ordenar por"
              className="w-auto min-w-48 bg-transparent border-none font-mono text-sm font-normal leading-normal text-foreground h-auto p-0 focus:ring-0 shadow-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Listados recentemente</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
