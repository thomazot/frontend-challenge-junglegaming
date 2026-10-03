import { ReactNode } from "react";
import { cn } from "@/shared/utils/utils";

interface CatalogLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  content: ReactNode;
  pagination?: ReactNode;
  className?: string;
}

export function CatalogLayout({ sidebar, header, content, pagination, className }: CatalogLayoutProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 md:px-0 py-8 flex flex-col md:flex-row gap-8", className)}>
      {/* Sidebar (Esquerda) - Escondida no Mobile (será exibida via Sheet no topo) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8">
        {sidebar}
      </aside>

      {/* Conteúdo Principal (Direita) */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="mb-6 flex flex-col gap-4">
          {header}
        </header>
        
        <div className="flex-1">
          {content}
        </div>

        {pagination && (
          <footer className="mt-8 flex justify-center md:justify-end">
            {pagination}
          </footer>
        )}
      </main>
    </div>
  );
}
