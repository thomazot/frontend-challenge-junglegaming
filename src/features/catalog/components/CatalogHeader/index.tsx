import { useNavigate } from "@tanstack/react-router";
import type { NftSort } from "@/shared/api/contracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface CatalogHeaderProps {
  sort?: NftSort;
}

export function CatalogHeader({ sort = "recent" }: CatalogHeaderProps) {
  const navigate = useNavigate({ from: "/" });

  const tabs = [
    { id: "todos", label: "Todos os NFTs" },
    { id: "novos", label: "Novos lançamentos" },
    { id: "alta", label: "Em alta" },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">

        {/* Custom Tabs to match Header animation */}
        <div className="flex flex-wrap items-center gap-5 border-none">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              aria-pressed={index === 0}
              className={`relative flex flex-col items-center justify-center py-2 bg-transparent border-none outline-none font-mono text-[15px] leading-4 font-medium transition-colors whitespace-nowrap ${
                index === 0 ? "text-primary" : "text-foreground"
              }`}
            >
              {tab.label}
              {index === 0 && <div className="absolute bottom-0 left-0 w-[80%] h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono text-[15px] font-normal leading-normal text-foreground">Ordenar por:</span>
          <Select
            value={sort}
            onValueChange={(value) =>
              // Sorting change restarts pagination.
              navigate({ search: (prev) => ({ ...prev, sort: value as NftSort, page: undefined }), replace: true })
            }
          >
            <SelectTrigger
              aria-label="Ordenar por"
              className="w-auto min-w-48 bg-transparent border-none font-mono text-[15px] font-normal leading-normal text-foreground h-auto p-0 focus:ring-0 shadow-none"
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
