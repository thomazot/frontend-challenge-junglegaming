import { useState } from "react";
import { Icon } from "@/shared/components/Icon";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/shared/ui/sheet";
import { CatalogSidebar } from "./CatalogSidebar";

export function CatalogMobileToolbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center gap-4 px-4 pt-6 pb-2 w-full">
      {/* Search Input */}
      <div className="flex-1 flex items-center gap-3 bg-[#2A1A12] rounded-xl px-4 py-3">
        <Icon name="search" className="text-primary w-5 h-5" />
        <input 
          type="text" 
          placeholder="Explorar coleções" 
          className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full font-mono text-sm"
        />
      </div>

      {/* Filter Button (Sheet Trigger) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center justify-center bg-primary rounded-xl w-12 h-12 shrink-0 hover:bg-primary-dark transition-colors">
            <Icon name="filter" className="text-ink-deep w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80 p-0 overflow-y-auto bg-background border-r-border/10">
          <SheetTitle className="sr-only">Filtros do Catálogo</SheetTitle>
          <div className="p-6 pb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold text-primary">Filtros</h2>
            </div>
            <CatalogSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
