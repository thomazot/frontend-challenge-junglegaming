import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export function CatalogHeader() {
  const [activeTab, setActiveTab] = useState("todos");

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
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 bg-transparent border-none outline-none font-mono text-[15px] leading-4 font-medium transition-colors whitespace-nowrap ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {tab.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 w-[80%] h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono text-[15px] font-normal leading-normal text-foreground">Ordenar por:</span>
          <Select defaultValue="recent">
            <SelectTrigger aria-label="Ordenar por" className="w-auto min-w-48 bg-transparent border-none font-mono text-[15px] font-normal leading-normal text-foreground h-auto p-0 focus:ring-0 shadow-none">
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
