import { useState } from "react";
import { Slider } from "@/shared/ui/slider";
import { Button } from "@/shared/ui/button";

const COLLECTIONS = [
  { label: 'Arte digital', count: 33 },
  { label: 'Fotografia', count: 12 },
  { label: 'Música', count: 65 },
  { label: 'Arte 3D', count: 39 },
  { label: 'Colecionáveis', count: 23 },
  { label: 'Generativa', count: 17 },
  { label: 'Jogos', count: 19 },
  { label: 'Assinaturas', count: 13 },
  { label: 'Utilidade', count: 18 },
];

const NETWORKS = [
  { label: 'Ethereum', count: 119 },
  { label: 'Polygon', count: 78 },
  { label: 'Solana', count: 86 },
];

export function CatalogFilters() {
  const [selectedCol, setSelectedCol] = useState<string>('Arte digital');
  const [priceRange, setPriceRange] = useState([0.02, 12.30]);
  const [selectedNet, setSelectedNet] = useState<string>('Ethereum');

  return (
    <div className="flex flex-col gap-10 bg-card p-6 rounded-none">
      
      {/* Coleções */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Coleções</h3>
        <div className="flex flex-col pl-3 gap-0">
          {COLLECTIONS.map((c) => {
            const isSelected = selectedCol === c.label;
            return (
              <button 
                key={c.label} 
                onClick={() => setSelectedCol(c.label)}
                className="flex items-center justify-between text-[15px] transition-colors text-left font-mono h-10"
              >
                <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>{c.label}</span>
                <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>({c.count})</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Faixa de Preço */}
      <section className="flex flex-col gap-5.5">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Faixa de preço</h3>
        <div className="flex flex-col gap-3 pl-3">
          <Slider 
            defaultValue={[0.02, 12.30]} 
            max={12.3} 
            step={0.01} 
            className="w-full"
            onValueChange={setPriceRange}
          />
          <p className="text-[15px] font-mono text-foreground font-normal">
            Preço: {priceRange[0].toFixed(2).replace('.', ',')} - {priceRange[1].toFixed(2).replace('.', ',')} ETH
          </p>
          <Button variant="primary" className="self-start px-6 h-9 font-mono font-bold text-ink-deep bg-primary hover:bg-primary-dark rounded-lg">
            Aplicar
          </Button>
        </div>
      </section>

      {/* Rede */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono font-bold text-lg leading-4 text-foreground">Rede</h3>
        <div className="flex flex-col pl-3 gap-0">
          {NETWORKS.map((n) => {
            const isSelected = selectedNet === n.label;
            return (
              <button 
                key={n.label} 
                onClick={() => setSelectedNet(n.label)}
                className="flex items-center justify-between text-[15px] transition-colors text-left font-mono h-10"
              >
                <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>{n.label}</span>
                <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>({n.count})</span>
              </button>
            )
          })}
        </div>
      </section>

    </div>
  );
}
