import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/app/routes";
import type { EthString } from "@/shared/lib/eth";
import { formatEth } from "@/shared/lib/eth";
import { Slider } from "@/shared/ui/slider";
import { Button } from "@/shared/ui/button";

interface CatalogFiltersProps {
  collections: { label: string; count: number }[];
  networks: { label: string; count: number }[];
  priceRange: { min: EthString; max: EthString };
}

const toNumber = (value: EthString): number => Number(value);

export function CatalogFilters({ collections, networks, priceRange }: CatalogFiltersProps) {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const boundMin = toNumber(priceRange.min);
  const boundMax = toNumber(priceRange.max);
  const selectedMin = search.minPrice ? toNumber(search.minPrice) : boundMin;
  const selectedMax = search.maxPrice ? toNumber(search.maxPrice) : boundMax;

  const [range, setRange] = useState<[number, number]>([selectedMin, selectedMax]);

  const toggle = (key: "collection" | "network", label: string) => {
    const current = search[key] ?? [];
    const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
    // Any filter change restarts pagination.
    navigate({ search: (prev) => ({ ...prev, [key]: next.length ? next : undefined, page: undefined }), replace: true });
  };

  const applyPrice = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        minPrice: range[0] > boundMin ? String(range[0]) : undefined,
        maxPrice: range[1] < boundMax ? String(range[1]) : undefined,
        page: undefined,
      }),
      replace: true,
    });
  };

  const filterRow = (key: "collection" | "network", label: string, count: number) => {
    const isSelected = (search[key] ?? []).includes(label);
    return (
      <button
        key={label}
        onClick={() => toggle(key, label)}
        aria-pressed={isSelected}
        className="flex items-center justify-between text-[15px] transition-colors text-left font-mono h-10"
      >
        <span className={isSelected ? "text-primary" : "text-muted-foreground"}>{label}</span>
        <span className={isSelected ? "text-primary" : "text-muted-foreground"}>({count})</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-10 bg-card p-6 rounded-none">
      {/* Coleções */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Coleções</h3>
        <div className="flex flex-col pl-3 gap-0">
          {collections.map((c) => filterRow("collection", c.label, c.count))}
        </div>
      </section>

      {/* Faixa de Preço */}
      <section className="flex flex-col gap-5.5">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Faixa de preço</h3>
        <div className="flex flex-col gap-3 pl-3">
          <Slider
            value={range}
            min={boundMin}
            max={boundMax}
            step={0.01}
            className="w-full"
            onValueChange={(value) => setRange(value as [number, number])}
          />
          <p className="text-[15px] font-mono text-foreground font-normal">
            Preço: {formatEth(String(range[0]))} - {formatEth(String(range[1]))} ETH
          </p>
          <Button
            variant="primary"
            onClick={applyPrice}
            className="self-start px-6 h-9 font-mono font-bold rounded-lg"
          >
            Aplicar
          </Button>
        </div>
      </section>

      {/* Rede */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Rede</h3>
        <div className="flex flex-col pl-3 gap-0">{networks.map((n) => filterRow("network", n.label, n.count))}</div>
      </section>
    </div>
  );
}
