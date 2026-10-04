import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "@/shared/components/Logo";
import { Icon } from "@/shared/components/Icon";
import { Button } from "@/shared/ui/button";
import { HeaderSearch } from "@/features/search/components/HeaderSearch";
import { HeaderCart } from "@/features/cart/components/HeaderCart";
import { HeaderMobileSearch } from "@/features/search/components/HeaderMobileSearch";
import { cn } from "cn";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/shared/ui/sheet";
import { CatalogSidebar } from "@/features/catalog/components/CatalogSidebar";
import { useSlidingIndicator } from "@/shared/hooks/useSlidingIndicator";

export function Header() {
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const links = [
    { to: "/", label: "Início" },
    { to: "/mercado", label: "Mercado" },
    { to: "/criadores", label: "Criadores" },
    { to: "/aprenda", label: "Aprenda" },
  ];
  const activeLink = links.find((link) => location.pathname === link.to);
  const { containerRef: navigationRef, indicatorStyle } = useSlidingIndicator(
    activeLink?.to ?? "",
    1,
    !isSearchExpanded,
  );

  return (
    <header className="max-w-300 sticky top-0 z-50 w-full border-b-0 md:border-b border-border bg-background mx-auto px-4 xl:px-0">
      {/* --- DESKTOP HEADER --- */}
      <div className="relative mx-auto hidden h-20 items-center justify-between md:flex">
        {/* Logo */}
        <div className="flex items-center mr-4">
          <Logo />
        </div>

        {/* Navigation Centered */}
        {!isSearchExpanded && (
          <div ref={navigationRef} className="relative flex h-full items-center gap-8">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-sliding-item={link.to}
                  className={`relative flex h-full items-center px-1 text-base font-medium transition-colors font-mono whitespace-nowrap ${isActive
                    ? "text-primary"
                    : "text-foreground hover:text-muted-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-0.75 bg-primary transition-[transform,width] duration-300 ease-in-out motion-reduce:transition-none"
              style={indicatorStyle}
            />
          </div>
        )}

        {/* Actions */}
        <div className={cn('flex items-center gap-7', {
          'flex-[0_1_242px]': !isSearchExpanded,
          'flex-auto justify-end': isSearchExpanded,
        })}>
          <HeaderSearch isExpanded={isSearchExpanded} setIsExpanded={setIsSearchExpanded} />
          <HeaderCart />

          <Button className="ml-2 -mr-1 translate-x-1 px-6">
            <Icon name="logout" set="curved" primaryColor="currentColor" size={24} />
            <span>Entrar</span>
          </Button>
        </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="flex md:hidden mx-auto h-20 items-center px-4 gap-3">
        <HeaderMobileSearch />

        <MobileFilterSheet />
      </div>
    </header>
  );
}

function MobileFilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center bg-primary rounded-xl w-11 h-11 shrink-0 hover:bg-primary-dark transition-colors">
          <Icon name="filter" set="curved" primaryColor="#1E120A" size={24} />
          <span className="sr-only">Filtros</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 sm:w-87.5 p-0 overflow-y-auto bg-background border-r-border/10">
        <SheetTitle className="sr-only">Filtros do Catálogo</SheetTitle>
        <div className="p-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-bold text-primary">Filtros</h2>
          </div>
          <CatalogSidebar onFilterSelect={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
